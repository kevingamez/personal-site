// Pure aggregation for /api/strava. Files prefixed with `_` are not turned into
// routes by Vercel, so this is import-only - it keeps the handler under the
// repo's 300-line cap and stays free of any I/O for easy reasoning.

export const WINDOW_DAYS = 133 // 19 weeks - covers the 12-week chart + 18-week heatmap
const WEEKLY_WEEKS = 12
const HEATMAP_WEEKS = 18
const LIST_LIMIT = 5
const EIFFEL_M = 330 // playful elevation yardstick

export interface RawActivity {
  id: number
  name: string
  sport_type?: string
  type?: string
  distance?: number
  moving_time?: number
  total_elevation_gain?: number
  average_speed?: number
  start_date: string
  start_date_local?: string
}

export interface Activity {
  id: number
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  avgSpeedMs: number
  startDate: string
  url: string
}

export interface Payload {
  configured: boolean
  error?: boolean
  generatedAt: string
  totals: {
    distanceM: number
    movingTime: number
    elevationM: number
    count: number
    activeDays: number
  } | null
  weekly: { weekStart: string; distanceM: number }[]
  calendar: { date: string; distanceM: number }[]
  calendarWeeks: number
  insights: {
    longest: {
      name: string
      distanceM: number
      sportType: string
      startDate: string
      url: string
    } | null
    biggestWeekStart: string | null
    biggestWeekDistanceM: number
    busiestWeekday: number | null // 0 = Monday .. 6 = Sunday
    busiestWeekdayCount: number
    avgSpeedMs: number
    eiffels: number
  }
  recent: Activity[]
}

// ───────── date helpers (operate on YYYY-MM-DD strings in UTC) ─────────

function localDate(a: RawActivity): string {
  return (a.start_date_local || a.start_date).slice(0, 10)
}
function mondayOf(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function weekdayMon(date: string): number {
  return (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7
}

// Distil raw Strava activities into the GPS-free, chart-ready shape the browser
// receives. No coordinates, polylines, or locations are ever forwarded.
export function shape(raw: RawActivity[]): Payload {
  const today = new Date().toISOString().slice(0, 10)
  const thisMonday = mondayOf(today)

  let distanceM = 0
  let movingTime = 0
  let elevationM = 0
  const activeDays = new Set<string>()
  const daily = new Map<string, number>()
  const weekdayCount = [0, 0, 0, 0, 0, 0, 0]
  let longest: RawActivity | null = null

  for (const a of raw) {
    const dist = a.distance || 0
    distanceM += dist
    movingTime += a.moving_time || 0
    elevationM += a.total_elevation_gain || 0
    const ld = localDate(a)
    activeDays.add(ld)
    daily.set(ld, (daily.get(ld) || 0) + dist)
    weekdayCount[weekdayMon(ld)]++
    if (!longest || dist > (longest.distance || 0)) longest = a
  }

  // weekly buckets (chronological, last 12 weeks, zero-filled)
  const weekly: { weekStart: string; distanceM: number }[] = []
  const weekIdx = new Map<string, number>()
  for (let i = WEEKLY_WEEKS - 1; i >= 0; i--) {
    const ws = addDays(thisMonday, -7 * i)
    weekIdx.set(ws, weekly.length)
    weekly.push({ weekStart: ws, distanceM: 0 })
  }
  for (const a of raw) {
    const idx = weekIdx.get(mondayOf(localDate(a)))
    if (idx !== undefined) weekly[idx].distanceM += a.distance || 0
  }

  let biggestWeekStart: string | null = null
  let biggestWeekDistanceM = 0
  for (const w of weekly) {
    if (w.distanceM > biggestWeekDistanceM) {
      biggestWeekDistanceM = w.distanceM
      biggestWeekStart = w.weekStart
    }
  }

  let busiestWeekday: number | null = null
  let busiestWeekdayCount = 0
  for (let d = 0; d < 7; d++) {
    if (weekdayCount[d] > busiestWeekdayCount) {
      busiestWeekdayCount = weekdayCount[d]
      busiestWeekday = d
    }
  }

  // heatmap calendar: active days within the 18-week window
  const calStart = addDays(thisMonday, -7 * (HEATMAP_WEEKS - 1))
  const calendar: { date: string; distanceM: number }[] = []
  for (const [date, dist] of daily) {
    if (date >= calStart) calendar.push({ date, distanceM: dist })
  }

  const recent: Activity[] = [...raw]
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, LIST_LIMIT)
    .map((a) => ({
      id: a.id,
      name: a.name,
      sportType: a.sport_type || a.type || 'Workout',
      distanceM: a.distance || 0,
      movingTime: a.moving_time || 0,
      avgSpeedMs: a.average_speed || 0,
      startDate: a.start_date,
      url: `https://www.strava.com/activities/${a.id}`,
    }))

  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    totals: {
      distanceM,
      movingTime,
      elevationM,
      count: raw.length,
      activeDays: activeDays.size,
    },
    weekly,
    calendar,
    calendarWeeks: HEATMAP_WEEKS,
    insights: {
      longest: longest
        ? {
            name: longest.name,
            distanceM: longest.distance || 0,
            sportType: longest.sport_type || longest.type || 'Workout',
            startDate: longest.start_date,
            url: `https://www.strava.com/activities/${longest.id}`,
          }
        : null,
      biggestWeekStart,
      biggestWeekDistanceM,
      busiestWeekday,
      busiestWeekdayCount,
      avgSpeedMs: movingTime > 0 ? distanceM / movingTime : 0,
      eiffels: Math.round(elevationM / EIFFEL_M),
    },
    recent,
  }
}

export function emptyPayload(extra: Partial<Payload> = {}): Payload {
  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    totals: null,
    weekly: [],
    calendar: [],
    calendarWeeks: HEATMAP_WEEKS,
    insights: {
      longest: null,
      biggestWeekStart: null,
      biggestWeekDistanceM: 0,
      busiestWeekday: null,
      busiestWeekdayCount: 0,
      avgSpeedMs: 0,
      eiffels: 0,
    },
    recent: [],
    ...extra,
  }
}
