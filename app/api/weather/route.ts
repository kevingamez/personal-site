// Next.js Route Handler - /api/weather
//
// Current conditions in Bogotá for the hero caption. Proxied through our own
// origin on purpose: the browser only ever talks to `self`, so adding this
// needed no new host in the CSP (`connect-src`) of either vercel.json or
// next.config.ts.
//
// Cached for 15 minutes and shared: the answer is identical for every visitor,
// unlike /api/geo. Open-Meteo needs no key and no attribution header.

export const runtime = 'nodejs'
export const revalidate = 900

// Bogotá, matching the coordinates already published in the JSON-LD.
const LAT = 4.711
const LON = -74.0721

const URL_ =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  '&current=temperature_2m,weather_code&timezone=America%2FBogota'

// WMO weather codes collapsed to the handful of states worth showing in a
// one-line caption. https://open-meteo.com/en/docs
function condition(code: number): string {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly cloudy'
  if (code === 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'showers'
  if (code <= 86) return 'snow'
  return 'storm'
}

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(URL_, { next: { revalidate } })
    if (!res.ok) throw new Error(`open-meteo ${res.status}`)
    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number }
    }
    const tempC = json.current?.temperature_2m
    const code = json.current?.weather_code
    if (typeof tempC !== 'number' || typeof code !== 'number') throw new Error('bad payload')

    return Response.json(
      { tempC: Math.round(tempC), condition: condition(code) },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } }
    )
  } catch {
    // The caption is decorative: fail quiet rather than surface an error.
    return Response.json({ tempC: null, condition: null }, { status: 200 })
  }
}
