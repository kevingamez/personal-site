// Pure DOM builders for the Strava section's visuals: a hero sparkline, the
// weekly-distance bar chart, and the training heatmap. No data fetching here -
// the orchestrator (strava.ts) feeds these already-distilled numbers and wires
// up the scroll-triggered `.on` animations.

export interface Week {
  weekStart: string
  distanceM: number
}
export interface Day {
  date: string
  distanceM: number
}

const div = (cls: string): HTMLDivElement => {
  const el = document.createElement('div')
  el.className = cls
  return el
}

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function mondayOf(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
function shortDate(date: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  )
}

// ───────── hero sparkline (mini weekly bars on the dark band) ─────────

export function buildSparkline(host: HTMLElement, weekly: Week[]): void {
  const max = Math.max(1, ...weekly.map((w) => w.distanceM))
  const frag = document.createDocumentFragment()
  weekly.forEach((w, i) => {
    const b = div('sv-sb')
    b.style.setProperty('--h', (w.distanceM / max).toFixed(3))
    b.style.setProperty('--i', String(i))
    frag.appendChild(b)
  })
  host.replaceChildren(frag)
}

// ───────── weekly distance bar chart ─────────

export function buildWeekly(
  host: HTMLElement,
  weekly: Week[],
  opts: { lang: string; weekOf: string; peakEl: HTMLElement | null }
): void {
  if (!weekly.length) return
  const max = Math.max(1, ...weekly.map((w) => w.distanceM))
  let peak = 0
  weekly.forEach((w, i) => {
    if (w.distanceM > weekly[peak].distanceM) peak = i
  })
  const mfmt = new Intl.DateTimeFormat(opts.lang, { month: 'short', timeZone: 'UTC' })

  const frag = document.createDocumentFragment()
  let prevMonth = ''
  weekly.forEach((w, i) => {
    const col = div('sv-bcol')
    const bar = div(
      'sv-bar' +
        (i === peak && w.distanceM > 0 ? ' is-peak' : '') +
        (w.distanceM === 0 ? ' is-rest' : '')
    )
    bar.style.setProperty('--h', (w.distanceM / max).toFixed(3))
    bar.style.setProperty('--i', String(i))
    bar.title = `${(w.distanceM / 1000).toFixed(1)} km · ${opts.weekOf} ${shortDate(w.weekStart, opts.lang)}`
    col.appendChild(bar)

    const m = mfmt.format(new Date(w.weekStart + 'T00:00:00Z'))
    const tick = document.createElement('span')
    tick.className = 'sv-bx'
    tick.textContent = m !== prevMonth ? m : ''
    prevMonth = m
    col.appendChild(tick)
    frag.appendChild(col)
  })
  host.replaceChildren(frag)

  if (opts.peakEl) {
    const pk = weekly[peak]
    opts.peakEl.textContent =
      pk.distanceM > 0
        ? `${(pk.distanceM / 1000).toFixed(0)} km · ${shortDate(pk.weekStart, opts.lang)}`
        : ''
  }
}

// ───────── training heatmap (coral, GitHub-style) ─────────

function level(dist: number, max: number): string {
  if (dist <= 0) return 'l0'
  const r = dist / max
  return r < 0.25 ? 'l1' : r < 0.5 ? 'l2' : r < 0.75 ? 'l3' : 'l4'
}

export function buildHeatmap(host: HTMLElement, calendar: Day[], weeks: number): void {
  const map = new Map(calendar.map((c) => [c.date, c.distanceM]))
  const max = Math.max(1, ...calendar.map((c) => c.distanceM))
  const today = new Date().toISOString().slice(0, 10)
  const start = addDays(mondayOf(today), -(weeks - 1) * 7)

  const frag = document.createDocumentFragment()
  for (let c = 0; c < weeks; c++) {
    const colEl = div('sv-hcol')
    for (let r = 0; r < 7; r++) {
      const date = addDays(start, c * 7 + r)
      const cell = div('sv-hd')
      cell.style.setProperty('--col', String(c))
      if (date > today) {
        cell.classList.add('is-empty')
      } else {
        const dist = map.get(date) || 0
        cell.classList.add(level(dist, max))
        cell.title = dist > 0 ? `${(dist / 1000).toFixed(1)} km · ${date}` : date
      }
      colEl.appendChild(cell)
    }
    frag.appendChild(colEl)
  }
  host.replaceChildren(frag)
}
