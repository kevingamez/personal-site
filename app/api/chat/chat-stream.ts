// SSE ReadableStream plumbing for /api/chat: streams the model reply and runs client-tool round-trips.

import Anthropic from '@anthropic-ai/sdk'

import { KEVIN_CONTEXT } from './chat-prompt'
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
      ]
      const MAX_TURNS = 5

      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
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
            } else if (
              event.type === 'content_block_start' &&
              (event.content_block.type === 'tool_use' ||
                event.content_block.type === 'server_tool_use')
            ) {
              send({
                type: 'tool_use',
                name: event.content_block.name,
                input: event.content_block.input,
              })
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
              const output =
                call.name === 'get_strava_stats'
                  ? await runStravaTool()
                  : `Unknown tool: ${call.name}`
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
