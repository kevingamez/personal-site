// Bootstrap that every page imports. Wires global error/unhandledrejection
// handlers into the logger + analytics, and emits a page_view.

import { logger } from './logger'
import { pageView, track } from './analytics'
import { initGa, loadGaScript } from './ga'

const log = logger('boot')

let installed = false

function runWhenIdle(fn: () => void, timeout = 2500): void {
  if (typeof window === 'undefined') return
  setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout })
      return
    }
    setTimeout(fn, 0)
  }, 1200)
}

async function loadVercelTelemetry(): Promise<void> {
  const [{ inject }, { injectSpeedInsights }] = await Promise.all([
    import('@vercel/analytics'),
    import('@vercel/speed-insights'),
  ])
  inject()
  injectSpeedInsights()
}

export function bootstrapClient(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  // Synchronous and cheap: installs the gtag queue so the page_view fired at the
  // end of this function is buffered rather than dropped. The tag itself is
  // fetched from the idle callback below. No-ops without NEXT_PUBLIC_GA_ID.
  initGa()

  runWhenIdle(() => {
    // Privacy-first first-party analytics. Cookieless by default.
    void loadVercelTelemetry().catch((e) => log.warn('vercel analytics inject failed', e))
    loadGaScript()
  })

  window.addEventListener('error', (e) => {
    log.error('uncaught error', e.error ?? e.message)
    track<{ name: 'client_error'; props: { message: string; source?: string; lineno?: number } }>(
      'client_error',
      { message: e.message, source: e.filename, lineno: e.lineno }
    )
  })

  window.addEventListener('unhandledrejection', (e) => {
    log.error('unhandled rejection', e.reason)
    track<{ name: 'client_error'; props: { message: string; source?: string; lineno?: number } }>(
      'client_error',
      { message: String(e.reason?.message ?? e.reason ?? 'unknown') }
    )
  })

  pageView(window.location.pathname, document.title, document.documentElement.lang || undefined)
  log.debug('boot complete', { path: window.location.pathname })
}
