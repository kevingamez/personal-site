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
  cmdHistory: string[]
  bootTime: number
}

function getRefs(): Refs | null {
  const stream = document.getElementById('console-stream')
  const form = document.getElementById('console-form') as HTMLFormElement | null
  const input = document.getElementById('console-msg') as HTMLInputElement | null
  const suggest = document.getElementById('console-suggest')
  if (!stream || !form || !input || !suggest) return null
  return { stream, form, input, suggest, cmdHistory: [], bootTime: Date.now() }
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
  '<b>info</b>',
  '  <span class="ac">whoami</span>          one-line bio',
  '  <span class="ac">about</span>           the long version',
  '  <span class="ac">experience</span>      trajectory · roles · dates',
  '  <span class="ac">stack</span>           tools I actually reach for',
  '  <span class="ac">repos</span>           public github repos',
  '  <span class="ac">now</span>             what I’m working on this week',
  '  <span class="ac">contact</span>         email + socials',
  '',
  '<b>files</b>',
  '  <span class="ac">ls</span>              list available "files"',
  '  <span class="ac">cat</span> &lt;name&gt;      print a file (try <span class="ac">cat about</span>)',
  '  <span class="ac">pwd</span>             print working directory',
  '  <span class="ac">cd</span> &lt;dir&gt;        change directory (sort of)',
  '',
  '<b>system</b>',
  '  <span class="ac">date</span>            current date',
  '  <span class="ac">uname</span>           kernel info',
  '  <span class="ac">uptime</span>          how long this tab has been alive',
  '  <span class="ac">history</span>         your command history',
  '  <span class="ac">which</span> &lt;cmd&gt;     where a command lives',
  '  <span class="ac">man</span> &lt;cmd&gt;       what a command does',
  '  <span class="ac">ps</span>              fake processes',
  '  <span class="ac">echo</span> &lt;text&gt;     repeat back',
  '  <span class="ac">clear</span>           clear the screen (also <kbd>Ctrl-L</kbd>)',
  '',
  '<b>ai</b>',
  '  <span class="ac">kevin</span> &lt;question&gt;  ask the LLM (powered by Claude)',
  '  <span class="ac">ask</span>   &lt;question&gt;  alias for <span class="ac">kevin</span>',
  '',
  '<span class="muted">tip · <kbd>Tab</kbd> autocompletes · <kbd>↑</kbd>/<kbd>↓</kbd> for history · <kbd>Ctrl-W/U/K</kbd> to edit · <kbd>Ctrl-C</kbd> to cancel</span>',
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
  pwd: (_a, r) => {
    printOut(r.stream, '/home/kevin')
  },
  cd: (a, r) => {
    const target = (a[0] || '~').replace(/^~/, '/home/kevin')
    if (target === '/home/kevin' || target === '~' || target === '/' || target === '.') {
      printOut(r.stream, '<span class="muted">already there.</span>')
      return
    }
    printOut(
      r.stream,
      `cd: <span class="muted">${escape(a[0] || '')}</span> · this site is mostly read-only. try <span class="ac">ls</span>.`,
      'err'
    )
  },
  uname: (_a, r) => {
    printOut(r.stream, 'Darwin kevingamez.local 25.4.0 arm64')
  },
  uptime: (_a, r) => {
    const ms = Date.now() - r.bootTime
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    printOut(
      r.stream,
      `up ${m}m ${s}s · 1 user · load avg: 0.42, 0.42, 0.42 <span class="muted">(it's a static site)</span>`
    )
  },
  history: (_a, r) => {
    if (!r.cmdHistory.length) {
      printOut(r.stream, '<span class="muted">(empty)</span>')
      return
    }
    printLines(
      r.stream,
      r.cmdHistory.map((c, i) => `  ${String(i + 1).padStart(4, ' ')}  ${escape(c)}`)
    )
  },
  which: (a, r) => {
    const c = (a[0] || '').toLowerCase()
    if (!c) {
      printOut(r.stream, 'which: missing operand', 'err')
      return
    }
    if (COMMANDS[c]) {
      printOut(r.stream, `/usr/local/bin/${escape(c)}`)
    } else {
      printOut(r.stream, `which: ${escape(c)}: not found`, 'err')
    }
  },
  man: (a, r) => {
    const c = (a[0] || '').toLowerCase()
    if (!c) {
      printOut(r.stream, 'man: missing operand · what page do you want?', 'err')
      return
    }
    const page = MAN_PAGES[c]
    if (!page) {
      printOut(r.stream, `No manual entry for ${escape(c)}`, 'err')
      return
    }
    printLines(r.stream, page)
  },
  ps: (_a, r) => {
    printLines(r.stream, [
      '<span class="muted">  PID  TTY      TIME     CMD</span>',
      '    1  ?        00:00:00 next-server',
      '   42  ?        00:00:00 nestjs-api',
      '  108  ?        00:01:12 inngest-worker',
      '  253  ?        00:00:42 puppeteer-instagram',
      '  254  ?        00:00:38 puppeteer-linkedin',
      '  789  pts/0    00:00:00 zsh',
      ' 1337  pts/0    00:00:00 ps',
    ])
  },
  // file-mutating commands — keep the joke gentle; this site is read-only.
  mkdir: (a, r) => {
    const name = a[0] || ''
    if (!name) {
      printOut(r.stream, 'mkdir: missing operand', 'err')
      return
    }
    printOut(
      r.stream,
      `mkdir: cannot create directory ‘${escape(name)}’: <span class="muted">read-only file system. this is a static site, friend.</span>`,
      'err'
    )
  },
  rmdir: (a, r) => {
    printOut(r.stream, `rmdir: ‘${escape(a[0] || '')}’: read-only file system.`, 'err')
  },
  touch: (a, r) => {
    printOut(
      r.stream,
      `touch: cannot touch ‘${escape(a[0] || '')}’: <span class="muted">read-only. but the thought counts.</span>`,
      'err'
    )
  },
  rm: (a, r) => {
    if (a[0] === '-rf' && (a[1] === '/' || a[1] === '/*')) {
      printOut(
        r.stream,
        '<span class="muted">nice try. running on someone else’s machine.</span>',
        'err'
      )
      return
    }
    printOut(
      r.stream,
      `rm: cannot remove ‘${escape(a.slice(-1)[0] || '')}’: <span class="muted">read-only file system.</span>`,
      'err'
    )
  },
  mv: (_a, r) => {
    printOut(r.stream, 'mv: <span class="muted">read-only file system.</span>', 'err')
  },
  cp: (_a, r) => {
    printOut(r.stream, 'cp: <span class="muted">read-only file system.</span>', 'err')
  },
  sudo: (_a, r) => {
    printOut(
      r.stream,
      '<span class="muted">nice try.</span> kevin is not in the sudoers file. <span class="muted">this incident will be reported.</span>',
      'err'
    )
  },
  exit: (_a, r) => {
    printOut(r.stream, '<span class="muted">there is no exit. you live here now.</span>')
  },
  logout: (_a, r) => {
    printOut(r.stream, '<span class="muted">there is no exit. you live here now.</span>')
  },
  kevin: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'kevin')),
  ask: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'ask')),
}

