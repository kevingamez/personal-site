// Home-page console section. Default mode is a real shell — built-in
// commands run locally and instantly. The `kevin` / `ask` commands are
// the bridge to the LLM: they POST to /api/chat and stream the reply
// back into the same stream.

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
  let out = escape(s)
  out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  return out
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

function tokenize(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quote: '"' | "'" | null = null
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null
      else cur += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (/\s/.test(ch)) {
      if (cur) (out.push(cur), (cur = ''))
    } else {
      cur += ch
    }
  }
  if (cur) out.push(cur)
  return out
}

function appendCmdLine(stream: HTMLElement, command: string): void {
  const cmdLine = el('div', 'cs-line cs-cmd')
  const host = el('span', 'ci-host', 'kevin@gamez')
  const sep = el('span', 'ci-sep', '~')
  const prompt = el('span', 'ci-prompt', '$')
  const text = el('span', 'cs-cmd-text', command)
  cmdLine.appendChild(host)
  cmdLine.appendChild(sep)
  cmdLine.appendChild(prompt)
  cmdLine.appendChild(text)
  stream.appendChild(cmdLine)
  stream.scrollTop = stream.scrollHeight
}

function printOut(stream: HTMLElement, html: string, kind: 'out' | 'err' = 'out'): HTMLElement {
  const line = el('div', 'cs-line cs-' + kind)
  line.innerHTML = html
  stream.appendChild(line)
  stream.scrollTop = stream.scrollHeight
  return line
}

function printLines(stream: HTMLElement, lines: string[]): void {
  for (const l of lines) printOut(stream, l)
}

// ───────── Built-in commands ─────────

const HELP_LINES = [
  '<b>built-ins</b>',
  '  <span class="ac">help</span>           &nbsp;&nbsp;list commands',
  '  <span class="ac">whoami</span>         &nbsp;&nbsp;one-line bio',
  '  <span class="ac">about</span>          &nbsp;&nbsp;the long version',
  '  <span class="ac">experience</span>     &nbsp;&nbsp;trajectory · roles · dates',
  '  <span class="ac">stack</span>          &nbsp;&nbsp;tools I actually reach for',
  '  <span class="ac">repos</span>          &nbsp;&nbsp;public github repos',
  '  <span class="ac">now</span>            &nbsp;&nbsp;what I’m working on this week',
  '  <span class="ac">contact</span>        &nbsp;&nbsp;email + socials',
  '  <span class="ac">date</span>           &nbsp;&nbsp;current date',
  '  <span class="ac">clear</span>          &nbsp;&nbsp;clear the screen',
  '',
  '<b>ai</b>',
  '  <span class="ac">kevin</span> &lt;question&gt;  &nbsp;ask the LLM (powered by Claude)',
  '  <span class="ac">ask</span> &lt;question&gt;    &nbsp;alias for <span class="ac">kevin</span>',
]

const ABOUT_LINES = [
  "I'm <b>Kevin Gámez</b>, a software engineer from Bogotá.",
  '',
  '<b>now</b> · founding engineer at <span class="ac">enttor</span> — AI outbound, browser automation,',
  '       OpenAI pipelines on Next.js + NestJS + Postgres.',
  '<b>before</b> · founding engineer at <span class="ac">samsam</span> (e-commerce marketplace).',
  '<b>school</b> · M.Sc. + B.Sc. at Universidad de los Andes (deep-learning specialization).',
  '',
  'Type <span class="ac">experience</span> for the full timeline, or',
  '<span class="ac">kevin "your question"</span> to chat with the AI.',
]

const EXPERIENCE_LINES = [
  '<span class="muted">Jun 2025 · now</span>      Founding engineer <span class="at">@ Enttor</span>',
  '                       AI outbound · browser automation · OpenAI pipelines',
  '',
  '<span class="muted">Feb 2024 · Mar 2025</span> Founding engineer <span class="at">@ Samsam</span>',
  '                       E-commerce marketplace · React Native · Next.js',
  '',
  '<span class="muted">Jan 2024 · May 2025</span> M.Sc. Information Engineering <span class="at">@ Uniandes</span>',
  '                       Deep-learning specialization · graduate TA',
  '',
  '<span class="muted">Jan 2019 · Dec 2023</span> B.Sc. Systems and Computing <span class="at">@ Uniandes</span>',
  '                       Andrés Bello National Distinction · AWS certs',
]

