// Strava "movement" section. Fetches the year snapshot from /api/strava and
// renders the hero totals, a "longest effort per sport" card grid (each with a
// Mapbox map), and the metric tiles - counting numbers up on scroll-in. Fails
// silent: if the endpoint isn't routed / no data, the section stays hidden.

interface Totals {
  distanceM: number
  movingTime: number
  elevationM: number
  count: number
  activeDays: number
}
interface Effort {
  name: string
  startDate: string
  url: string
  distanceM: number
  elevationM: number
  avgSpeedMs: number
}
interface Activity {
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  elevationM: number
  avgSpeedMs: number
  startDate: string
  url: string
  polyline?: string | null
}
interface Insights {
  biggestWeekStart: string | null
  biggestWeekDistanceM: number
  busiestWeekday: number | null
  busiestWeekdayCount: number
  biggestClimb: Effort | null
  fastest: Effort | null
  eiffels: number
}
interface Payload {
  configured: boolean
  error?: boolean
  totals: Totals | null
  longestBySport: Activity[]
  insights: Insights
}

const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Foot sports report a pace (min/km or /mi); wheels report a speed.
const FOOT_SPORTS = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'])

// Unit system. The only countries that don't use metric are the US, Liberia,
// and Myanmar - Canada and the UK are officially metric for distance/speed - so
// those visitors get miles/feet/mph/pace-per-mile and everyone else stays
// metric. Detected from the browser locale: no server round-trip, no edge-cache
// pollution.
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM'])
function detectImperial(): boolean {
  if (typeof navigator === 'undefined') return false
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const l of langs) {
      const region = new Intl.Locale(l).maximize().region
      if (region) return IMPERIAL_REGIONS.has(region)
    }
  } catch {
    /* fall through to metric */
  }
  return false
}
const IMP = detectImperial()
const KM_PER_MI = 0.621371
const FT_PER_M = 3.28084
const DUNIT = IMP ? 'mi' : 'km'
const EUNIT = IMP ? 'ft' : 'm'
const SUNIT = IMP ? 'mph' : 'km/h'
const PUNIT = IMP ? '/mi' : '/km'
const distVal = (m: number): number => (IMP ? (m / 1000) * KM_PER_MI : m / 1000)
const elevVal = (m: number): number => (IMP ? m * FT_PER_M : m)
const spdVal = (ms: number): number => ms * 3.6 * (IMP ? KM_PER_MI : 1)

let SPORTS: Record<string, string> = {}
let WEEK_OF = 'week of'
let COMPARE = '× the Eiffel Tower'
let SPEED_LABEL = 'avg speed'
let PACE_LABEL = 'pace'
let MILES_WORD = 'miles'
let FEET_WORD = 'feet climbed'

function readI18n(): void {
  const el = document.getElementById('strava-i18n')
  if (!el?.textContent) return
  try {
    const j = JSON.parse(el.textContent) as {
      sports?: Record<string, string>
      weekOf?: string
      climbedCompare?: string
      featSpeed?: string
      featPace?: string
      statMi?: string
      statFt?: string
    }
    SPORTS = j.sports || {}
    if (j.weekOf) WEEK_OF = j.weekOf
    if (j.climbedCompare) COMPARE = j.climbedCompare
    if (j.featSpeed) SPEED_LABEL = j.featSpeed
    if (j.featPace) PACE_LABEL = j.featPace
    if (j.statMi) MILES_WORD = j.statMi
    if (j.statFt) FEET_WORD = j.statFt
  } catch {
    /* defaults */
  }
}

