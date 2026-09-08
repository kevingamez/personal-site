// Locale routing by explicit choice, not by country.
//
// This is Next 16's `proxy` file convention, which replaces `middleware`: the
// older name still runs but the build prints a deprecation. It also has to sit
// at the project root, not under `src/`, because `app/` is at the root and
// Next only looks in `src/` for projects whose app directory lives there.
//
// EN and ES are explicit routes (`/` and `/es/`). The site stays English by
// default, and only a direct query switch (`/?lang=es` or `/?lang=en`) changes
// where root goes for the next visit.
//
// Only `/` is ever redirected. `/es/` is never bounced anywhere, so the
// Spanish page stays directly reachable by URL, and a visitor who lands there
// on purpose keeps it.
//
// The redirect is 307 (temporary) on purpose: `/` must stay the canonical
// English URL for search engines. Googlebot should see English at `/`, matching
// the `x-default` hreflang the pages already emit.

import { NextResponse, type NextRequest } from 'next/server'

// A visitor's explicit choice, remembered for a year. This makes the last
// manual pick at root ("Ver en Español" / "View this site in English") persist
// for a year.
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

  return NextResponse.next()
}

// Only the English home page. Every other route, the API handlers, `/dev`,
// `/es/` itself and all static assets are left alone.
export const config = {
  matcher: '/',
}
