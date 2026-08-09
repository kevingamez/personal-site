// Typed wrapper over the analytics sink (Vercel Analytics). Adding a new
// event? Add it to AnalyticsEvent and describe its props in the union - the
// call site is then typechecked.

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
  | { name: 'section_view'; props: { section: string; visible_ms: number } }
  | { name: 'cta_click'; props: { id: string; href?: string } }
  | { name: 'console_query'; props: { length: number; preset?: boolean } }

declare global {
  interface Window {
    va?: (event: string, props?: Record<string, unknown>) => void
  }
}

function send(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  log.debug(event, props)
  // No-ops when the Vercel Analytics script hasn't booted yet.
  try {
    window.va?.('event', { name: event, ...props })
  } catch (e) {
    log.warn('vercel/va threw', e)
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
