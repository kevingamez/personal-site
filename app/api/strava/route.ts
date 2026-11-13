// Next.js Route Handler - /api/strava
//
// Serves a sanitized snapshot of the full Strava history for the home
// "movement" section: all-time totals, the longest effort per sport (each with
// a route polyline for an optional Mapbox map), the most recent activity, and
// a few insight metrics.
//
// Platform notes baked in: App Router Web-handler form (a single exported GET;
// other methods get the framework's automatic 405); response shaping lives in
// ./strava-shape, Strava I/O in ./strava-token, KV caching in ./strava-cache.
//
// Privacy: the featured longest efforts and the latest activity carry a raw
// polyline (for the maps the user opted into); private activities never
// qualify for either. Hard timeouts on every awaited call so it can't hang.
//
// Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Optional env (shared with /api/chat): UPSTASH/KV REST url + token for caching.

import { getSnapshot } from './strava-snapshot'
import type { Payload } from './strava-shape'
import { limitRoute } from '@/lib/api-rate-limit'

export const runtime = 'nodejs'
// The original serverless function ran on every request; never prerender.
export const dynamic = 'force-dynamic'

function send(body: Payload, maxAge: number): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    },
  })
}

export async function GET(req: Request): Promise<Response> {
  // Strava allows 200 requests per 15 minutes and 2,000 per day. A cache miss
  // spends one, so an unlimited route can burn the whole app's quota.
  const limited = await limitRoute(req, 'strava', { limit: 30, window: '10 m' })
  if (limited) return limited

  const { payload, ttl } = await getSnapshot()
  return send(payload, ttl)
}
