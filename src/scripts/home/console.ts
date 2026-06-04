// Home-page console section. Default mode is a real shell - built-in commands
// run locally and instantly (see ./console-commands). The `kevin` / `ask`
// commands bridge to the LLM (see ./console-chat). This module wires the DOM:
// refs, tab-completion, readline-style editing, and the submit/keydown handlers.

import {
  type ChatMessage,
  type Refs,
  appendCmdLine,
  escape,
  printOut,
  tokenize,
} from './console-dom'
import { CAT_FILES } from './console-data'
import { COMMANDS } from './console-commands'
import { cancelChat } from './console-chat'

function getRefs(): Refs | null {
  const stream = document.getElementById('console-stream')
  const form = document.getElementById('console-form') as HTMLFormElement | null
  const input = document.getElementById('console-msg') as HTMLInputElement | null
  const suggest = document.getElementById('console-suggest')
  if (!stream || !form || !input || !suggest) return null
  return { stream, form, input, suggest, cmdHistory: [], bootTime: Date.now() }
}

// ───────── Tab completion ─────────

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
  // Determine word boundaries - last whitespace separates words.
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
    // readline-style line editing - only when Ctrl is held
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
        // Clear a typed-but-unsent line (readline ^C). Cancelling an in-flight
        // request is handled at the document level below, since the input is
        // disabled (and thus can't fire keydown) while a request is running.
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
      return
    }
    // Ctrl-C cancels an in-flight chat stream. runChat disables the input while
    // a request runs, so the input's own keydown can't fire - handle it here.
    // Don't preventDefault, and skip when text is selected, so Ctrl-C still
    // copies normally; cancelChat() is a no-op when nothing is streaming.
    if (
      e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.shiftKey &&
      e.key.toLowerCase() === 'c' &&
      (window.getSelection()?.toString() ?? '') === ''
    ) {
      cancelChat()
    }
  })
}
