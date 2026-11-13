// Init/orchestration: fetch the snapshot, resolve units, render, and play count-ups on scroll-in.

import type { Payload } from './strava-types'
import { renderLatest } from './strava-latest'
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
  setInstant,
  setText,
} from './strava-units'

// The server only regenerates the page when someone visits after the ISR
// window, and that visitor still gets the old copy, so an inline snapshot can
// be far older than the window. Past this age the client asks the API instead.
const SEED_MAX_AGE_MS = 6 * 60 * 60 * 1000

// Snapshot the server inlined during the page render, if it did.
function readSeed(): Payload | null {
  try {
    const raw = document.getElementById('strava-data')?.textContent
    const seed = raw ? (JSON.parse(raw) as Payload) : null
    return seed && seed.configured && seed.totals ? seed : null
  } catch {
    return null
  }
}

const isFresh = (p: Payload): boolean => {
  const at = Date.parse(p.generatedAt ?? '')
  // abs: a visitor clock running behind must not make an old seed look new.
  return Number.isFinite(at) && Math.abs(Date.now() - at) < SEED_MAX_AGE_MS
}

async function fetchSnapshot(): Promise<Payload | null> {
  try {
    // Trailing slash matches next.config.ts `trailingSlash: true`; without it
    // the request eats a 308 redirect before it reaches the handler.
    const res = await fetch('/api/strava/', { headers: { Accept: 'application/json' } })
    if (res.ok) return (await res.json()) as Payload
  } catch {
    /* ignore - the caller falls back */
  }
  return null
}

export async function initStrava(): Promise<void> {
  const section = document.getElementById('strava')
  if (!section) return

  // Resolve units by location in parallel with the data fetch (overlaps the two
  // round-trips). The promise can't reject - it resolves to null on failure.
  const countryP = fetchCountry()

  // A fresh inline snapshot needs no request at all. A stale one is still
  // better than nothing if the API cannot answer.
  const seed = readSeed()
  let data: Payload | null = seed && isFresh(seed) ? seed : null
  if (!data) {
    const live = await fetchSnapshot()
    data = live && live.configured && live.totals ? live : (seed ?? live)
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

  const hero: [string, number, (n: number) => string][] = [
    ['sv-km', distVal(t.distanceM), (n) => String(Math.round(n))],
    ['sv-hours', t.movingTime / 3600, (n) => (n >= 10 ? String(Math.round(n)) : n.toFixed(1))],
    ['sv-elev', elevVal(t.elevationM), (n) => Math.round(n).toLocaleString(lang)],
    ['sv-acts', t.count, (n) => String(Math.round(n))],
  ]
  // The server printed these in metric and possibly from an older snapshot.
  // On screen they are corrected in place and stay put. Off screen they go
  // back to zero, where the count-up starts when the section scrolls in;
  // otherwise the reader would watch real numbers drop to 0 and climb back.
  const shipped = !section.hidden
  const onScreen = shipped && section.getBoundingClientRect().top < window.innerHeight
  if (onScreen) setInstant(true)
  for (const [id, target, fmt] of hero) {
    if (shipped) setText(id, fmt(onScreen ? target : 0))
    countUp(id, target, fmt)
  }

  // Optional block: a malformed `latest` must not blank the whole section.
  try {
    renderLatest(data.latest, lang)
  } catch {
    document.getElementById('sv-latest')?.setAttribute('hidden', '')
  }

  const host = document.getElementById('sv-longest')
  const tpl = document.getElementById('sv-feat-tpl') as HTMLTemplateElement | null
  if (host && tpl && data.longestBySport.length) renderLongest(host, tpl, data.longestBySport)
  fillInsights(data.insights, t, lang)

  document.getElementById('sv-insights')?.removeAttribute('hidden')
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
