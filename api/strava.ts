// Vercel Serverless Function - /api/strava
//
// Serves a sanitized, chart-ready snapshot of recent Strava activity for the
// home-page "movement" section, so the static site can fetch it client-side and
// render near-live data without ever exposing OAuth secrets to the browser.
//
// Two hard-won platform notes baked into this file:
//   1. Classic Node `(req, res)` signature - the Web-handler form is invoked as
//      a Node handler here, its returned Response is dropped, and the request
//      hangs to a 504. Writing to `res` is the reliable path.
//   2. Everything lives in this one file (over the 300-line cap on purpose):
//      Vercel strips `_`-prefixed helpers AND won't reliably bundle imported
//      siblings, so a split lib 500s with ERR_MODULE_NOT_FOUND at runtime.
//
// Hardening: every awaited dependency (Strava, Redis) has a hard timeout, so the
// function can never hang to a 504; secrets live only in env; no GPS/polyline/
// location is ever forwarded; missing env or a Strava hiccup degrades to an
// inert payload instead of erroring.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { Redis } from '@upstash/redis'

export const config = { runtime: 'nodejs' }

// Minimal structural types for the Node serverless req/res Vercel passes in.
interface Req {
  method?: string
}
interface Res {
  statusCode: number
  setHeader(key: string, value: string): void
  end(body?: string): void
}

const WINDOW_DAYS = 133 // 19 weeks - covers the 12-week chart + 18-week heatmap
const WEEKLY_WEEKS = 12
const HEATMAP_WEEKS = 18
const LIST_LIMIT = 5
const EIFFEL_M = 330 // playful elevation yardstick
const CACHE_TTL = 600 // seconds - matches the edge s-maxage below
const ERROR_TTL = 120
const CACHE_KEY = 'kg-strava:v2'
const STRAVA_TIMEOUT_MS = 8000
const REDIS_TIMEOUT_MS = 2000

// ───────── Types ─────────

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
}
interface Activity {
  id: number
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  avgSpeedMs: number
  startDate: string
  url: string
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

// ───────── date helpers (YYYY-MM-DD strings in UTC) ─────────

const localDate = (a: RawActivity): string => (a.start_date_local || a.start_date).slice(0, 10)
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
const weekdayMon = (date: string): number => (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7

// Distil raw Strava activities into the GPS-free, chart-ready shape the browser
// receives. No coordinates, polylines, or locations are ever forwarded.
function shape(raw: RawActivity[]): Payload {
  const thisMonday = mondayOf(new Date().toISOString().slice(0, 10))

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
    totals: { distanceM, movingTime, elevationM, count: raw.length, activeDays: activeDays.size },
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

function emptyPayload(extra: Partial<Payload>): Payload {
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
  const after = Math.floor(Date.now() / 1000) - WINDOW_DAYS * 86400
  const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(STRAVA_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`activities fetch failed: ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('activities fetch returned a non-array body')
  return (data as RawActivity[]).filter((a) => a && typeof a === 'object' && a.id && a.start_date)
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
