// Top tab switcher: workspace / scratchpad / changelog. Also wires the
// scratchpad's localStorage persistence and the ⌃1/⌃2/⌃3 shortcuts.

import { PROJECT_NAME, getNode } from './state'
import { mdToHtml } from './markdown'
import { focusInput } from './terminal'
import { track } from '../lib/analytics'

let centerEl: HTMLElement | null = null
let scratchEl: HTMLTextAreaElement | null = null
let changelogBodyEl: HTMLElement | null = null

export type WorkspaceName = 'workspace' | 'scratchpad' | 'changelog'

function renderChangelog(): void {
  if (!changelogBodyEl) return
  const node = getNode([PROJECT_NAME, 'CHANGELOG.md'])
  if (!node || node.type !== 'file') return
  changelogBodyEl.innerHTML = mdToHtml(node.body)
}

export function setWorkspace(name: WorkspaceName): void {
  if (!centerEl) return
  track<{ name: 'workspace_switch'; props: { to: WorkspaceName } }>('workspace_switch', {
    to: name,
  })
  ;(['workspace', 'scratchpad', 'changelog'] as const).forEach((w) =>
    centerEl?.classList.toggle('ws-' + w, w === name)
  )
  const wsTabs = document.querySelectorAll<HTMLElement>('.tabsbar .tab[data-ws]')
  wsTabs.forEach((t) => {
    const matches = t.dataset.ws === name
    t.classList.toggle('on', matches)
    t.classList.toggle('muted', !matches)
  })
  if (name === 'changelog') renderChangelog()
  if (name === 'scratchpad') setTimeout(() => scratchEl?.focus(), 0)
  else if (name === 'workspace') focusInput()
}

export function initWorkspaces(): void {
  centerEl = document.querySelector('.center')
  scratchEl = document.getElementById('scratch') as HTMLTextAreaElement | null
  changelogBodyEl = document.getElementById('changelog-body')

  const wsTabs = document.querySelectorAll<HTMLElement>('.tabsbar .tab[data-ws]')
  wsTabs.forEach((t) =>
    t.addEventListener('click', () => setWorkspace((t.dataset.ws as WorkspaceName) || 'workspace'))
  )

  if (scratchEl) {
    try {
      scratchEl.value =
        localStorage.getItem('dev-scratch') ||
        '// scratch space\n// ⌃1 / ⌃2 / ⌃3 to switch workspaces · saved locally only\n\n'
    } catch {
      // localStorage may be blocked — fall through to placeholder
    }
    scratchEl.addEventListener('input', () => {
      if (!scratchEl) return
      try {
        localStorage.setItem('dev-scratch', scratchEl.value)
      } catch {
        // ignore
      }
    })
  }

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return
    if (e.key === '1') {
      e.preventDefault()
      setWorkspace('workspace')
    } else if (e.key === '2') {
      e.preventDefault()
      setWorkspace('scratchpad')
    } else if (e.key === '3') {
      e.preventDefault()
      setWorkspace('changelog')
    }
  })
}

export function isCenterWorkspace(): boolean {
  return !!centerEl?.classList.contains('ws-workspace')
}
