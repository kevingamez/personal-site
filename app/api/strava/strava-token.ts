// Strava API I/O for /api/strava: OAuth access-token refresh and the
// paginated full-history activities download (shared hard timeout).

import type { RawActivity } from './strava-shape'

const MAX_PAGES = 10
const STRAVA_TIMEOUT_MS = 8000

export async function refreshAccessToken(): Promise<string> {
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

export async function fetchActivities(token: string): Promise<RawActivity[]> {
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
