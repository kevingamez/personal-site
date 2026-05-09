// Typed wrapper over gtag. Adding a new event? Add it to AnalyticsEvent and
// describe its props in the union — the call site is then typechecked.

import { logger } from './logger'

const log = logger('analytics')

export type AnalyticsEvent =
  | { name: 'page_view'; props: { path: string; title?: string; lang?: string } }
  | { name: 'lang_switch'; props: { from: string; to: string } }
  | { name: 'palette_open'; props?: undefined }
  | { name: 'palette_select'; props: { path: string } }
  | { name: 'file_open'; props: { path: string; via: 'palette' | 'tree' | 'init' | 'terminal' } }
  | { name: 'file_save'; props: { path: string; ok: boolean } }
  | { name: 'workspace_switch'; props: { to: 'workspace' | 'scratchpad' | 'changelog' } }
  | { name: 'terminal_command'; props: { command: string } }
  | { name: 'conway_seed'; props: { x: number; y: number } }
  | { name: 'github_link_click'; props: { repo?: string; href: string } }
  | { name: 'contact_click'; props: { channel: string } }
  | { name: 'client_error'; props: { message: string; source?: string; lineno?: number } }

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function send(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  log.debug(event, props)
  // gtag may not have loaded yet; the dataLayer push survives it.
  try {
    window.gtag?.('event', event, props)
  } catch (e) {
    log.warn('gtag threw', e)
  }
}

export function track<E extends AnalyticsEvent>(
  ...args: E extends { props: infer P } ? [E['name'], P] : [E['name']]
): void {
  const [name, props] = args as [string, Record<string, unknown> | undefined]
  send(name, props)
}

export function pageView(path: string, title?: string, lang?: string): void {
  track<Extract<AnalyticsEvent, { name: 'page_view' }>>('page_view', { path, title, lang })
}
