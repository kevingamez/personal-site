// The visible trace of what the model does between the question and the answer.
//
// The console used to print a single `[tool] ...` tag and nothing else, so the
// most interesting thing the assistant does - deciding it needs to look
// something up, running the search, coming back - was invisible. Each step here
// renders as a terminal line that is first running, then done.
//
// Steps are aria-hidden: they are progress chrome, and the finished reply is
// already announced once through #console-status.

import { el, escape } from './console-dom'

const LABELS: Record<string, string> = {
  web_search: 'searching the web',
  get_site_data: 'reading site data',
  get_strava_stats: 'reading training stats',
}

// Only the arguments worth showing. A tool with nothing useful to display gets
// its label alone rather than an empty pair of quotes.
function detailFor(name: string, input: unknown): string {
  const arg = input as Record<string, unknown> | null | undefined
  if (name === 'web_search') return typeof arg?.query === 'string' ? arg.query : ''
  if (name === 'get_site_data') return typeof arg?.topic === 'string' ? arg.topic : ''
  return ''
}

export interface Steps {
  thinking: () => void
  // The first token of the reply: the model is answering, so stop claiming it
  // is thinking. Leaves tool steps alone.
  answered: () => void
  toolUse: (name: string, input: unknown) => void
  toolDone: (name: string) => void
  // Called once the turn ends: drops the thinking line and resolves anything
  // still marked running, so an aborted stream never leaves a live spinner.
  settle: () => void
}

// `anchor` is the streaming reply line; every step is inserted above it so the
// answer stays at the bottom where a terminal would put it.
export function createSteps(stream: HTMLElement, anchor: HTMLElement): Steps {
  let thinkingLine: HTMLElement | null = null
  const running: { name: string; node: HTMLElement }[] = []

  const insert = (node: HTMLElement): void => {
    anchor.parentElement?.insertBefore(node, anchor)
    stream.scrollTop = stream.scrollHeight
  }

  const line = (label: string, detail: string): HTMLElement => {
    const node = el('div', 'cs-line cs-step is-run')
    node.setAttribute('aria-hidden', 'true')
    node.innerHTML =
      '<span class="cs-step-mark"></span><span class="cs-step-name">' +
      escape(label) +
      '</span>' +
      (detail ? '<span class="cs-step-detail">' + escape(detail) + '</span>' : '')
    return node
  }

  const finish = (node: HTMLElement): void => {
    node.classList.remove('is-run')
    node.classList.add('is-done')
  }

  const dropThinking = (): void => {
    if (!thinkingLine) return
    thinkingLine.remove()
    thinkingLine = null
  }

  return {
    thinking(): void {
      if (thinkingLine) return
      thinkingLine = line('thinking', '')
      insert(thinkingLine)
    },
    answered: dropThinking,
    toolUse(name, input): void {
      // The model committed to a call, so it is no longer merely thinking.
      dropThinking()
      const node = line(LABELS[name] || name, detailFor(name, input))
      insert(node)
      running.push({ name, node })
    },
    toolDone(name): void {
      // Match the oldest still-running call of that name: the model can fire
      // the same tool twice in a turn, and results come back in order.
      const i = running.findIndex((s) => s.name === name)
      if (i === -1) return
      finish(running[i].node)
      running.splice(i, 1)
    },
    settle(): void {
      dropThinking()
      for (const s of running) finish(s.node)
      running.length = 0
    },
  }
}
