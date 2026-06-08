// Vercel Serverless Function - /api/strava
//
// Serves a sanitized, chart-ready snapshot of recent Strava activity for the
// home-page "movement" section, so the static site can fetch it client-side and
// render near-live data without ever exposing OAuth secrets to the browser.
//
// Runtime note: this uses the classic Node `(req, res)` signature on purpose.
// The Web-handler signature (`export default (req: Request) => Response`) is
// silently invoked as a Node handler on this project, so a returned Response is
// dropped and the request hangs to a 504. Writing to `res` is the reliable path.
//
// Hardening: every awaited dependency (Strava, Redis) has a hard timeout, so the
// function can never hang to a 504; secrets live only in env; no GPS/polyline/
// location is ever forwarded; missing env or a Strava hiccup degrades to an
// inert payload instead of erroring.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { Redis } from '@upstash/redis'
import { shape, emptyPayload, WINDOW_DAYS, type Payload, type RawActivity } from './_strava-lib'

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

const CACHE_TTL = 600 // seconds - matches the edge s-maxage below
const ERROR_TTL = 120
const CACHE_KEY = 'kg-strava:v2'
const STRAVA_TIMEOUT_MS = 8000
const REDIS_TIMEOUT_MS = 2000

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
    const token = await refreshAccessToken()
    const payload = shape(await fetchActivities(token))
    await cacheSet(payload, CACHE_TTL)
    send(res, payload, CACHE_TTL)
  } catch (err) {
    console.error('[api/strava]', err instanceof Error ? err.message : err)
    const payload = emptyPayload({ error: true })
    await cacheSet(payload, ERROR_TTL)
    send(res, payload, ERROR_TTL)
  }
}
