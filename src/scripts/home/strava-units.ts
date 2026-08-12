// Unit-system resolution (geo/timezone/locale), i18n strings, and formatting/count-up helpers.

const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Foot sports report a pace (min/km or /mi); wheels report a speed.
export const FOOT_SPORTS = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'])

// Unit system. The only countries that don't use metric are the US, Liberia,
// and Myanmar - Canada and the UK are officially metric for distance/speed - so
// those visitors get miles/feet/mph/pace-per-mile and everyone else stays
// metric. Resolved by *actual location*, best signal first: the visitor's
// geo-IP country (from /api/geo, uncached), then the device timezone, then the
// browser locale. Location beats locale so a Colombian on an en-US browser
// still sees kilometers.
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM'])

// Imperial IANA timezones (US + Liberia + Myanmar). Prefix entries cover the
// many America/Indiana, America/Kentucky and America/North_Dakota sub-zones.
const IMPERIAL_TZ = [
  'America/New_York',
  'America/Detroit',
  'America/Chicago',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'America/Menominee',
  'America/Indiana/',
  'America/Kentucky/',
  'America/North_Dakota/',
  'Pacific/Honolulu',
  'Africa/Monrovia',
  'Asia/Yangon',
  'Asia/Rangoon',
]

function imperialByLocale(): boolean {
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

function imperialByTimezone(): boolean | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz) return null
    return IMPERIAL_TZ.some((z) => tz === z || tz.startsWith(z))
  } catch {
    return null
  }
}

export async function fetchCountry(): Promise<string | null> {
  try {
    const res = await fetch('/api/geo', { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const j = (await res.json()) as { country?: string | null }
    return j.country && /^[A-Z]{2}$/.test(j.country) ? j.country : null
  } catch {
    return null // route unavailable or offline - fall back below
  }
}

// geo-IP country (authoritative) → device timezone → browser locale.
export function resolveImperial(country: string | null): boolean {
  if (country) return IMPERIAL_REGIONS.has(country)
  const byTz = imperialByTimezone()
  return byTz !== null ? byTz : imperialByLocale()
}

const KM_PER_MI = 0.621371
const FT_PER_M = 3.28084

// Mutable so the geo lookup can finalize the system before anything renders;
// the value functions read these at call time. Seeded from the offline signals
// (timezone/locale) so the dev-sample path still has a sane default.
export let IMP = resolveImperial(null)
export let DUNIT = IMP ? 'mi' : 'km'
export let EUNIT = IMP ? 'ft' : 'm'
export let SUNIT = IMP ? 'mph' : 'km/h'
let PUNIT = IMP ? '/mi' : '/km'
export function applyUnitSystem(imperial: boolean): void {
  IMP = imperial
  DUNIT = imperial ? 'mi' : 'km'
  EUNIT = imperial ? 'ft' : 'm'
  SUNIT = imperial ? 'mph' : 'km/h'
  PUNIT = imperial ? '/mi' : '/km'
}
export const distVal = (m: number): number => (IMP ? (m / 1000) * KM_PER_MI : m / 1000)
export const elevVal = (m: number): number => (IMP ? m * FT_PER_M : m)
export const spdVal = (ms: number): number => ms * 3.6 * (IMP ? KM_PER_MI : 1)

export let SPORTS: Record<string, string> = {}
export let WEEK_OF = 'week of'
export let SPEED_LABEL = 'avg speed'
export let PACE_LABEL = 'pace'
export let MILES_WORD = 'miles'
export let FEET_WORD = 'feet climbed'

export function readI18n(): void {
  const el = document.getElementById('strava-i18n')
  if (!el?.textContent) return
  try {
    const j = JSON.parse(el.textContent) as {
      sports?: Record<string, string>
      weekOf?: string
      featSpeed?: string
      featPace?: string
      statMi?: string
      statFt?: string
    }
    SPORTS = j.sports || {}
    if (j.weekOf) WEEK_OF = j.weekOf
    if (j.featSpeed) SPEED_LABEL = j.featSpeed
    if (j.featPace) PACE_LABEL = j.featPace
    if (j.statMi) MILES_WORD = j.statMi
    if (j.statFt) FEET_WORD = j.statFt
  } catch {
    /* defaults */
  }
}

export const pace = (distanceM: number, movingTime: number): string => {
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
export const dur = (s: number): string => {
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}
export function shortDate(date: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  )
}
export function setText(id: string, value: string): void {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

export const plays: (() => void)[] = []
export function countUpEl(el: Element | null, target: number, fmt: (n: number) => string): void {
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
export const countUp = (id: string, target: number, fmt: (n: number) => string): void =>
  countUpEl(document.getElementById(id), target, fmt)
