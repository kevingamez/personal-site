// The AI bridge for the console: `kevin` / `ask` POST to /api/chat and stream
// the reply back. Hardened against the failure modes the static shell never
// had: stalled streams, runaway history growth, and untrusted markup.

import { type ChatMessage, type Refs, el, escape, printOut } from './console-dom'

// Cap the conversation the client keeps and sends. Mirrors MAX_HISTORY in
// api/chat.ts so we never send more than the server accepts, and the array
// can't grow without bound across a session.
const MAX_CLIENT_HISTORY = 8
// Abort a stream that goes this long without any bytes, so a stalled connection
// never leaves the input permanently disabled.
const STALL_MS = 30_000

export function mdLite(s: string): string {
  let out = escape(s)
  out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  // escape() has already neutralized quotes and angle brackets, so the captured
  // URL ($2) is safe inside the double-quoted href: a stray quote is now &quot;
  // and cannot break out of the attribute. The regex also forces an http(s)
  // scheme, so no javascript:/data: URLs can slip through.
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  return out
}

// Only one chat request is ever in flight; a new one supersedes the previous.
let activeChat: AbortController | null = null

export function cancelChat(): void {
  if (activeChat) activeChat.abort()
}

// Map a non-streaming error response to an accurate, friendly message instead
// of the old catch-all "backend isn't wired" line.
async function describeError(res: Response): Promise<string> {
  let message = ''
  let code = ''
  try {
    const d = (await res.json()) as { message?: string; error?: string }
    message = d.message || ''
    code = d.error || ''
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 429)
    return message || 'rate limited · daily message cap reached. try tomorrow.'
  if (res.status === 413) return 'this conversation got too long. reload the page to start fresh.'
  if (res.status === 403) return 'this console only answers requests from kevingamez.com.'
  if (res.status === 500 && code === 'no_key')
    return 'the AI backend is not configured here. the shell still works - try `help`.'
  return message || 'could not reach the AI backend. the shell still works - try `help`.'
}

export async function runChat(refs: Refs, history: ChatMessage[], question: string): Promise<void> {
  if (!question) {
    printOut(refs.stream, '<span class="muted">usage: kevin "your question"</span>', 'err')
    return
  }

  // Single in-flight: supersede any previous request before starting a new one.
  if (activeChat) activeChat.abort()
  const controller = new AbortController()
  activeChat = controller

  refs.input.disabled = true
  refs.input.classList.add('cs-input-busy')

  const out = printOut(refs.stream, '', 'out')
  out.classList.add('cm-streaming')

  // Optimistically record the question; we remove this exact turn again if the
  // exchange fails, so a failed attempt never poisons later context.
  const userTurn: ChatMessage = { role: 'user', content: question }
  history.push(userTurn)

  let watchdog: ReturnType<typeof setTimeout> | undefined
  const armWatchdog = (): void => {
    if (watchdog) clearTimeout(watchdog)
    watchdog = setTimeout(() => controller.abort(), STALL_MS)
  }

  let assistant = ''
  let ok = false

  try {
    armWatchdog()
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-MAX_CLIENT_HISTORY) }),
      signal: controller.signal,
    })

    const ctype = res.headers.get('content-type') || ''
    if (!res.ok || !ctype.includes('text/event-stream')) {
      out.textContent = await describeError(res)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('no_stream')
    const decoder = new TextDecoder()
    let buf = ''
    let failed = false
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      armWatchdog()
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (data === '[DONE]') continue
        try {
          const evt = JSON.parse(data)
          if (evt.type === 'text_delta' && typeof evt.text === 'string') {
            assistant += evt.text
            out.innerHTML = mdLite(assistant)
            refs.stream.scrollTop = refs.stream.scrollHeight
          } else if (evt.type === 'tool_use' && evt.name) {
            const tool = el('div', 'cs-line cs-tool')
            tool.innerHTML =
              '<span class="cs-tool-tag">[' +
              escape(String(evt.name)) +
              ']</span> ' +
              escape(String(evt.input?.query || '...'))
            out.parentElement?.insertBefore(tool, out)
            refs.stream.scrollTop = refs.stream.scrollHeight
          } else if (evt.type === 'error' && typeof evt.message === 'string') {
            // Server-side failure mid-stream. Render as plain text (never run an
            // error string through markdown) and don't keep the turn as context.
            const errLine = el('div', 'cs-line cs-err', '[error: ' + evt.message + ']')
            out.parentElement?.insertBefore(errLine, out.nextSibling)
            failed = true
          }
        } catch {
          /* ignore malformed SSE frame */
        }
      }
    }
    ok = !failed && assistant.length > 0
  } catch {
    if (controller.signal.aborted) {
      // Watchdog timeout, Ctrl-C, or superseded by a newer question.
      if (!assistant) out.textContent = 'request interrupted - try again.'
      // else: leave the partial reply on screen.
    } else {
      out.textContent = 'could not reach the AI backend. the shell still works - try `help`.'
    }
  } finally {
    if (watchdog) clearTimeout(watchdog)
    out.classList.remove('cm-streaming')
    if (ok) {
      history.push({ role: 'assistant', content: assistant })
      if (history.length > MAX_CLIENT_HISTORY) {
        history.splice(0, history.length - MAX_CLIENT_HISTORY)
      }
    } else {
      // Drop the exact user turn we optimistically added (indexOf, not pop, so a
      // concurrent superseding request doesn't remove the wrong message).
      const idx = history.indexOf(userTurn)
      if (idx !== -1) history.splice(idx, 1)
    }
    // Only the request that still owns the input restores it; a superseding
    // request has already taken over the busy state.
    if (activeChat === controller) {
      activeChat = null
      refs.input.disabled = false
      refs.input.classList.remove('cs-input-busy')
      refs.input.focus()
    }
  }
}
