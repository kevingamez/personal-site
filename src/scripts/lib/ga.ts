// Google Analytics 4, loaded lazily and only when NEXT_PUBLIC_GA_ID is set.
//
// Every event this site already tracks flows through lib/analytics.ts, which
// fans out to both sinks (Vercel Analytics and this one). Nothing calls gtag()
// directly - add events to the AnalyticsEvent union there instead.
//
// COOKIES: `client_storage: 'none'` is deliberate. /privacy tells visitors this
// site sets no cookies, and standard GA4 would write `_ga` / `_ga_<id>` the
// moment it boots. In this mode gtag still sends every event and the reports
// still populate; what it loses is the persistent client id, so returning
// visitors count as new ones and user-scoped metrics are session-scoped in
// practice. To trade that promise for full cross-session attribution, drop the
// `client_storage` line below AND update the cookie section of
// app/(en)/privacy/page.tsx - the two must not disagree.

import { logger } from './logger'

const log = logger('ga4')

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

// Matches the "G-XXXXXXX" measurement id shape. A Universal Analytics "UA-"
// property or a stray quote in the env var would otherwise inject a bad script
// tag and fail silently at runtime.
const GA_ID_RE = /^G-[A-Z0-9]+$/

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let booted = false
let scriptRequested = false

export function gaEnabled(): boolean {
  return GA_ID_RE.test(GA_ID)
}

/**
 * Installs the gtag queue. Cheap and synchronous on purpose: `dataLayer` buffers
 * every event fired before gtag.js arrives, so this has to run BEFORE the first
 * page_view or that event is dropped. The network request for the tag itself is
 * deferred by loadGaScript().
 *
 * No-ops without a valid measurement id.
 */
export function initGa(): void {
  if (booted || typeof window === 'undefined') return
  if (!gaEnabled()) {
    if (GA_ID) log.warn('NEXT_PUBLIC_GA_ID is set but is not a G-XXXX measurement id', GA_ID)
    return
  }
  booted = true

  window.dataLayer = window.dataLayer || []
  // gtag pushes `arguments` verbatim - it must stay a function expression with
  // no rest parameter, because the tag reads the arguments object itself.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    // page_view is emitted from lib/analytics.ts so both sinks see the same
    // event with the same props.
    send_page_view: false,
    client_storage: 'none',
    anonymize_ip: true,
    transport_type: 'beacon',
  })

  log.debug('ga4 queue installed', { id: GA_ID })
}

/**
 * Fetches gtag.js. Call this from the idle callback that loads the rest of the
 * telemetry - everything queued up to that point flushes when it lands.
 */
export function loadGaScript(): void {
  if (!booted || scriptRequested) return
  scriptRequested = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  s.onerror = () => log.warn('gtag.js failed to load (blocked by an extension?)')
  document.head.appendChild(s)
}

/** Forwards one already-typed event from lib/analytics.ts to GA4. */
export function gaSend(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !gaEnabled()) return
  try {
    window.gtag?.('event', event, props ?? {})
  } catch (e) {
    log.warn('gtag threw', e)
  }
}
