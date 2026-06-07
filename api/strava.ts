// Vercel Serverless Function - /api/strava
//
// Serves a sanitized snapshot of the full Strava history for the home
// "movement" section: all-time totals, the longest effort per sport (each with
// a route polyline for an optional Mapbox map), and a few insight metrics.
//
// Platform notes baked in: classic Node `(req, res)` signature (the Web-handler
// form is invoked as a Node handler here and 504s); everything in one file
// (Vercel strips `_`-prefixed helpers and won't bundle imported siblings).
//
// Privacy: only the featured longest efforts carry a raw polyline (for the map
// the user opted into). Hard timeouts on every awaited call so it can't hang.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { Redis } from '@upstash/redis'

export const config = { runtime: 'nodejs' }

interface Req {
  method?: string
}
interface Res {
  statusCode: number
  setHeader(key: string, value: string): void
  end(body?: string): void
}

const MAX_PAGES = 10
const EIFFEL_M = 330
const ROUTE_PTS = 160
const LONGEST_SPORTS = 3
const CACHE_TTL = 600
const ERROR_TTL = 120
const CACHE_KEY = 'kg-strava:v4'
const STRAVA_TIMEOUT_MS = 8000
const REDIS_TIMEOUT_MS = 2000

interface RawActivity {
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
interface Payload {
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

function shape(raw: RawActivity[]): Payload {
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

function emptyPayload(extra: Partial<Payload>): Payload {
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

// ───────── cache + I/O ─────────

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = (() => {
  if (!kvUrl || !kvToken) return null
  try {
    return new Redis({ url: kvUrl, token: kvToken })
  } catch {
    return null
  }
})()

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])
}

function send(res: Res, body: Payload, maxAge: number): void {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=86400`)
  res.end(JSON.stringify(body))
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    }),
    signal: AbortSignal.timeout(STRAVA_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`token refresh failed: ${res.status}`)
  const data = (await res.json()) as { access_token?: string } | null
  if (!data || typeof data !== 'object' || !data.access_token) {
    throw new Error('token refresh returned no access_token')
  }
  return data.access_token
}

async function fetchActivities(token: string): Promise<RawActivity[]> {
  // Full history (no `after`): paginate newest-first until a short page. Capped
  // at MAX_PAGES so a huge account can't hang the function.
  const all: RawActivity[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(STRAVA_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`activities fetch failed: ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('activities fetch returned a non-array body')
    for (const a of data as RawActivity[]) {
      if (a && typeof a === 'object' && a.id && a.start_date) all.push(a)
    }
    if (data.length < 200) break
  }
  return all
}

async function cacheGet(): Promise<Payload | null> {
  if (!redis) return null
  return withTimeout(
    redis.get<Payload>(CACHE_KEY).catch(() => null),
    REDIS_TIMEOUT_MS,
    null
  )
}
async function cacheSet(payload: Payload, ttl: number): Promise<void> {
  if (!redis) return
  await withTimeout(
    redis
      .set(CACHE_KEY, payload, { ex: ttl })
      .then(() => null)
      .catch(() => null),
    REDIS_TIMEOUT_MS,
    null
  )
}

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Use GET')
    return
  }

  if (
    !process.env.STRAVA_CLIENT_ID ||
    !process.env.STRAVA_CLIENT_SECRET ||
    !process.env.STRAVA_REFRESH_TOKEN
  ) {
    send(res, emptyPayload({ configured: false }), 60)
    return
  }

  const cached = await cacheGet()
  if (cached) {
    send(res, cached, CACHE_TTL)
    return
  }

  try {
    const payload = shape(await fetchActivities(await refreshAccessToken()))
    await cacheSet(payload, CACHE_TTL)
    send(res, payload, CACHE_TTL)
  } catch (err) {
    console.error('[api/strava]', err instanceof Error ? err.message : err)
    const payload = emptyPayload({ error: true })
    await cacheSet(payload, ERROR_TTL)
    send(res, payload, ERROR_TTL)
  }
}
