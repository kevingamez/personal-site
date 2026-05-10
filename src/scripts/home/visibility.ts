// Section-engagement tracker. Watches every <section id="..."> on the home
// page, measures how long each one was actually visible (intersecting the
// viewport with ≥40% area), and reports a single `section_view` event per
// section on unload - so you see which sections retain attention.
//
// Also wires CTA click tracking on buttons / links flagged with `data-cta`.

import { track } from '../lib/analytics'

const THRESHOLD = 0.4

export function initVisibility(): void {
  if (typeof window === 'undefined') return

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'))
  if (!sections.length) return

  const visibleAt = new Map<string, number>()
  const totalMs = new Map<string, number>()

  const flush = (id: string, now: number): void => {
    const start = visibleAt.get(id)
    if (start === undefined) return
    const delta = Math.max(0, now - start)
    totalMs.set(id, (totalMs.get(id) ?? 0) + delta)
    visibleAt.delete(id)
  }

  const io = new IntersectionObserver(
    (entries) => {
      const now = performance.now()
      for (const e of entries) {
        const id = (e.target as HTMLElement).id
        if (!id) continue
        if (e.isIntersecting && e.intersectionRatio >= THRESHOLD) {
          if (!visibleAt.has(id)) visibleAt.set(id, now)
        } else {
          flush(id, now)
        }
      }
    },
    { threshold: [0, THRESHOLD, 1] }
  )
  for (const s of sections) io.observe(s)

  // Pause measurement when the tab is hidden so background time doesn't
  // inflate the dwell.
  document.addEventListener('visibilitychange', () => {
    const now = performance.now()
    if (document.hidden) {
      for (const id of Array.from(visibleAt.keys())) flush(id, now)
    }
  })

  // On unload, flush in-flight sections and dispatch one event per section
  // with non-trivial dwell. Use sendBeacon-friendly synchronous calls.
  const report = (): void => {
    const now = performance.now()
    for (const id of Array.from(visibleAt.keys())) flush(id, now)
    for (const [id, ms] of totalMs.entries()) {
      if (ms < 500) continue // skip flicker
      track<{ name: 'section_view'; props: { section: string; visible_ms: number } }>(
        'section_view',
        { section: id, visible_ms: Math.round(ms) }
      )
    }
    totalMs.clear()
  }
  window.addEventListener('pagehide', report, { once: false })
  window.addEventListener('beforeunload', report)

  // CTA click tracking: any element with `data-cta="<id>"` reports its label
  // and href. Cheap to maintain - no need to instrument every button.
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null
    const cta = target?.closest<HTMLElement>('[data-cta]')
    if (!cta) return
    const id = cta.getAttribute('data-cta') || ''
    const href = cta.getAttribute('href') || undefined
    if (!id) return
    track<{ name: 'cta_click'; props: { id: string; href?: string } }>('cta_click', { id, href })
  })
}
