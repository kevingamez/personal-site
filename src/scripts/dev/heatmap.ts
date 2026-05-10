// Real GitHub contribution heatmap. Reads `data-contrib` from #hm — a JSON
// array of per-day level values (0..4) populated at build time from the
// GraphQL contributionCalendar (same source as the home page graph).
// Falls back to a randomized mock if the attribute is missing.

export function initHeatmap(): void {
  const hm = document.getElementById('hm')
  if (!hm) return

  let levels: number[] = []
  try {
    const raw = hm.dataset.contrib
    if (raw) levels = JSON.parse(raw) as number[]
  } catch {
    // ignore - falls through to mock
  }

  // Sidebar grid is 7 rows × 26 cols = 182 cells, packed bottom-up by week.
  // Take the most recent 182 days from the calendar (last column = today).
  const COLS = 26
  const ROWS = 7
  const total = COLS * ROWS

  if (!levels.length) {
    // Mock fallback - pre-existing behavior, used when offline/unauthed at build.
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
    return
  }

  // GraphQL gives ~365 oldest-first. Take last 26 weeks (182 days),
  // align so last cell is today. Layout is column-major (week-by-week).
  const tail = levels.slice(-total)
  // Pad front with 0s if the calendar returned fewer days than expected.
  const grid: number[] = tail.length < total ? Array(total - tail.length).fill(0).concat(tail) : tail

  // Render column-major: for each col, render 7 days (top to bottom = sun..sat).
  const cells: number[] = []
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      cells.push(grid[col * ROWS + row] ?? 0)
    }
  }

  for (const lvl of cells) {
    const d = document.createElement('div')
    if (lvl >= 1 && lvl <= 4) d.className = 'l' + lvl
    hm.appendChild(d)
  }
}