const STACK_LINES = [
  '<b>frontend</b>   next.js · react · react native · astro · tailwind',
  '<b>backend </b>   nestjs · postgres · prisma · supabase · inngest',
  '<b>ai / ml </b>   openai · pytorch · opencv · browser automation',
  '<b>infra   </b>   vercel · aws · cloud run · docker',
]

const REPOS_LINES = [
  'kevingamez/<span class="ac">personal-site</span>            <span class="muted">typescript · this page</span>',
  'kevingamez/<span class="ac">AD_ASTRA2023-SpaceInvaders</span>  <span class="muted">python · aerial deforestation, opencv + yolov5</span>',
  'kevingamez/<span class="ac">Palladium_Chat</span>           <span class="muted">typescript</span>',
  'kevingamez/<span class="ac">budget-app</span>               <span class="muted">swift</span>',
  'kevingamez/<span class="ac">GCP-CloudRun</span>             <span class="muted">dockerfile</span>',
  '',
  '→ <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a> · 28 public repos',
]

const NOW_LINES = [
  'building   · <b>eval-as-a-service</b> at enttor — brand-fit evals over an API',
  "reading    · <i>A Mathematician's Apology</i>, Hardy. Slim, beautiful.",
  'thinking   · knot invariants, specifically the Jones polynomial.',
]

const CONTACT_LINES = [
  '<b>email   </b>  <a href="mailto:kevingamez.kg@gmail.com">kevingamez.kg@gmail.com</a>',
  '<b>github  </b>  <a href="https://github.com/kevingamez" target="_blank" rel="noopener">github.com/kevingamez</a>',
  '<b>linkedin</b>  <a href="https://www.linkedin.com/in/kevin-gamez/" target="_blank" rel="noopener">linkedin.com/in/kevin-gamez</a>',
  '<b>x       </b>  <a href="https://x.com/kevin_gamez" target="_blank" rel="noopener">x.com/kevin_gamez</a>',
]

type CommandFn = (
  args: string[],
  refs: Refs,
  history: ChatMessage[],
  raw: string
) => void | Promise<void>

const COMMANDS: Record<string, CommandFn> = {
  help: (_a, r) => {
    printLines(r.stream, HELP_LINES)
  },
  whoami: (_a, r) => {
    printOut(
      r.stream,
      'kevin · founding engineer @ <span class="ac">enttor</span> · <span class="muted">bogotá / utc-5</span>'
    )
  },
  about: (_a, r) => {
    printLines(r.stream, ABOUT_LINES)
  },
  experience: (_a, r) => {
    printLines(r.stream, EXPERIENCE_LINES)
  },
  cv: (_a, r) => {
    printLines(r.stream, EXPERIENCE_LINES)
  },
  stack: (_a, r) => {
    printLines(r.stream, STACK_LINES)
  },
  repos: (_a, r) => {
    printLines(r.stream, REPOS_LINES)
  },
  now: (_a, r) => {
    printLines(r.stream, NOW_LINES)
  },
  contact: (_a, r) => {
    printLines(r.stream, CONTACT_LINES)
  },
  date: (_a, r) => {
    printOut(r.stream, escape(new Date().toString()))
  },
  clear: (_a, r) => {
    r.stream.innerHTML = ''
  },
  echo: (a, r) => {
    printOut(r.stream, escape(a.join(' ')))
  },
  ls: (_a, r) => {
    printOut(
      r.stream,
      'about  experience  stack  repos  now  contact  <span class="muted">(try `cat about`)</span>'
    )
  },
  cat: (a, r) => {
    const f = (a[0] || '').toLowerCase()
    const map: Record<string, string[]> = {
      about: ABOUT_LINES,
      experience: EXPERIENCE_LINES,
      stack: STACK_LINES,
      repos: REPOS_LINES,
      now: NOW_LINES,
      contact: CONTACT_LINES,
    }
    if (!f) {
      printOut(r.stream, 'cat: missing operand · try `cat about`', 'err')
      return
    }
    const lines = map[f.replace(/\.txt$|\.md$/, '')]
    if (!lines) {
      printOut(r.stream, `cat: ${escape(f)}: no such file`, 'err')
      return
    }
    printLines(r.stream, lines)
  },
  sudo: (_a, r) => {
    printOut(
      r.stream,
      '<span class="muted">nice try.</span> kevin is not in the sudoers file.',
      'err'
    )
  },
  exit: (_a, r) => {
    printOut(r.stream, '<span class="muted">there is no exit. you live here now.</span>')
  },
  kevin: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'kevin')),
  ask: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'ask')),
}

