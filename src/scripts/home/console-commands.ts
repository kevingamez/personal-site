// The built-in command table for the home-page console. Each entry writes back
// into the stream via the DOM helpers; `kevin` / `ask` hand off to the AI bridge.

import { type CommandFn, escape, printLines, printOut } from './console-dom'
import { consoleStrings } from './console-i18n'
import { runChat } from './console-chat'
import { enterDevMode } from './dev-transition'

// Resolved per call rather than once at import, so the module stays free of
// DOM reads until a command actually runs.
const S = consoleStrings
const M = () => consoleStrings().msg

function stripHead(raw: string, head: string): string {
  return raw
    .slice(head.length)
    .trim()
    .replace(/^["']|["']$/g, '')
}

export const COMMANDS: Record<string, CommandFn> = {
  help: (_a, r) => {
    printLines(r.stream, S().help)
  },
  whoami: (_a, r) => {
    printOut(r.stream, M().whoami)
  },
  about: (_a, r) => {
    printLines(r.stream, S().about)
  },
  experience: (_a, r) => {
    printLines(r.stream, S().experience)
  },
  cv: (_a, r) => {
    printLines(r.stream, S().experience)
  },
  stack: (_a, r) => {
    printLines(r.stream, S().stack)
  },
  repos: (_a, r) => {
    printLines(r.stream, S().repos)
  },
  now: (_a, r) => {
    printLines(r.stream, S().now)
  },
  contact: (_a, r) => {
    printLines(r.stream, S().contact)
  },
  source: (_a, r) => {
    printLines(r.stream, S().source)
  },
  // The only way into dev mode - nothing on the page links to it anymore.
  dev: (_a, r) => {
    printOut(r.stream, M().devBoot)
    enterDevMode()
  },
  date: (_a, r) => {
    printOut(r.stream, escape(M().date()))
  },
  clear: (_a, r) => {
    r.stream.innerHTML = ''
  },
  echo: (a, r) => {
    printOut(r.stream, escape(a.join(' ')))
  },
  ls: (_a, r) => {
    printOut(r.stream, M().ls)
  },
  cat: (a, r) => {
    const f = (a[0] || '').toLowerCase()
    const s = S()
    const map: Record<string, string[]> = {
      about: s.about,
      experience: s.experience,
      stack: s.stack,
      repos: s.repos,
      now: s.now,
      contact: s.contact,
    }
    if (!f) {
      printOut(r.stream, M().catMissing, 'err')
      return
    }
    const lines = map[f.replace(/\.txt$|\.md$/, '')]
    if (!lines) {
      printOut(r.stream, M().catNoFile(escape(f)), 'err')
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
      printOut(r.stream, M().cdHere)
      return
    }
    printOut(r.stream, M().cdReadOnly(escape(a[0] || '')), 'err')
  },
  uname: (_a, r) => {
    printOut(r.stream, M().uname)
  },
  uptime: (_a, r) => {
    const ms = Date.now() - r.bootTime
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    printOut(r.stream, M().uptime(m, s))
  },
  history: (_a, r) => {
    if (!r.cmdHistory.length) {
      printOut(r.stream, M().historyEmpty)
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
      printOut(r.stream, M().whichMissing, 'err')
      return
    }
    if (COMMANDS[c]) {
      printOut(r.stream, `/usr/local/bin/${escape(c)}`)
    } else {
      printOut(r.stream, M().whichNotFound(escape(c)), 'err')
    }
  },
  man: (a, r) => {
    const c = (a[0] || '').toLowerCase()
    if (!c) {
      printOut(r.stream, M().manMissing, 'err')
      return
    }
    const page = S().man[c]
    if (!page) {
      printOut(r.stream, M().manNone(escape(c)), 'err')
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
      '  790  pts/0    00:00:00 ps',
    ])
  },
  // file-mutating commands - keep the joke gentle; this site is read-only.
  mkdir: (a, r) => {
    const name = a[0] || ''
    if (!name) {
      printOut(r.stream, M().mkdirMissing, 'err')
      return
    }
    printOut(r.stream, M().mkdir(escape(name)), 'err')
  },
  rmdir: (a, r) => {
    printOut(r.stream, M().rmdir(escape(a[0] || '')), 'err')
  },
  touch: (a, r) => {
    printOut(r.stream, M().touch(escape(a[0] || '')), 'err')
  },
  rm: (a, r) => {
    printOut(r.stream, M().rm(escape(a.slice(-1)[0] || '')), 'err')
  },
  mv: (_a, r) => {
    printOut(r.stream, M().mv, 'err')
  },
  cp: (_a, r) => {
    printOut(r.stream, M().cp, 'err')
  },
  sudo: (_a, r) => {
    printOut(r.stream, M().sudo, 'err')
  },
  exit: (_a, r) => {
    printOut(r.stream, M().exit)
  },
  logout: (_a, r) => {
    printOut(r.stream, M().logout)
  },
  kevin: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'kevin')),
  ask: (a, r, h, raw) => runChat(r, h, a.join(' ').trim() || stripHead(raw, 'ask')),
}
