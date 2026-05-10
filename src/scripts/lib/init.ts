// Bootstrap that every page imports. Wires global error/unhandledrejection
// handlers into the logger + analytics, and emits a page_view.

import { logger } from './logger'
import { pageView, track } from './analytics'
import { inject as injectVercelAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

const log = logger('boot')

let installed = false

const CLARITY_ID = (import.meta as ImportMeta & { env: Record<string, string> }).env
  ?.PUBLIC_CLARITY_ID

function loadClarity(id: string): void {
  if (!id || typeof window === 'undefined') return
  if (window.clarity) return
  // Standard Clarity bootstrap (https://clarity.microsoft.com).
  // Casts narrow the inline IIFE to a typed shape without `any`.
  const w = window as unknown as { clarity?: unknown }
  ;(function (c: typeof w, l: Document, a: string, r: string, i: string) {
    type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] }
    const clarityFn: ClarityFn = function (...args: unknown[]): void {
      ;(clarityFn.q = clarityFn.q || []).push(args)
    }
    c.clarity = clarityFn
    const t = l.createElement(a) as HTMLScriptElement
    t.async = true
    t.src = 'https://www.clarity.ms/tag/' + i
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(w, document, 'script', 'head', id)
}

export function bootstrapClient(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  // Privacy-first first-party analytics. Both run cookieless by default.
  try {
    injectVercelAnalytics()
    injectSpeedInsights()
  } catch (e) {
    log.warn('vercel analytics inject failed', e)
  }

  if (CLARITY_ID) loadClarity(CLARITY_ID)

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
