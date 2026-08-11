// Next.js Route Handler - /api/geo
//
// Returns the visitor's ISO-3166 country from Vercel's edge geo headers so the
// client can pick a unit system (metric vs imperial) by *actual location*
// rather than browser locale - a Colombian on an en-US browser should still see
// kilometers.
//
// Per-request and deliberately uncached: the value is specific to the caller,
// so it must never land in a shared CDN/Redis cache (unlike /api/strava).
//
// Platform note: App Router Web-handler form (a single exported GET; other
// methods get the framework's automatic 405 with an `Allow: GET` header).

export const runtime = 'nodejs'
// Reads per-request headers; never prerender or share a cached response.
export const dynamic = 'force-dynamic'

export function GET(req: Request): Response {
  const raw = req.headers.get('x-vercel-ip-country')
  const country = raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null

  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Per-visitor value: a shared cache would leak the first caller's country
      // to everyone, so it is never stored.
      'Cache-Control': 'no-store',
    },
  })
}
