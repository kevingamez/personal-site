// The built-in command table for the home-page console. Each entry writes back
// into the stream via the DOM helpers; `kevin` / `ask` hand off to the AI bridge.

import { type CommandFn, escape, printLines, printOut } from './console-dom'
import {
  ABOUT_LINES,
  BIBLIOGRAPHY_LINES,
  CONTACT_LINES,
  EXPERIENCE_LINES,
  HELP_LINES,
  INVARIANTS_LINES,
  MAN_PAGES,
  NOW_LINES,
  PRINCIPLES_LINES,
  PROOF_LINES,
  READING_LINES,
  REPOS_LINES,
  SOURCE_LINES,
  STACK_LINES,
} from './console-data'
import { runChat } from './console-chat'

function stripHead(raw: string, head: string): string {
  return raw
    .slice(head.length)
    .trim()
    .replace(/^["']|["']$/g, '')
}

export const COMMANDS: Record<string, CommandFn> = {
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
  principles: (_a, r) => {
    printLines(r.stream, PRINCIPLES_LINES)
  },
  axioms: (_a, r) => {
    printLines(r.stream, PRINCIPLES_LINES)
  },
  invariants: (_a, r) => {
    printLines(r.stream, INVARIANTS_LINES)
  },
  invariant: (_a, r) => {
    printLines(r.stream, INVARIANTS_LINES)
  },
  proof: (_a, r) => {
    printLines(r.stream, PROOF_LINES)
  },
  lemma: (_a, r) => {
    printLines(r.stream, PROOF_LINES)
  },
  bibliography: (_a, r) => {
    printLines(r.stream, BIBLIOGRAPHY_LINES)
  },
  books: (_a, r) => {
    printLines(r.stream, BIBLIOGRAPHY_LINES)
  },
  reading: (_a, r) => {
    printLines(r.stream, READING_LINES)
  },
  contact: (_a, r) => {
    printLines(r.stream, CONTACT_LINES)
  },
  source: (_a, r) => {
    printLines(r.stream, SOURCE_LINES)
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
      'about  experience  stack  repos  now  principles  reading  contact  <span class="muted">(try `cat about`)</span>'
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
      principles: PRINCIPLES_LINES,
      reading: READING_LINES,
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
      '  404  ?        00:00:00 missing-route',
      '  418  ?        00:00:00 eval-runner',
      '  789  pts/0    00:00:00 zsh',
      ' 1337  pts/0    00:00:00 ps',
    ])
  },
  // file-mutating commands - keep the joke gentle; this site is read-only.
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
