// Live console section · streams a Claude agent's output as terminal-style
// blocks. Falls back to a friendly mock when /api/chat is unreachable (dev).

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}

function escape(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] || c)
}

function mdLite(s: string): string {
  // Light markdown: **bold**, `code`, [link](url) → safe HTML.
  let out = escape(s)
  out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  return out
}

const MOCK_REPLIES: Record<string, string> = {
  building:
    'founding engineer at **enttor** since jun 2025 — ai outbound at scale. browser automation for instagram & linkedin prospecting, openai pipelines for filtering and dm drafting. stack: `next.js` + `nestjs` + `postgres`, `supabase` for auth/storage, `inngest` for queues, deployed on `vercel`.',
  recent:
    'most-recent public repos:\n  • personal-site (typescript) · 2026-04-04\n  • kevingamez (config) · 2026-03-04\n  • budget-app (swift) · 2026-03-01\n  • palladium_chat (typescript) · 2025-05-17\n  • router (typescript) · 2025-05-11',
  compare:
    '`typescript` is ~33% of his public repos and the language of choice at enttor (next.js, nestjs, prisma).\n`python` is ~27%, used in his m.sc. work on satellite imagery (`opencv`, `yolov5`, `fastapi`) and earlier coursework.\nrule of thumb: ts to ship, python to research.',
  search:
    "i'd hit `web_search` for that — but in this preview the backend isn't wired yet. once anthropic_api_key is set in vercel, you'll see live results with citations.",
}

function mockReply(prompt: string): string {
  const p = prompt.toLowerCase()
  if (/build|now|enttor|working|qu[ée]/.test(p)) return MOCK_REPLIES.building
  if (/recent|repo|github|new|listar|nuevo/.test(p)) return MOCK_REPLIES.recent
  if (/compare|typescript|python|stack|compara|ts vs/.test(p)) return MOCK_REPLIES.compare
  if (/search|web|outbound|startup|busca/.test(p)) return MOCK_REPLIES.search
  return "interesting query — once `anthropic_api_key` is set in vercel, i'll respond for real. for now it's mock replies."
}

async function streamMockReply(target: HTMLElement, full: string): Promise<void> {
  if (REDUCE_MOTION) {
    target.innerHTML = mdLite(full)
    return
  }
  target.classList.add('cm-streaming')
  const tokens = full.split(/(\s+)/)
  let acc = ''
  for (const tok of tokens) {
    acc += tok
    target.innerHTML = mdLite(acc)
    await new Promise((r) => setTimeout(r, 14 + Math.random() * 18))
  }
  target.classList.remove('cm-streaming')
  target.innerHTML = mdLite(full)
}

interface Refs {
  stream: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  suggest: HTMLElement
}

function getRefs(): Refs | null {
  const stream = document.getElementById('console-stream')
  const form = document.getElementById('console-form') as HTMLFormElement | null
  const input = document.getElementById('console-msg') as HTMLInputElement | null
  const suggest = document.getElementById('console-suggest')
  if (!stream || !form || !input || !suggest) return null
  return { stream, form, input, suggest }
}

function appendBlock(stream: HTMLElement, command: string): HTMLElement {
  const block = el('div', 'cs-block')

  const cmdLine = el('div', 'cs-line cs-cmd')
  const host = el('span', 'ci-host', 'kevin@gamez')
  const sep = el('span', 'ci-sep', '~')
  const prompt = el('span', 'ci-prompt', '$')
  const text = el('span', 'cs-cmd-text', command)
  cmdLine.appendChild(host)
  cmdLine.appendChild(sep)
  cmdLine.appendChild(prompt)
  cmdLine.appendChild(text)
  block.appendChild(cmdLine)

  const out = el('div', 'cs-line cs-out')
  block.appendChild(out)

  stream.appendChild(block)
  stream.scrollTop = stream.scrollHeight
  return out
}

function appendTool(stream: HTMLElement, label: string): void {
  const tool = el('div', 'cs-line cs-tool')
  tool.innerHTML = `<span class="cs-tool-tag">[${escape(label.split(' · ')[0])}]</span> ${escape(
    label.split(' · ').slice(1).join(' · ')
  )}`
  stream.appendChild(tool)
  stream.scrollTop = stream.scrollHeight
}

async function run(refs: Refs, text: string, history: ChatMessage[]): Promise<void> {
  refs.input.disabled = true
  refs.input.classList.add('cs-input-busy')

  const out = appendBlock(refs.stream, text)
  out.classList.add('cm-streaming')
  history.push({ role: 'user', content: text })

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })

    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      out.textContent = data.message || 'rate limit'
      out.classList.remove('cm-streaming')
      return
    }

    const ctype = res.headers.get('content-type') || ''
    if (!res.ok || !ctype.includes('text/event-stream')) {
      throw new Error('no_backend')
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('no_stream')
    const decoder = new TextDecoder()
    let acc = ''
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
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
            acc += evt.text
            out.innerHTML = mdLite(acc)
            refs.stream.scrollTop = refs.stream.scrollHeight
          } else if (evt.type === 'tool_use' && evt.name) {
            const lbl = `${evt.name} · ${evt.input?.query ? `"${evt.input.query}"` : '...'}`
            // Insert tool call BEFORE current output line
            const tool = el('div', 'cs-line cs-tool')
            tool.innerHTML = `<span class="cs-tool-tag">[${escape(evt.name)}]</span> ${escape(
              evt.input?.query || '...'
            )}`
            out.parentElement?.insertBefore(tool, out)
            refs.stream.scrollTop = refs.stream.scrollHeight
          } else if (evt.type === 'error' && evt.message) {
            acc += '\n\n[error: ' + evt.message + ']'
            out.innerHTML = mdLite(acc)
          }
        } catch {
          /* ignore malformed events */
        }
      }
    }
    history.push({ role: 'assistant', content: acc })
  } catch {
    const reply = mockReply(text)
    await streamMockReply(out, reply)
    history.push({ role: 'assistant', content: reply })
  } finally {
    out.classList.remove('cm-streaming')
    refs.input.disabled = false
    refs.input.classList.remove('cs-input-busy')
    refs.input.focus()
  }
}

export function initConsole(): void {
  const refs = getRefs()
  if (!refs) return

  const history: ChatMessage[] = []

  refs.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = refs.input.value.trim()
    if (!text) return
    refs.input.value = ''
    void run(refs, text, history)
  })

  refs.suggest.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const btn = target.closest<HTMLButtonElement>('button')
    if (!btn) return
    const prompt = btn.getAttribute('data-prompt') || btn.textContent?.replace(/^↳\s*/, '') || ''
    if (!prompt) return
    void run(refs, prompt, history)
  })

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      refs.input.focus()
      refs.input.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })
}
