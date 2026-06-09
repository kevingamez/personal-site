// Vercel Serverless Function - /api/geo
//
// Returns the visitor's ISO-3166 country from Vercel's edge geo headers so the
// client can pick a unit system (metric vs imperial) by *actual location*
// rather than browser locale - a Colombian on an en-US browser should still see
// kilometers.
//
// Per-request and deliberately uncached: the value is specific to the caller,
// so it must never land in a shared CDN/Redis cache (unlike /api/strava).
//
// Platform note: classic Node `(req, res)` signature - the Web-handler form is
// invoked as a Node handler here and 504s (same as the sibling functions).

export const config = { runtime: 'nodejs' }

interface Req {
  method?: string
  headers: Record<string, string | string[] | undefined>
}
interface Res {
  statusCode: number
  setHeader(key: string, value: string): void
  end(body?: string): void
}

function header(req: Req, name: string): string | null {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null)
}

export default function handler(req: Req, res: Res): void {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end('Use GET')
    return
  }

  const raw = header(req, 'x-vercel-ip-country')
  const country = raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // Per-visitor value: a shared cache would leak the first caller's country to
  // everyone, so it is never stored.
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ country }))
}
