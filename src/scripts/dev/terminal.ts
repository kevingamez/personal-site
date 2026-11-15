// Terminal: line output and input handling.
// Owns the addLine/err/clear primitives the command map writes through.

import { pathDisplay, state } from './state'
import { esc } from './highlight'
import { buildCommands, tokenize, type CommandMap } from './commands'
import { renderExplorer, renderOutline } from './explorer'
import { track } from '../lib/analytics'

let term: HTMLElement | null = null
let input: HTMLInputElement | null = null
let promptEl: HTMLElement | null = null
let terminalEl: HTMLElement | null = null
let commands: CommandMap | null = null

export function addLine(html: string): void {
  if (!term) return
  const div = document.createElement('div')
  div.className = 'ln'
  div.innerHTML =
    '<span class="gut">' + ++state.lineNum + '</span><span class="txt">' + html + '</span>'
  term.appendChild(div)
  term.scrollTop = term.scrollHeight
}

export function err(msg: string): void {
  addLine('<span class="ye">' + esc(msg) + '</span>')
}

function clearCursor(): void {
  if (!term) return
  term.querySelectorAll('.cu').forEach((c) => c.remove())
}

function clearTerm(): void {
  if (!term) return
  term.innerHTML = ''
  state.lineNum = 0
}

export function updatePrompt(): void {
  if (promptEl) promptEl.textContent = pathDisplay(state.cwd) + ' $'
}

function run(cmdLine: string): void {
  const [cmd, ...args] = tokenize(cmdLine)
  if (!cmd || !commands) return
  track<{ name: 'terminal_command'; props: { command: string } }>('terminal_command', {
    // Only known command names leave the page, never free text typed here.
    command: commands[cmd] ? cmd : 'unknown',
  })
  if (commands[cmd]) {
    try {
      commands[cmd](args)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      err(cmd + ': ' + msg)
    }
  } else {
    err('zsh: command not found: ' + cmd + ' , try help')
  }
}

export function submit(v: string): void {
  if (!input) return
  clearCursor()
  addLine(
    '<span class="pr">' +
      esc(pathDisplay(state.cwd)) +
      ' $</span> <span class="cmd">' +
      esc(v) +
      '</span>'
  )
  state.history.push(v)
  state.historyIdx = state.history.length
  run(v.trim())
  // No trailing prompt-with-cursor in the history. The interactive input row
  // below already shows the active prompt; doubling it reads as two terminals.
  input.value = ''
  renderExplorer()
  renderOutline()
}

// preventScroll is load-bearing: init() focuses the prompt on page load, and
// below 880px the window stacks and the document scrolls (see base.css), so a
// plain focus() dropped phones halfway down the page, at the terminal. On
// desktop the window is fixed to the viewport, so nothing changes there.
export function focusInput(): void {
  setTimeout(() => input?.focus({ preventScroll: true }), 0)
}

let termInputEl: HTMLElement | null = null

/** One real shell. The synthetic build and log tabs that used to sit beside
    it are gone, so this only has to bring the prompt back into focus. */
export function setTerminal(): void {
  if (term) term.hidden = false
  if (termInputEl) termInputEl.hidden = false
  focusInput()
}

export function initTerminal(): CommandMap {
  term = document.getElementById('term')
  input = document.getElementById('cmd') as HTMLInputElement | null
  promptEl = document.getElementById('prompt')
  terminalEl = document.querySelector('.terminal')
  termInputEl = document.querySelector('.term-input')

  commands = buildCommands(addLine, err, clearTerm)

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (!input) return
      if (e.key === 'Enter') {
        const v = input.value
        if (!v.trim()) return
        submit(v)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (state.historyIdx > 0) {
          state.historyIdx--
          input.value = state.history[state.historyIdx]
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (state.historyIdx < state.history.length - 1) {
          state.historyIdx++
          input.value = state.history[state.historyIdx]
        } else {
          state.historyIdx = state.history.length
          input.value = ''
        }
      } else if ((e.key === 'l' || e.key === 'L') && e.ctrlKey) {
        e.preventDefault()
        commands?.clear([])
      }
    })
  }

  if (terminalEl) terminalEl.addEventListener('click', () => input?.focus())

  if (term) {
    term.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (!t || !t.dataset) return
      if (t.dataset.cd) submit('cd ' + t.dataset.cd)
      else if (t.dataset.cat) submit('cat ' + t.dataset.cat)
    })
  }

  return commands
}

export function resetTerminal(): void {
  clearTerm()
  updatePrompt()
}
