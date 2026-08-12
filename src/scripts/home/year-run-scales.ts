// Geometry, scales and the derived facts behind the "year" figure. Kept apart
// from the drawing so each file stays under the 300-line cap.

export type Payload = {
  days: [string, number][]
  projects: [string, string, string, number, boolean][]
  labels: Record<string, string>
}

export type Week = { start: string; total: number }
export type Lane = {
  label: string
  from: string
  to: string
  commits: number
  startedBefore: boolean
}

// canvas
export const W = 1180
export const PAD_L = 148
export const PAD_R = 74
export const CH_TOP = 52
export const CH_H = 158
export const LANE_TOP = CH_TOP + CH_H + 40
export const LANE_H = 23
export const LANE_BAR = 15
export const H_AXIS = 30

export const NS = 'http://www.w3.org/2000/svg'

export const el = (tag: string, attrs: Record<string, string | number> = {}): SVGElement => {
  const n = document.createElementNS(NS, tag)
  for (const k in attrs) n.setAttribute(k, String(attrs[k]))
  return n
}

export const toWeeks = (days: { date: string; count: number }[]): Week[] => {
  const weeks: Week[] = []
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7)
    weeks.push({ start: slice[0].date, total: slice.reduce((a, d) => a + d.count, 0) })
  }
  return weeks
}

export const clampLanes = (projects: Payload['projects'], first: string, last: string): Lane[] =>
  projects
    .map(([label, from, to, commits, startedBefore]) => ({
      label,
      from: from < first ? first : from,
      to: to > last ? last : to,
      commits,
      startedBefore,
    }))
    .filter((p) => p.to >= first && p.from <= last)
    .sort((a, b) => a.from.localeCompare(b.from))

export const makeScales = (weeks: Week[], first: string, last: string) => {
  const N = weeks.length
  const t0 = new Date(first + 'T00:00:00').getTime()
  const t1 = new Date(last + 'T00:00:00').getTime()
  const maxW = Math.max(...weeks.map((w) => w.total)) || 1
  return {
    N,
    xAt: (iso: string): number => {
      const t = new Date(iso + 'T00:00:00').getTime()
      return PAD_L + Math.max(0, Math.min(1, (t - t0) / (t1 - t0))) * (W - PAD_L - PAD_R)
    },
    xw: (i: number): number => PAD_L + (i / (N - 1)) * (W - PAD_L - PAD_R),
    yv: (v: number): number => CH_TOP + CH_H - (v / maxW) * CH_H,
  }
}

// Catmull-Rom to bezier, so the year reads as a run rather than a zigzag.
export const smooth = (pts: [number, number][]): string => {
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    d +=
      ` C ${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6}` +
      ` ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}

export const fmtDay = (iso: string): string =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })

export const fmtMon = (iso: string): string =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en', { month: 'short', year: 'numeric' })

export const weekEnd = (start: string): string =>
  new Date(new Date(start + 'T00:00:00').getTime() + 6 * 864e5).toISOString().slice(0, 10)

export const activeIn = (lanes: Lane[], week: Week): Lane[] =>
  lanes.filter((l) => l.from <= weekEnd(week.start) && l.to >= week.start)

export const longestStreak = (
  days: { date: string; count: number }[]
): { len: number; start: number; end: number } => {
  let best = { len: 0, start: 0, end: 0 }
  let run = 0
  days.forEach((d, i) => {
    if (d.count > 0) {
      run++
      if (run > best.len) best = { len: run, start: i - run + 1, end: i }
    } else run = 0
  })
  return best
}

// Density picks the ramp step, so a short intense burst reads darker than a
// long quiet background project.
export const laneStep = (lane: Lane): string => {
  const spanDays = Math.max(
    1,
    (new Date(lane.to).getTime() - new Date(lane.from).getTime()) / 864e5
  )
  const dens = lane.commits / spanDays
  return dens > 6 ? 'v700' : dens > 2.5 ? 'v600' : dens > 1 ? 'v500' : 'v300'
}

// Only a project that actually starts inside the window can be said to begin
// there; the rest were already running when the chart opens.
export const busiestStarted = (lanes: Lane[]): Lane => {
  const started = lanes.filter((l) => !l.startedBefore)
  const pool = started.length ? started : lanes
  return pool.reduce((a, l) => (l.commits > a.commits ? l : a), pool[0])
}
