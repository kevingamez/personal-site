// Activity bar (left strip, vscode-style). Swaps the side panel between
// Explorer and Source Control; "search" opens the command palette.

import { openPalette } from './palette'

export function initActivityBar(): void {
  const items = document.querySelectorAll<HTMLButtonElement>('.activity-bar .ab-item')
  const explorer = document.querySelector<HTMLElement>('.explorer')
  const sourceControl = document.querySelector<HTMLElement>('#source-control')

  function showPanel(id: string) {
    if (!explorer || !sourceControl) return
    if (id === 'source-control') {
      explorer.hidden = true
      sourceControl.hidden = false
    } else {
      // Default: explorer
      explorer.hidden = false
      sourceControl.hidden = true
    }
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.dataset.ab || 'explorer'
      if (id === 'search') {
        openPalette()
        return
      }
      items.forEach((b) => b.classList.toggle('on', b === item))
      showPanel(id)
    })
  })
}