const pace = (distanceM: number, movingTime: number): string => {
  if (distanceM <= 0) return '-'
  let per = movingTime / (distanceM / 1000) // seconds per km
  if (IMP) per /= KM_PER_MI // seconds per mile
  let mm = Math.floor(per / 60)
  let ss = Math.round(per % 60)
  if (ss >= 60) {
    mm += 1
    ss = 0
  }
  return `${mm}:${String(ss).padStart(2, '0')} ${PUNIT}`
}
const dur = (s: number): string => {
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}
function shortDate(date: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  )
}
function setText(id: string, value: string): void {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

const plays: (() => void)[] = []
function countUpEl(el: Element | null, target: number, fmt: (n: number) => string): void {
  if (!el) return
  plays.push(() => {
    if (REDUCE) {
      el.textContent = fmt(target)
      return
    }
    const t0 = performance.now()
    const tick = (now: number): void => {
      const p = Math.min(1, (now - t0) / 1400)
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
      else el.textContent = fmt(target)
    }
    requestAnimationFrame(tick)
  })
}
const countUp = (id: string, target: number, fmt: (n: number) => string): void =>
  countUpEl(document.getElementById(id), target, fmt)

// Mapbox Static map for a route. Public token, dark style, coral path. 640x400
// @2x = 1280x800 (Mapbox max); 16:10 matches the card so it never crops.
const MAPBOX_TOKEN = (import.meta.env as unknown as Record<string, string | undefined>)
  .PUBLIC_MAPBOX_TOKEN
function mapboxUrl(polyline: string): string {
  const path = `path-6+e07a5f-0.95(${encodeURIComponent(polyline)})`
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${path}/auto/640x400@2x?access_token=${MAPBOX_TOKEN}&padding=34`
}

function renderLongest(host: HTMLElement, tpl: HTMLTemplateElement, acts: Activity[]): void {
  host.replaceChildren()
  for (const a of acts) {
    const frag = tpl.content.cloneNode(true) as DocumentFragment
    const card = frag.querySelector('.sv-feat')
    if (!card) continue

    const sportEl = frag.querySelector('[data-sport]')
    if (sportEl) sportEl.textContent = SPORTS[a.sportType] || a.sportType
    const nameEl = frag.querySelector('[data-name]') as HTMLAnchorElement | null
    if (nameEl) {
      nameEl.textContent = a.name
      nameEl.href = a.url
    }
    const routeEl = frag.querySelector('[data-route]')
    if (routeEl && MAPBOX_TOKEN && a.polyline) {
      const img = document.createElement('img')
      img.className = 'sv-feat-map'
      img.alt = `Route map · ${a.name}`
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', () => card.classList.add('sv-feat--noroute'))
      img.src = mapboxUrl(a.polyline)
      routeEl.appendChild(img)
    } else {
      card.classList.add('sv-feat--noroute')
    }
    countUpEl(
      frag.querySelector('[data-dist]'),
      distVal(a.distanceM),
      (n) => `${n.toFixed(1)} ${DUNIT}`
    )
    countUpEl(
      frag.querySelector('[data-elev]'),
      elevVal(a.elevationM),
      (n) => `${Math.round(n).toLocaleString()} ${EUNIT}`
    )
    countUpEl(frag.querySelector('[data-time]'), a.movingTime, (n) => dur(n))
    // Runs/hikes report pace; rides report speed.
    const speedEl = frag.querySelector('[data-speed]')
    const speedLabelEl = frag.querySelector('[data-speedlabel]')
    if (FOOT_SPORTS.has(a.sportType)) {
      if (speedLabelEl) speedLabelEl.textContent = PACE_LABEL
      if (speedEl) speedEl.textContent = pace(a.distanceM, a.movingTime)
    } else {
      if (speedLabelEl) speedLabelEl.textContent = SPEED_LABEL
      countUpEl(speedEl, spdVal(a.avgSpeedMs), (n) => `${n.toFixed(1)} ${SUNIT}`)
    }
    host.appendChild(frag)
  }
}

function fillInsights(ins: Insights, totals: Totals, lang: string): void {
  if (ins.biggestClimb) {
    countUp(
      'sv-climb-val',
      elevVal(ins.biggestClimb.elevationM),
      (n) => `${Math.round(n).toLocaleString(lang)} ${EUNIT}`
    )
    setText('sv-climb-sub', ins.biggestClimb.name)
  }
  if (ins.fastest) {
    countUp('sv-fast-val', spdVal(ins.fastest.avgSpeedMs), (n) => `${n.toFixed(1)} ${SUNIT}`)
    setText('sv-fast-sub', ins.fastest.name)
  }
  countUp('sv-biggest-val', distVal(ins.biggestWeekDistanceM), (n) => `${Math.round(n)} ${DUNIT}`)
  if (ins.biggestWeekStart)
    setText('sv-biggest-sub', `${WEEK_OF} ${shortDate(ins.biggestWeekStart, lang)}`)
  countUp(
    'sv-climbed-val',
    elevVal(totals.elevationM),
    (n) => `${Math.round(n).toLocaleString(lang)} ${EUNIT}`
  )
  setText('sv-climbed-sub', `≈ ${ins.eiffels} ${COMPARE}`)
}

export async function initStrava(): Promise<void> {
  const section = document.getElementById('strava')
  if (!section) return

  let data: Payload | null = null
  try {
    const res = await fetch('/api/strava', { headers: { Accept: 'application/json' } })
    if (res.ok) data = (await res.json()) as Payload
  } catch {
    /* ignore - may fall back to the dev sample below */
  }
  // `astro dev` doesn't route /api/strava; in dev fall back to a baked snapshot
  // (stripped from prod builds by the import.meta.env.DEV guard).
  if (!data && import.meta.env.DEV) {
    try {
      data = (await import('./strava-sample')).devSample() as Payload
    } catch {
      /* dev sample unavailable (e.g. transient Vite 504) - stay hidden */
    }
  }
  if (!data || !data.configured || !data.totals || data.totals.count === 0) return

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
