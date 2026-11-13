// Activity bar (left strip, vscode-style). Swaps the side panel between
// Explorer and Source Control; "search" opens the command palette.
//
// Below 880px the layout stacks and the side panel is a drawer (see
// mobile.css): the page ships with .side-closed on .app, tapping an icon opens
// its panel, and tapping the active icon again closes it. Desktop has no
// styles for .side-closed, so the class is inert there.

import { openPalette } from './palette'

export function initActivityBar(): void {
  const items = document.querySelectorAll<HTMLButtonElement>('.activity-bar .ab-item')
  const panels: Record<string, HTMLElement | null> = {
    explorer: document.querySelector<HTMLElement>('.explorer'),
    'source-control': document.querySelector<HTMLElement>('#source-control'),
    profile: document.querySelector<HTMLElement>('#profile'),
    settings: document.querySelector<HTMLElement>('#settings'),
  }

  const app = document.querySelector<HTMLElement>('.app')
  const stacked = window.matchMedia('(width <= 880px)')

  // Picking a file closes the drawer so the editor it opened in is on screen.
  panels.explorer?.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('.it.file')) {
      app?.classList.add('side-closed')
    }
  })

  function showPanel(id: string): void {
    for (const [key, el] of Object.entries(panels)) {
      if (!el) continue
      el.hidden = key !== id
    }
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.dataset.ab || 'explorer'
      if (id === 'search') {
        openPalette()
        return
      }
      if (id === 'extensions') return // no dedicated panel yet
      if (stacked.matches && item.classList.contains('on')) {
        app?.classList.toggle('side-closed')
        return
      }
      app?.classList.remove('side-closed')
      items.forEach((b) => b.classList.toggle('on', b === item))
      showPanel(id in panels ? id : 'explorer')
    })
  })
}
