// Locale routing by country.
//
// This is Next 16's `proxy` file convention, which replaces `middleware`: the
// older name still runs but the build prints a deprecation. It also has to sit
// at the project root, not under `src/`, because `app/` is at the root and
// Next only looks in `src/` for projects whose app directory lives there.
//
// The nav no longer carries an EN/ES switcher, so the site picks for the
// visitor: a request for `/` from a Spanish-speaking country is sent to `/es/`,
// and everything else stays on English. English is the default whenever the
// country is unknown, malformed, or simply not on the list, which covers
// crawlers, VPNs, local development and every country we do not publish a
// translation for.
//
// Only `/` is ever redirected. `/es/` is never bounced anywhere, so the
// Spanish page stays directly reachable by URL, and a visitor who lands there
// on purpose keeps it.
//
// The redirect is 307 (temporary) on purpose: `/` must stay the canonical
// English URL for search engines. Googlebot crawls mostly from US addresses,
// so it sees English at `/`, matching the `x-default` hreflang the pages
// already emit.

import { NextResponse, type NextRequest } from 'next/server'

// ISO 3166-1 alpha-2 codes where Spanish is an official or co-official
// language. Puerto Rico is included (a US territory, but Spanish-speaking) and
// so is Equatorial Guinea. Belize is not: its official language is English.
const SPANISH_SPEAKING = new Set([
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // Dominican Republic
  'EC', // Ecuador
  'ES', // Spain
  'GQ', // Equatorial Guinea
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // Mexico
  'NI', // Nicaragua
  'PA', // Panama
  'PE', // Peru
  'PR', // Puerto Rico
  'PY', // Paraguay
  'SV', // El Salvador
  'UY', // Uruguay
  'VE', // Venezuela
])

// A visitor's explicit choice, remembered for a year. With no switcher in the
// UI there is no button that sets this, so it exists for two reasons: it is
// the escape hatch for anyone the geo guess gets wrong (`/?lang=en` from
// Bogota, `/?lang=es` from anywhere), and it is what makes that override
// stick on the next visit instead of being overruled by the country again.
const PREF_COOKIE = 'lang'
const PREF_MAX_AGE = 60 * 60 * 24 * 365

function withPref(res: NextResponse, lang: 'en' | 'es'): NextResponse {
  res.cookies.set(PREF_COOKIE, lang, {
    path: '/',
    maxAge: PREF_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false,
    secure: true,
  })
  return res
}

export function proxy(req: NextRequest): NextResponse {
  const url = req.nextUrl
  const requested = url.searchParams.get('lang')

  // An explicit `?lang=` wins over everything, is remembered, and is stripped
  // from the address bar so the canonical URLs stay clean.
  if (requested === 'en' || requested === 'es') {
    const dest = new URL(requested === 'es' ? '/es/' : '/', url)
    return withPref(NextResponse.redirect(dest, 307), requested)
  }

  const saved = req.cookies.get(PREF_COOKIE)?.value
  if (saved === 'en') return NextResponse.next()
  if (saved === 'es') return NextResponse.redirect(new URL('/es/', url), 307)

  // Vercel's edge geo header. Anything that is not exactly two letters is
  // treated as unknown, which falls through to English.
  const raw = req.headers.get('x-vercel-ip-country')
  const country = raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null

  if (country && SPANISH_SPEAKING.has(country)) {
    return NextResponse.redirect(new URL('/es/', url), 307)
  }

  return NextResponse.next()
}

// Only the English home page. Every other route, the API handlers, `/dev`,
// `/es/` itself and all static assets are left alone.
export const config = {
  matcher: '/',
}
