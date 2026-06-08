// Vercel Serverless Function - /api/strava
//
// Serves a sanitized snapshot of recent Strava activity for the home-page
// "movement" section, so the static site can fetch it client-side and render
// near-live data without ever exposing OAuth secrets to the browser.
//
// Hardening / shape:
//   - Secrets (client id/secret/refresh token) live only in env; the browser
//     only ever receives distilled, GPS-free activity summaries.
//   - Edge + Redis cached (~10 min) so a burst of visitors costs Strava at most
//     one token refresh + one activities call per window - well under its rate
//     limits, no matter how many people hit the page.
//   - No start_latlng / map polyline / location is ever forwarded (no home leak).
//   - Never 500s the page: missing env or a Strava hiccup degrades to an empty
//     (or last-known) payload with `configured`/`error` flags the client reads.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { Redis } from '@upstash/redis'

export const config = { runtime: 'nodejs' }

// ───────── Tunables ─────────

const WINDOW_DAYS = 28
const LIST_LIMIT = 6
const CACHE_TTL = 600 // seconds - matches the edge s-maxage below
const ERROR_TTL = 120 // shorter window for failures: bounds Strava retries while still recovering fast
const CACHE_KEY = 'kg-strava:v1'

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

function json(body: Payload, maxAge: number): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    },
  })
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
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`activities fetch failed: ${res.status}`)
  const data = await res.json()
  // A 200 with a non-array body means something is wrong upstream (rate limit,
  // proxy, format change). Throw so the caller's catch flags + caches it as an
  // error instead of silently rendering "no activity".
  if (!Array.isArray(data)) throw new Error('activities fetch returned a non-array body')
  // Drop anything missing the fields shape() relies on.
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

// ───────── Handler ─────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response('Use GET', { status: 405 })

  // Not wired up yet: hand back an inert "unconfigured" payload (short cache so
  // it flips live the moment the env vars land) instead of erroring.
  if (
    !process.env.STRAVA_CLIENT_ID ||
    !process.env.STRAVA_CLIENT_SECRET ||
    !process.env.STRAVA_REFRESH_TOKEN
  ) {
    return json(
      { configured: false, generatedAt: new Date().toISOString(), totals: null, activities: [] },
      60
    )
  }

  // 1. Cache hit - serve straight away (this is what bounds our Strava calls).
  if (redis) {
    try {
      const cached = await redis.get<Payload>(CACHE_KEY)
      if (cached) return json(cached, CACHE_TTL)
    } catch {
      /* Redis hiccup - fall through to a live fetch */
    }
  }

  // 2. Live fetch: refresh the access token, pull the window, distil, cache.
  try {
    const token = await refreshAccessToken()
    const raw = await fetchActivities(token)
    const payload = shape(raw)
    if (redis) {
      try {
        await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL })
      } catch {
        /* caching is best-effort */
      }
    }
    return json(payload, CACHE_TTL)
  } catch (err) {
    // Degrade gracefully: never break the page over a Strava outage. Cache the
    // failure briefly so a sustained outage can't make every request re-hit
    // Strava's auth/activities endpoints; the edge still serves the last good
    // response via stale-while-revalidate in the meantime.
    console.error('[api/strava]', err)
    const errorPayload: Payload = {
      configured: true,
      error: true,
      generatedAt: new Date().toISOString(),
      totals: null,
      activities: [],
    }
    if (redis) {
      try {
        await redis.set(CACHE_KEY, errorPayload, { ex: ERROR_TTL })
      } catch {
        /* caching is best-effort */
      }
    }
    return json(errorPayload, ERROR_TTL)
  }
}
