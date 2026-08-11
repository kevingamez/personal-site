// Response shaping for /api/strava: raw-activity types, encoded-polyline
// decoding, UTC date helpers, and assembly of the sanitized Payload.

const EIFFEL_M = 330
const ROUTE_PTS = 160
const LONGEST_SPORTS = 3

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
  map?: { summary_polyline?: string }
}
interface Route {
  points: number[][]
  w: number
  h: number
}
interface Activity {
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  elevationM: number
  avgSpeedMs: number
  startDate: string
  url: string
  route: Route | null
  polyline: string | null
}
interface Effort {
  name: string
  startDate: string
  url: string
  distanceM: number
  elevationM: number
  avgSpeedMs: number
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
  longestBySport: Activity[]
  insights: {
    biggestWeekStart: string | null
    biggestWeekDistanceM: number
    busiestWeekday: number | null
    busiestWeekdayCount: number
    biggestClimb: Effort | null
    fastest: Effort | null
    eiffels: number
  }
}

// ───────── encoded-polyline → normalized shape ─────────

function decodePolyline(str: string): [number, number][] {
  let index = 0
  let lat = 0
  let lng = 0
  const out: [number, number][] = []
  while (index < str.length) {
    let shift = 0
    let result = 0
    let b: number
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0
    result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    out.push([lat / 1e5, lng / 1e5])
  }
  return out
}
function extractRoute(poly: string | undefined, maxPts: number): Route | null {
  if (!poly) return null
  const pts = decodePolyline(poly)
  if (pts.length < 2) return null
  const meanLat = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const k = Math.cos((meanLat * Math.PI) / 180)
  const proj = pts.map(([la, ln]) => [ln * k, la])
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of proj) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const span = Math.max(maxX - minX, maxY - minY)
  if (span === 0) return null
  const scale = 1000 / span
  const step = Math.max(1, Math.floor(proj.length / maxPts))
  const points: number[][] = []
  for (let i = 0; i < proj.length; i += step) {
    points.push([Math.round((proj[i][0] - minX) * scale), Math.round((maxY - proj[i][1]) * scale)])
  }
  const last = proj[proj.length - 1]
  points.push([Math.round((last[0] - minX) * scale), Math.round((maxY - last[1]) * scale)])
  return { points, w: Math.round((maxX - minX) * scale), h: Math.round((maxY - minY) * scale) }
}

// ───────── date helpers (YYYY-MM-DD strings in UTC) ─────────

const localDate = (a: RawActivity): string => (a.start_date_local || a.start_date).slice(0, 10)
function mondayOf(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
const weekdayMon = (date: string): number => (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7

const toActivity = (a: RawActivity): Activity => ({
  name: a.name,
  sportType: a.sport_type || a.type || 'Workout',
  distanceM: a.distance || 0,
  movingTime: a.moving_time || 0,
  elevationM: a.total_elevation_gain || 0,
  avgSpeedMs: a.average_speed || 0,
  startDate: a.start_date,
  url: `https://www.strava.com/activities/${a.id}`,
  route: extractRoute(a.map?.summary_polyline, ROUTE_PTS),
  polyline: a.map?.summary_polyline ?? null,
})
const toEffort = (a: RawActivity): Effort => ({
  name: a.name,
  startDate: a.start_date,
  url: `https://www.strava.com/activities/${a.id}`,
  distanceM: a.distance || 0,
  elevationM: a.total_elevation_gain || 0,
  avgSpeedMs: a.average_speed || 0,
})

export function shape(raw: RawActivity[]): Payload {
  let distanceM = 0
  let movingTime = 0
  let elevationM = 0
  const activeDays = new Set<string>()
  const weekdayCount = [0, 0, 0, 0, 0, 0, 0]
  const weekMap = new Map<string, number>()
  const bySport = new Map<string, RawActivity>()
  let biggestClimb: RawActivity | null = null
  let fastest: RawActivity | null = null

  for (const a of raw) {
    const dist = a.distance || 0
    distanceM += dist
    movingTime += a.moving_time || 0
    elevationM += a.total_elevation_gain || 0
    const ld = localDate(a)
    activeDays.add(ld)
    weekdayCount[weekdayMon(ld)]++
    weekMap.set(mondayOf(ld), (weekMap.get(mondayOf(ld)) || 0) + dist)
    const sp = a.sport_type || a.type || 'Workout'
    const cur = bySport.get(sp)
    // "Most impressive" per sport = longest by moving time (a 7h ride / 4h trail
    // run reads as a bigger effort than a flat, fast, longer-distance one).
    if (!cur || (a.moving_time || 0) > (cur.moving_time || 0)) bySport.set(sp, a)
    if (!biggestClimb || (a.total_elevation_gain || 0) > (biggestClimb.total_elevation_gain || 0))
      biggestClimb = a
    if (!fastest || (a.average_speed || 0) > (fastest.average_speed || 0)) fastest = a
  }

  let biggestWeekStart: string | null = null
  let biggestWeekDistanceM = 0
  for (const [ws, dist] of weekMap) {
    if (dist > biggestWeekDistanceM) {
      biggestWeekDistanceM = dist
      biggestWeekStart = ws
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

  const longestBySport = [...bySport.values()]
    .filter((a) => (a.moving_time || 0) > 0)
    .sort((a, b) => (b.moving_time || 0) - (a.moving_time || 0))
    .slice(0, LONGEST_SPORTS)
    .map(toActivity)

  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    totals: { distanceM, movingTime, elevationM, count: raw.length, activeDays: activeDays.size },
    longestBySport,
    insights: {
      biggestWeekStart,
      biggestWeekDistanceM,
      busiestWeekday,
      busiestWeekdayCount,
      biggestClimb:
        biggestClimb && (biggestClimb.total_elevation_gain || 0) > 0
          ? toEffort(biggestClimb)
          : null,
      fastest: fastest && (fastest.average_speed || 0) > 0 ? toEffort(fastest) : null,
      eiffels: Math.round(elevationM / EIFFEL_M),
    },
  }
}

export function emptyPayload(extra: Partial<Payload>): Payload {
  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    totals: null,
    longestBySport: [],
    insights: {
      biggestWeekStart: null,
      biggestWeekDistanceM: 0,
      busiestWeekday: null,
      busiestWeekdayCount: 0,
      biggestClimb: null,
      fastest: null,
      eiffels: 0,
    },
    ...extra,
  }
}