const MAN_PAGES: Record<string, string[]> = {
  help: ['<b>HELP</b>(1)', '  list every command this shell knows.'],
  whoami: ['<b>WHOAMI</b>(1)', '  print a one-line bio.'],
  about: ['<b>ABOUT</b>(1)', '  print the longer bio (~6 lines).'],
  experience: ['<b>EXPERIENCE</b>(1)', '  print the trajectory: roles, dates, education.'],
  stack: ['<b>STACK</b>(1)', '  print the tools I actually reach for.'],
  repos: ['<b>REPOS</b>(1)', '  list public github repos.'],
  now: ['<b>NOW</b>(1)', '  what I’m building / reading / thinking about.'],
  contact: ['<b>CONTACT</b>(1)', '  email + social links.'],
  date: ['<b>DATE</b>(1)', '  print the current date.'],
  uname: ['<b>UNAME</b>(1)', '  print system identity (it lies).'],
  uptime: ['<b>UPTIME</b>(1)', '  how long this tab has been open.'],
  history: ['<b>HISTORY</b>(1)', '  list the commands you’ve typed in this session.'],
  which: [
    '<b>WHICH</b>(1)',
    '  which &lt;cmd&gt;  · where a command lives. (always /usr/local/bin/X.)',
  ],
  man: ['<b>MAN</b>(1)', '  man &lt;cmd&gt;  · short docs for a command.'],
  clear: ['<b>CLEAR</b>(1)', '  clear the screen. <kbd>Ctrl-L</kbd> does the same.'],
  echo: ['<b>ECHO</b>(1)', '  echo &lt;text&gt;  · print text back.'],
  ls: ['<b>LS</b>(1)', '  list available "files" in this fake fs.'],
  cat: [
    '<b>CAT</b>(1)',
    '  cat &lt;name&gt;  · print a file. files: about, experience, stack, repos, now, contact.',
  ],
  pwd: ['<b>PWD</b>(1)', '  print working directory. always /home/kevin.'],
  cd: ['<b>CD</b>(1)', '  cd is mostly decorative — there’s nowhere else to go.'],
  ps: ['<b>PS</b>(1)', '  list (fake) processes.'],
  mkdir: ['<b>MKDIR</b>(1)', '  this fs is read-only. mkdir always fails.'],
  rmdir: ['<b>RMDIR</b>(1)', '  this fs is read-only. rmdir always fails.'],
  touch: ['<b>TOUCH</b>(1)', '  this fs is read-only. touch always fails.'],
  rm: ['<b>RM</b>(1)', '  this fs is read-only. rm always fails (mercifully).'],
  mv: ['<b>MV</b>(1)', '  this fs is read-only.'],
  cp: ['<b>CP</b>(1)', '  this fs is read-only.'],
  sudo: ['<b>SUDO</b>(1)', '  not on my watch.'],
  exit: ['<b>EXIT</b>(1)', '  there is no exit.'],
  logout: ['<b>LOGOUT</b>(1)', '  there is no exit.'],
  kevin: [
    '<b>KEVIN</b>(1)',
    '  kevin &lt;question&gt;  · POST your question to /api/chat and stream back a Claude reply.',
    '  example: <span class="ac">kevin "what does enttor do?"</span>',
  ],
  ask: ['<b>ASK</b>(1)', '  alias for <span class="ac">kevin</span>.'],
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

// ───────── Tab completion ─────────

const CAT_FILES = ['about', 'experience', 'stack', 'repos', 'now', 'contact']

function commonPrefix(strs: string[]): string {
  if (!strs.length) return ''
  let p = strs[0]
  for (const s of strs) {
    while (!s.startsWith(p)) p = p.slice(0, -1)
    if (!p) return ''
  }
  return p
}

function getCompletions(value: string): { matches: string[]; replaceFrom: number } {
  // Determine word boundaries — last whitespace separates words.
  const m = /^(.*\s)?(\S*)$/.exec(value)
  const head = m?.[1] ?? ''
  const last = m?.[2] ?? value
  const replaceFrom = head.length

  // First word → complete from command list.
  if (!head.trim()) {
    const matches = Object.keys(COMMANDS)
      .filter((k) => k.startsWith(last.toLowerCase()))
      .sort()
    return { matches, replaceFrom }
  }

  // Second word for `cat` → file list.
  const firstTok = head.trim().split(/\s+/)[0].toLowerCase()
  if (firstTok === 'cat') {
    const matches = CAT_FILES.filter((f) => f.startsWith(last.toLowerCase()))
    return { matches, replaceFrom }
  }

  // No completion for everything else (e.g. kevin <free text>).
  return { matches: [], replaceFrom }
}

function applyCompletion(refs: Refs): void {
  const value = refs.input.value
  const { matches, replaceFrom } = getCompletions(value)
  if (!matches.length) return
  if (matches.length === 1) {
    const completed = value.slice(0, replaceFrom) + matches[0] + ' '
    refs.input.value = completed
    refs.input.setSelectionRange(completed.length, completed.length)
    return
  }
  const prefix = commonPrefix(matches)
  const lastWord = value.slice(replaceFrom)
  if (prefix && prefix.length > lastWord.length) {
    const partial = value.slice(0, replaceFrom) + prefix
    refs.input.value = partial
    refs.input.setSelectionRange(partial.length, partial.length)
    return
  }
  // Multiple matches with no further common prefix → list them.
  appendCmdLine(refs.stream, value || '')
  printOut(refs.stream, matches.map((m) => `<span class="ac">${escape(m)}</span>`).join('  '))
  // Re-show the prompt with the user's input untouched.
  // (input keeps its value; user can keep typing.)
}

// ───────── Line editing (readline-style) ─────────

function killWordBeforeCursor(input: HTMLInputElement): void {
  const v = input.value
  const c = input.selectionStart ?? v.length
  const before = v.slice(0, c)
  const after = v.slice(c)
  // Strip trailing whitespace, then strip the word.
  const stripped = before.replace(/\s*\S*$/, '')
  input.value = stripped + after
  input.setSelectionRange(stripped.length, stripped.length)
}

function killLine(input: HTMLInputElement): void {
  input.value = ''
  input.setSelectionRange(0, 0)
}

function killToEnd(input: HTMLInputElement): void {
  const c = input.selectionStart ?? 0
  input.value = input.value.slice(0, c)
  input.setSelectionRange(c, c)
}

function moveToStart(input: HTMLInputElement): void {
  input.setSelectionRange(0, 0)
}

function moveToEnd(input: HTMLInputElement): void {
  const e = input.value.length
  input.setSelectionRange(e, e)
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
  let cmdIdx = 0

  refs.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = refs.input.value
    if (!text.trim()) return
    refs.input.value = ''
    refs.cmdHistory.push(text)
    cmdIdx = refs.cmdHistory.length
    void dispatch(refs, history, text)
  })

  refs.input.addEventListener('keydown', (e) => {
    // Tab → completion
    if (e.key === 'Tab') {
      e.preventDefault()
      applyCompletion(refs)
      return
    }
    // History
    if (e.key === 'ArrowUp') {
      if (cmdIdx > 0) {
        cmdIdx--
        refs.input.value = refs.cmdHistory[cmdIdx]
        moveToEnd(refs.input)
        e.preventDefault()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      if (cmdIdx < refs.cmdHistory.length - 1) {
        cmdIdx++
        refs.input.value = refs.cmdHistory[cmdIdx]
        moveToEnd(refs.input)
      } else {
        cmdIdx = refs.cmdHistory.length
        refs.input.value = ''
      }
      e.preventDefault()
      return
    }
    // readline-style line editing — only when Ctrl is held
    if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      const k = e.key.toLowerCase()
      if (k === 'l') {
        e.preventDefault()
        refs.stream.innerHTML = ''
      } else if (k === 'a') {
        e.preventDefault()
        moveToStart(refs.input)
      } else if (k === 'e') {
        e.preventDefault()
        moveToEnd(refs.input)
      } else if (k === 'w') {
        e.preventDefault()
        killWordBeforeCursor(refs.input)
      } else if (k === 'u') {
        e.preventDefault()
        killLine(refs.input)
      } else if (k === 'k') {
        e.preventDefault()
        killToEnd(refs.input)
      } else if (k === 'c') {
        e.preventDefault()
        if (refs.input.value) {
          appendCmdLine(refs.stream, refs.input.value + '^C')
          refs.input.value = ''
        }
      }
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