function stripHead(raw: string, head: string): string {
  return raw
    .slice(head.length)
    .trim()
    .replace(/^["']|["']$/g, '')
}

// ───────── AI bridge ─────────

async function runChat(refs: Refs, history: ChatMessage[], question: string): Promise<void> {
  if (!question) {
    printOut(refs.stream, '<span class="muted">usage: kevin "your question"</span>', 'err')
    return
  }
  refs.input.disabled = true
  refs.input.classList.add('cs-input-busy')

  const out = printOut(refs.stream, '', 'out')
  out.classList.add('cm-streaming')
  history.push({ role: 'user', content: question })

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
          /* ignore */
        }
      }
    }
    history.push({ role: 'assistant', content: acc })
  } catch {
    const fallback =
      "the backend isn't wired in this preview (set `ANTHROPIC_API_KEY` in vercel). until then I'm just a shell — try `help`."
    if (REDUCE_MOTION) out.innerHTML = mdLite(fallback)
    else {
      const tokens = fallback.split(/(\s+)/)
      let acc = ''
      for (const tok of tokens) {
        acc += tok
        out.innerHTML = mdLite(acc)
        await new Promise((r) => setTimeout(r, 14 + Math.random() * 18))
      }
    }
    history.push({ role: 'assistant', content: fallback })
  } finally {
    out.classList.remove('cm-streaming')
    refs.input.disabled = false
    refs.input.classList.remove('cs-input-busy')
    refs.input.focus()
  }
}

// ───────── Dispatcher + history ─────────

function dispatch(refs: Refs, history: ChatMessage[], raw: string): void | Promise<void> {
  const trimmed = raw.trim()
  if (!trimmed) return
  appendCmdLine(refs.stream, trimmed)
  const [head, ...args] = tokenize(trimmed)
  if (!head) return
  const fn = COMMANDS[head.toLowerCase()]
  if (fn) return fn(args, refs, history, trimmed)
  printOut(
    refs.stream,
    `zsh: command not found: ${escape(head)} · try <span class="ac">help</span>`,
    'err'
  )
}

export function initConsole(): void {
  const refs = getRefs()
  if (!refs) return

  const history: ChatMessage[] = []
  const cmdHistory: string[] = []
  let cmdIdx = 0

  refs.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = refs.input.value
    if (!text.trim()) return
    refs.input.value = ''
    cmdHistory.push(text)
    cmdIdx = cmdHistory.length
    void dispatch(refs, history, text)
  })

  refs.input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (cmdIdx > 0) {
        cmdIdx--
        refs.input.value = cmdHistory[cmdIdx]
        e.preventDefault()
      }
    } else if (e.key === 'ArrowDown') {
      if (cmdIdx < cmdHistory.length - 1) {
        cmdIdx++
        refs.input.value = cmdHistory[cmdIdx]
      } else {
        cmdIdx = cmdHistory.length
        refs.input.value = ''
      }
      e.preventDefault()
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      refs.stream.innerHTML = ''
    }
  })

  refs.suggest.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button')
    if (!btn) return
    const cmd = btn.getAttribute('data-cmd') || btn.textContent?.replace(/^[↳$]\s*/, '') || ''
    if (!cmd) return
    refs.input.value = cmd
    refs.form.requestSubmit()
  })

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      refs.input.focus()
      refs.input.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })
}
