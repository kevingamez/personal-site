// Static activity heatmap (no animation). Renders a 7×26 grid once.

export function initHeatmap(): void {
  const hm = document.getElementById('hm')
  if (!hm) return
  const total = 7 * 26
  for (let i = 0; i < total; i++) {
    const r = Math.random()
    let cls = ''
    if (r > 0.45) cls = 'l1'
    if (r > 0.7) cls = 'l2'
    if (r > 0.88) cls = 'l3'
    if (r > 0.97) cls = 'l4'
    const d = document.createElement('div')
    if (cls) d.className = cls
    hm.appendChild(d)
  }
}
