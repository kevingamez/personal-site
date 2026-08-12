// Init/orchestration: fetch the snapshot, resolve units, render, and play count-ups on scroll-in.

import type { Payload } from './strava-types'
import { fillInsights, renderLongest } from './strava-render'
import {
  DUNIT,
  FEET_WORD,
  IMP,
  MILES_WORD,
  applyUnitSystem,
  countUp,
  distVal,
  elevVal,
  fetchCountry,
  plays,
  readI18n,
  resolveImperial,
  setText,
} from './strava-units'

export async function initStrava(): Promise<void> {
  const section = document.getElementById('strava')
  if (!section) return

  // Resolve units by location in parallel with the data fetch (overlaps the two
  // round-trips). The promise can't reject - it resolves to null on failure.
  const countryP = fetchCountry()

  let data: Payload | null = null
  try {
    // Trailing slash matches next.config.ts `trailingSlash: true`; without it
    // the request eats a 308 redirect before it reaches the handler.
    const res = await fetch('/api/strava/', { headers: { Accept: 'application/json' } })
    if (res.ok) data = (await res.json()) as Payload
  } catch {
    /* ignore - may fall back to the dev sample below */
  }
  // Local machines rarely have the Strava credentials, and since the Next
  // migration the local preview runs a production build, so a NODE_ENV guard
  // would hide the section there too. Gate on the hostname instead: any
  // localhost visit (dev server or preview) falls back to the baked snapshot;
  // the deployed site never does.
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  // Unlike the Astro dev server, the Next API route exists locally and answers
  // configured:false without credentials - treat that the same as no data.
  if ((!data || !data.configured) && isLocalhost) {
    try {
      data = (await import('./strava-sample')).devSample() as Payload
    } catch {
      /* dev sample unavailable - stay hidden */
    }
  }
  if (!data || !data.configured || !data.totals || data.totals.count === 0) return

  applyUnitSystem(resolveImperial(await countryP))

  readI18n()
  const lang = document.documentElement.lang || 'en'
  const t = data.totals

  // US (and other imperial-region) visitors see miles / feet.
  if (IMP) {
    setText('sv-km-unit', DUNIT)
    setText('sv-km-label', MILES_WORD)
    setText('sv-elev-label', FEET_WORD)
  }

  countUp('sv-km', distVal(t.distanceM), (n) => String(Math.round(n)))
  countUp('sv-hours', t.movingTime / 3600, (n) => (n >= 10 ? String(Math.round(n)) : n.toFixed(1)))
  countUp('sv-elev', elevVal(t.elevationM), (n) => Math.round(n).toLocaleString(lang))
  countUp('sv-acts', t.count, (n) => String(Math.round(n)))

  const host = document.getElementById('sv-longest')
  const tpl = document.getElementById('sv-feat-tpl') as HTMLTemplateElement | null
  if (host && tpl && data.longestBySport.length) renderLongest(host, tpl, data.longestBySport)
  fillInsights(data.insights, t, lang)

  section.hidden = false
  const play = (): void => {
    plays.forEach((f) => f())
    section.classList.add('on')
  }
  if (typeof IntersectionObserver === 'undefined') {
    play()
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          play()
          io.disconnect()
          break
        }
      }
    },
    { threshold: 0.15 }
  )
  io.observe(section)
}
