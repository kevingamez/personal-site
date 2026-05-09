// Activity bar (left strip, vscode-style). Visual only for most items —
// clicking "search" opens the command palette since that's our search proxy.

import { openPalette } from './palette'

export function initActivityBar(): void {
  const items = document.querySelectorAll<HTMLButtonElement>('.activity-bar .ab-item')
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.dataset.ab
      if (id === 'search') {
        openPalette()
        return
      }
      // Toggle active state visually for explorer/source-control/extensions/settings.
      // (they don't switch panes yet — the explorer pane is the only one wired up,
      // and we always keep it visible. This is just feedback that the click landed.)
      items.forEach((b) => b.classList.toggle('on', b === item))
    })
  })
}
