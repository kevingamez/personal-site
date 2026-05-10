// Activity bar (left strip, vscode-style). Swaps the side panel between
// Explorer and Source Control; "search" opens the command palette.

import { openPalette } from './palette'

export function initActivityBar(): void {
  const items = document.querySelectorAll<HTMLButtonElement>('.activity-bar .ab-item')
  const panels: Record<string, HTMLElement | null> = {
    explorer: document.querySelector<HTMLElement>('.explorer'),
    'source-control': document.querySelector<HTMLElement>('#source-control'),
    profile: document.querySelector<HTMLElement>('#profile'),
    settings: document.querySelector<HTMLElement>('#settings'),
  }

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
      items.forEach((b) => b.classList.toggle('on', b === item))
      showPanel(id in panels ? id : 'explorer')
    })
  })
}
