// Terminal: line output, input handling, and terminal tab switcher.
// Owns the addLine/err/clear primitives the command map writes through.

import { pathDisplay, state } from './state'
import { esc } from './highlight'
import { buildCommands, tokenize, type CommandMap } from './commands'
import { renderExplorer, renderOutline } from './explorer'
import { makeBuildLoop, makeTailLoop } from './build-stream'

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
  if (commands[cmd]) {
    try {
      commands[cmd](args)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      err(cmd + ': ' + msg)
    }
  } else {
    err('zsh: command not found: ' + cmd + '  · try help')
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
  addLine('<span class="pr">' + esc(pathDisplay(state.cwd)) + ' $</span> <span class="cu"></span>')
  input.value = ''
  renderExplorer()
  renderOutline()
}

export function focusInput(): void {
  setTimeout(() => input?.focus(), 0)
}

let buildLoop: { start(): void; stop(): void } | null = null
let tailLoop: { start(): void; stop(): void } | null = null
let termBuildEl: HTMLElement | null = null
let termTailEl: HTMLElement | null = null
let termInputEl: HTMLElement | null = null

export function setTerminal(name: 'zsh' | 'build' | 'tail'): void {
  const termTabs = document.querySelectorAll<HTMLElement>('.term-tabs .tt[data-term]')
  termTabs.forEach((t) => t.classList.toggle('on', t.dataset.term === name))
  if (term) term.hidden = name !== 'zsh'
  if (termInputEl) termInputEl.hidden = name !== 'zsh'
  if (termBuildEl) termBuildEl.hidden = name !== 'build'
  if (termTailEl) termTailEl.hidden = name !== 'tail'
  if (name === 'build') buildLoop?.start()
  else buildLoop?.stop()
  if (name === 'tail') tailLoop?.start()
  else tailLoop?.stop()
  if (name === 'zsh') focusInput()
}

export function initTerminal(): CommandMap {
  term = document.getElementById('term')
  input = document.getElementById('cmd') as HTMLInputElement | null
  promptEl = document.getElementById('prompt')
  terminalEl = document.querySelector('.terminal')
  termBuildEl = document.getElementById('term-build')
  termTailEl = document.getElementById('term-tail')
  termInputEl = document.querySelector('.term-input')

  commands = buildCommands(addLine, err, clearTerm)

  if (termBuildEl) buildLoop = makeBuildLoop(termBuildEl)
  if (termTailEl) tailLoop = makeTailLoop(termTailEl)

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

  const termTabs = document.querySelectorAll<HTMLElement>('.term-tabs .tt[data-term]')
  termTabs.forEach((t) =>
    t.addEventListener('click', () =>
      setTerminal((t.dataset.term as 'zsh' | 'build' | 'tail') || 'zsh')
    )
  )

  return commands
}

export function resetTerminal(): void {
  clearTerm()
  updatePrompt()
}
