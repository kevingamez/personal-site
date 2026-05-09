// GitHub-style contribution graph on the home page.
// Generates a 7×52 grid of cells with random activity levels.

export function initContribGraph(): void {
  const g = document.getElementById('contrib-graph')
  if (!g) return
  const total = 7 * 52
  for (let i = 0; i < total; i++) {
    const r = Math.random()
    let lvl = 0
    if (r > 0.55) lvl = 1
    if (r > 0.78) lvl = 2
    if (r > 0.9) lvl = 3
    if (r > 0.96) lvl = 4
    if (i % 7 === 0 || i % 7 === 6) {
      if (lvl > 0) lvl = Math.max(0, lvl - 1)
    }
    const d = document.createElement('div')
    d.className = 'day' + (lvl ? ' l' + lvl : '')
    g.appendChild(d)
  }
  const totalEl = document.getElementById('contrib-total')
  if (totalEl) totalEl.textContent = (1100 + Math.floor(Math.random() * 300)).toLocaleString()
}
