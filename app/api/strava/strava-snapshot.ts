// One place that produces the Strava snapshot: KV cache first, Strava on a
// miss. Shared by the /api/strava route handler and by the home pages, which
// call it during their (ISR) render so the section ships with its data instead
// of fetching it after hydration.

import { unstable_cache } from 'next/cache'

import { cacheGet, cacheSet } from './strava-cache'
import { emptyPayload, shape } from './strava-shape'
import type { Payload } from './strava-shape'
import { fetchActivities, refreshAccessToken } from './strava-token'

export const CACHE_TTL = 600
export const ERROR_TTL = 120
const UNCONFIGURED_TTL = 60
// Upper bound for a page render waiting on Strava. The token and activity
// calls carry their own timeouts; this only stops a slow chain of them from
// holding up the build or a revalidation.
const PAGE_TIMEOUT_MS = 8000

export interface Snapshot {
  payload: Payload
  ttl: number
}

export async function getSnapshot(): Promise<Snapshot> {
  if (
    !process.env.STRAVA_CLIENT_ID ||
    !process.env.STRAVA_CLIENT_SECRET ||
    !process.env.STRAVA_REFRESH_TOKEN
  ) {
    return { payload: emptyPayload({ configured: false }), ttl: UNCONFIGURED_TTL }
  }

  const cached = await cacheGet()
  if (cached) return { payload: cached, ttl: CACHE_TTL }

  try {
    const payload = shape(await fetchActivities(await refreshAccessToken()))
    await cacheSet(payload, CACHE_TTL)
    return { payload, ttl: CACHE_TTL }
  } catch (err) {
    console.error('[api/strava]', err instanceof Error ? err.message : err)
    const payload = emptyPayload({ error: true })
    await cacheSet(payload, ERROR_TTL)
    return { payload, ttl: ERROR_TTL }
  }
}

// For the home pages: the snapshot when there is something to show, else null
// (the client then falls back to fetching /api/strava, as it always did).
async function loadForPage(): Promise<Payload | null> {
  try {
    const snap = await Promise.race([
      getSnapshot(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), PAGE_TIMEOUT_MS)),
    ])
    const p = snap?.payload
    if (!p || !p.configured || p.error || !p.totals || p.totals.count === 0) return null
    return p
  } catch {
    return null
  }
}

// The Upstash client sends its requests with `cache: 'no-store'`, and a
// no-store fetch during a page render opts that page out of ISR: the home page
// would then run this on every request, with none of the route's rate limit in
// front of Strava. Inside the data cache that marking does not apply, and the
// result is shared by both locales for the same 10 minutes.
export const loadHomeStrava = unstable_cache(loadForPage, ['home-strava'], {
  revalidate: CACHE_TTL,
})
