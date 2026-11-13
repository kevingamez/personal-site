// The AI bridge for the console: `kevin` / `ask` POST to /api/chat and stream
// the reply back. Hardened against the failure modes the static shell never
// had: stalled streams, runaway history growth, and untrusted markup.

import { type ChatMessage, type Refs, el, escape, printOut } from './console-dom'
import { consoleStrings } from './console-i18n'
import { createSteps } from './console-steps'

// Request caps, mirrored from app/api/chat/chat-schema.ts (MAX_HISTORY,
// MAX_MESSAGE_CHARS, MAX_ASSISTANT_CHARS, MAX_TOTAL_CHARS). The server rejects
// the whole request if any one is exceeded, and the history persists across
// turns, so one oversized reply used to break every later question. We fit the
// history to these before sending instead.
export const MAX_CLIENT_HISTORY = 8
export const MAX_USER_CHARS = 2000
export const MAX_ASSISTANT_CHARS = 4000
export const MAX_TOTAL_CHARS = 12_000
// Abort a stream that goes this long without any bytes, so a stalled connection
// never leaves the input permanently disabled.
const STALL_MS = 30_000

// Clip a finished reply to the assistant cap before it becomes history. The
// screen keeps the full text; only the context echoed back is shortened.
export function clipReply(s: string): string {
  if (s.length <= MAX_ASSISTANT_CHARS) return s
  let end = MAX_ASSISTANT_CHARS - 1
  // Never split a surrogate pair.
  const code = s.charCodeAt(end - 1)
  if (code >= 0xd800 && code <= 0xdbff) end--
  return s.slice(0, end) + '…'
}

// The slice of history to send: at most MAX_CLIENT_HISTORY messages, oldest
// dropped first until the total fits, always starting on a user turn.
export function fitHistory(history: ChatMessage[]): ChatMessage[] {
  const msgs = history
    .slice(-MAX_CLIENT_HISTORY)
    .map((m) => (m.role === 'assistant' ? { ...m, content: clipReply(m.content) } : m))
  let total = msgs.reduce((s, m) => s + m.content.length, 0)
  while (msgs.length > 1 && (total > MAX_TOTAL_CHARS || msgs[0].role !== 'user')) {
    const dropped = msgs.shift()
    if (dropped) total -= dropped.content.length
  }
  return msgs
}

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
  // The server words its own messages in English, so they are only passed
  // through on the English page.
  const t = consoleStrings().chat
  const english = !document.documentElement.lang.toLowerCase().startsWith('es')
  if (res.status === 429 && code === 'busy') return t.busy
  if (res.status === 429) return (english && message) || t.rateLimited
  if (res.status === 413) return t.conversationTooLong
  if (res.status === 403) return t.forbidden
  if (res.status === 500 && code === 'no_key') return t.notConfigured
  return (english && message) || t.unreachable
}

// Failures and usage hints go to the live status node too: the visible stream
// is aria-live="off", so without this they would only ever be seen.
function say(refs: Refs, text: string): void {
  if (refs.status) refs.status.textContent = text
}

export async function runChat(refs: Refs, history: ChatMessage[], question: string): Promise<void> {
  if (!question) {
    printOut(
      refs.stream,
      `<span class="muted">${escape(consoleStrings().chat.usage)}</span>`,
      'err'
    )
    say(refs, consoleStrings().chat.usage)
    return
  }
  if (question.length > MAX_USER_CHARS) {
    printOut(
      refs.stream,
      `<span class="muted">${escape(consoleStrings().chat.tooLong(MAX_USER_CHARS))}</span>`,
      'err'
    )
    say(refs, consoleStrings().chat.tooLong(MAX_USER_CHARS))
    return
  }

  // Single in-flight: supersede any previous request before starting a new one.
  if (activeChat) activeChat.abort()
  const controller = new AbortController()
  activeChat = controller

  refs.input.disabled = true
  refs.input.classList.add('cs-input-busy')
  // Clear any prior announcement so an identical reply still re-announces.
  if (refs.status) refs.status.textContent = ''

  const out = printOut(refs.stream, '', 'out')
  out.classList.add('cm-streaming')
  // Show the work: a thinking line goes up immediately, then one line per tool
  // call, so the wait reads as an agent working instead of a frozen prompt.
  const steps = createSteps(refs.stream, out)
  steps.thinking()

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
    // Trailing slash matches next.config.ts `trailingSlash: true`. A 308 keeps
    // the method and body, so this worked, but it cost a round trip in front of
    // the first streamed token.
    const res = await fetch('/api/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: fitHistory(history) }),
      signal: controller.signal,
    })

    const ctype = res.headers.get('content-type') || ''
    if (!res.ok || !ctype.includes('text/event-stream')) {
      out.textContent = await describeError(res)
      say(refs, out.textContent)
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
          const evt = JSON.parse(data) as {
            type?: string
            text?: string
            name?: string
            input?: unknown
            message?: string
          }
          if (evt.type === 'text_delta' && typeof evt.text === 'string') {
            // First token: the model is answering, so the thinking line goes.
            steps.answered()
            assistant += evt.text
            out.innerHTML = mdLite(assistant)
            refs.stream.scrollTop = refs.stream.scrollHeight
          } else if (evt.type === 'tool_use' && evt.name) {
            steps.toolUse(String(evt.name), evt.input)
          } else if (evt.type === 'tool_done' && evt.name) {
            steps.toolDone(String(evt.name))
          } else if (evt.type === 'error' && typeof evt.message === 'string') {
            // Server-side failure mid-stream. Render as plain text (never run an
            // error string through markdown) and don't keep the turn as context.
            const errLine = el('div', 'cs-line cs-err', consoleStrings().chat.error(evt.message))
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
      if (!assistant) {
        out.textContent = consoleStrings().chat.interrupted
        say(refs, out.textContent)
      }
      // else: leave the partial reply on screen.
    } else {
      out.textContent = consoleStrings().chat.unreachable
      say(refs, out.textContent)
    }
  } finally {
    if (watchdog) clearTimeout(watchdog)
    steps.settle()
    out.classList.remove('cm-streaming')
    if (ok) {
      // Announce the complete reply once, as plain text, to the live status node
      // (the visible stream is aria-live="off" to avoid a per-token flood).
      if (refs.status) refs.status.textContent = assistant
      history.push({ role: 'assistant', content: clipReply(assistant) })
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
