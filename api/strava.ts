// Vercel Serverless Function - /api/strava
//
// Serves a sanitized snapshot of recent Strava activity for the home-page
// "movement" section, so the static site can fetch it client-side and render
// near-live data without ever exposing OAuth secrets to the browser.
//
// Runtime note: this uses the classic Node `(req, res)` signature on purpose.
// The Web-handler signature (`export default (req: Request) => Response`) is
// silently invoked as a Node handler on this project, so a returned Response is
// dropped and the request hangs to a 504. Writing to `res` is the reliable path.
//
// Hardening / shape:
//   - Secrets (client id/secret/refresh token) live only in env; the browser
//     only ever receives distilled, GPS-free activity summaries.
//   - Every awaited dependency (Strava, Redis) has a hard timeout, so the
//     function can never hang to a 504 - it always answers in a few seconds.
//   - Edge + Redis cached (~10 min) so a burst of visitors costs Strava at most
//     one token refresh + one activities call per window.
//   - No start_latlng / map polyline / location is ever forwarded (no home leak).
//   - Never 500s the page: missing env or a Strava hiccup degrades to an empty
//     (or last-known) payload with `configured`/`error` flags the client reads.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { Redis } from '@upstash/redis'

export const config = { runtime: 'nodejs' }

// Minimal structural types for the Node serverless req/res Vercel passes in -
// avoids a hard dependency on @vercel/node just for types.
interface Req {
  method?: string
}
interface Res {
  statusCode: number
  setHeader(key: string, value: string): void
  end(body?: string): void
}

// ───────── Tunables ─────────

const WINDOW_DAYS = 28
const LIST_LIMIT = 6
const CACHE_TTL = 600 // seconds - matches the edge s-maxage below
const ERROR_TTL = 120 // shorter window for failures: bounds Strava retries while recovering fast
const CACHE_KEY = 'kg-strava:v1'
const STRAVA_TIMEOUT_MS = 8000
const REDIS_TIMEOUT_MS = 2000

// ───────── Cache (shared Upstash/KV setup with /api/chat) ─────────

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

// Race any promise against a timeout so a slow/hung dependency can't stall the
// whole function. Returns `fallback` if it doesn't settle in time.
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])
}

// ───────── Types ─────────

interface Activity {
  id: number
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  elevationM: number
  avgSpeedMs: number
  startDate: string
  url: string
}

interface Totals {
  distanceM: number
  movingTime: number
  count: number
  activeDays: number
  windowDays: number
}

interface Payload {
  configured: boolean
  error?: boolean
  generatedAt: string
  totals: Totals | null
  activities: Activity[]
}

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

// ───────── Helpers ─────────

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
  const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(STRAVA_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`activities fetch failed: ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('activities fetch returned a non-array body')
  return (data as RawActivity[]).filter((a) => a && typeof a === 'object' && a.id && a.start_date)
}

// Distil raw Strava activities into the GPS-free shape the browser receives.
function shape(raw: RawActivity[]): Payload {
  const sorted = [...raw].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  const days = new Set<string>()
  let distanceM = 0
  let movingTime = 0
  for (const a of sorted) {
    distanceM += a.distance || 0
    movingTime += a.moving_time || 0
    days.add((a.start_date_local || a.start_date).slice(0, 10))
  }

  const activities: Activity[] = sorted.slice(0, LIST_LIMIT).map((a) => ({
    id: a.id,
    name: a.name,
    sportType: a.sport_type || a.type || 'Workout',
    distanceM: a.distance || 0,
    movingTime: a.moving_time || 0,
    elevationM: a.total_elevation_gain || 0,
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
      count: sorted.length,
      activeDays: days.size,
      windowDays: WINDOW_DAYS,
    },
    activities,
  }
}

function errorPayload(): Payload {
  return {
    configured: true,
    error: true,
    generatedAt: new Date().toISOString(),
    totals: null,
    activities: [],
  }
}

// ───────── Handler (classic Node signature) ─────────

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Use GET')
    return
  }

  // Not wired up yet: hand back an inert "unconfigured" payload (short cache so
  // it flips live the moment the env vars land) instead of erroring.
  if (
    !process.env.STRAVA_CLIENT_ID ||
    !process.env.STRAVA_CLIENT_SECRET ||
    !process.env.STRAVA_REFRESH_TOKEN
  ) {
    send(
      res,
      { configured: false, generatedAt: new Date().toISOString(), totals: null, activities: [] },
      60
    )
    return
  }

  // 1. Cache hit - serve straight away (bounds our Strava calls). Guarded by a
  //    timeout so a slow Redis can never stall the response.
  if (redis) {
    const cached = await withTimeout(
      redis.get<Payload>(CACHE_KEY).catch(() => null),
      REDIS_TIMEOUT_MS,
      null
    )
    if (cached) {
      send(res, cached, CACHE_TTL)
      return
    }
  }

  // 2. Live fetch: refresh the access token, pull the window, distil, cache.
  try {
    const token = await refreshAccessToken()
    const raw = await fetchActivities(token)
    const payload = shape(raw)
    if (redis) {
      await withTimeout(
        redis
          .set(CACHE_KEY, payload, { ex: CACHE_TTL })
          .then(() => null)
          .catch(() => null),
        REDIS_TIMEOUT_MS,
        null
      )
    }
    send(res, payload, CACHE_TTL)
  } catch (err) {
    // Degrade gracefully: never break the page over a Strava outage.
    console.error('[api/strava]', err instanceof Error ? err.message : err)
    const payload = errorPayload()
    if (redis) {
      await withTimeout(
        redis
          .set(CACHE_KEY, payload, { ex: ERROR_TTL })
          .then(() => null)
          .catch(() => null),
        REDIS_TIMEOUT_MS,
        null
      )
    }
    send(res, payload, ERROR_TTL)
  }
}
