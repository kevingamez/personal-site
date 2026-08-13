// SSE ReadableStream plumbing for /api/chat: streams the model reply and runs client-tool round-trips.

import Anthropic from '@anthropic-ai/sdk'

import { KEVIN_CONTEXT } from './chat-prompt'
import { SITE_TOOL, runSiteTool } from './chat-site'
import { STRAVA_TOOL, runStravaTool } from './chat-strava'

export function createChatStream(
  req: Request,
  apiKey: string,
  convo: Anthropic.MessageParam[]
): ReadableStream<Uint8Array> {
  const client = new Anthropic({ apiKey })
  const abort = new AbortController()
  // Client disconnect: Next aborts req.signal the way Node fires req 'close' -
  // stop the Anthropic stream (and billing) the moment the browser goes away.
  req.signal.addEventListener('abort', () => abort.abort())

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Writes never throw out of the streaming task: once the client disconnects
      // the controller rejects enqueues, and we just stop instead of crashing.
      const send = (event: Record<string, unknown>): void => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          closed = true // client disconnected - nothing to do
        }
      }

      // The model's tools: Anthropic's hosted web_search (run server-side, inline)
      // plus our client-executed get_strava_stats. A client tool pauses the turn
      // with stop_reason 'tool_use'; we run it, feed the result back, and continue
      // streaming. MAX_TURNS bounds tool round-trips so a loop can't run away.
      const tools = [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 2,
        } as unknown as Anthropic.Tool,
        STRAVA_TOOL,
        SITE_TOOL,
      ]
      const MAX_TURNS = 5

      // A tool block arrives as a start event with an EMPTY input, then the
      // arguments stream in as input_json_delta fragments. Emitting on start
      // therefore shipped `{}` to the console, which is why a web search always
      // rendered as "..." instead of the query. Buffer per block index and emit
      // once the block closes and the JSON is whole.
      const pending = new Map<number, { name: string; json: string }>()

      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          pending.clear()
          const modelStream = client.messages.stream(
            {
              model: 'claude-sonnet-4-5',
              max_tokens: 512,
              system: KEVIN_CONTEXT,
              tools,
              messages: convo,
            },
            // Propagate client disconnects so we stop generating (and billing) the
            // moment the browser goes away.
            { signal: abort.signal }
          )

          for await (const event of modelStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              send({ type: 'text_delta', text: event.delta.text })
            } else if (event.type === 'content_block_delta' && pending.has(event.index)) {
              if (event.delta.type === 'input_json_delta') {
                const slot = pending.get(event.index)
                if (slot) slot.json += event.delta.partial_json
              }
            } else if (event.type === 'content_block_start') {
              const block = event.content_block
              if (block.type === 'tool_use' || block.type === 'server_tool_use') {
                pending.set(event.index, { name: block.name, json: '' })
              } else if (block.type === 'web_search_tool_result') {
                // Hosted tool: Anthropic runs it inline, so its result block
                // arriving is the only signal the console gets that it finished.
                send({ type: 'tool_done', name: 'web_search' })
              }
            } else if (event.type === 'content_block_stop') {
              const slot = pending.get(event.index)
              if (slot) {
                pending.delete(event.index)
                let input: unknown = {}
                try {
                  input = slot.json ? JSON.parse(slot.json) : {}
                } catch {
                  /* partial JSON on an aborted block - send the call anyway */
                }
                send({ type: 'tool_use', name: slot.name, input })
              }
            }
          }

          const final = await modelStream.finalMessage()

          // A long server-tool turn (web_search) can ask to continue without a
          // client tool: echo its content back and keep the same turn going.
          if (final.stop_reason === 'pause_turn') {
            convo.push({
              role: 'assistant',
              content: final.content as Anthropic.ContentBlockParam[],
            })
            continue
          }

          // The turn paused for our client tool(s). web_search is a server tool that
          // Anthropic resolves inline, so it never surfaces here.
          const calls = final.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
          )
          if (final.stop_reason === 'tool_use' && calls.length) {
            const results: Anthropic.ToolResultBlockParam[] = []
            for (const call of calls) {
              let output: string
              if (call.name === 'get_strava_stats') {
                output = await runStravaTool()
              } else if (call.name === 'get_site_data') {
                output = runSiteTool(call.input)
              } else {
                output = `Unknown tool: ${call.name}`
              }
              send({ type: 'tool_done', name: call.name })
              results.push({ type: 'tool_result', tool_use_id: call.id, content: output })
            }
            convo.push({
              role: 'assistant',
              content: final.content as Anthropic.ContentBlockParam[],
            })
            convo.push({ role: 'user', content: results })
            continue
          }

          // end_turn / max_tokens / stop_sequence: the reply is complete.
          break
        }
        send({ type: 'done' })
        if (!closed) {
          try {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch {
            closed = true
          }
        }
      } catch (err) {
        // A client abort is expected, not an error. For anything else, log the real
        // cause server-side and hand the client a generic message (never leak internals).
        if (!abort.signal.aborted) {
          console.error('[api/chat] stream error:', err)
          send({ type: 'error', message: 'Sorry, something went wrong generating a reply.' })
        }
      } finally {
        if (!closed) {
          closed = true
          try {
            controller.close()
          } catch {
            /* already canceled - nothing to do */
          }
        }
      }
    },
    cancel() {
      // Consumer went away (client disconnect): stop enqueuing and stop the model.
      closed = true
      abort.abort()
    },
  })

  return stream
}
