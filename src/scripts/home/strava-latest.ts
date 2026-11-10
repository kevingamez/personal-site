// "Latest activity" block: the most recent Strava activity, with a relative
// date computed here on the client (the server markup ships empty, so there is
// nothing time-dependent to hydrate).

import type { Activity } from './strava-types'
import { fillStats, mountRoute } from './strava-render'
import { SPORTS } from './strava-units'

const DAY_MS = 86_400_000

// Minutes, then hours, under a day; then calendar days in the visitor's own
// timezone (so last night reads "yesterday"). Past a week the count is always
// numeric ("6 weeks ago"): the 'auto' wording ("last month") names the previous
// calendar period, which a rounded duration does not match.
export function relTime(iso: string, lang: string, now = Date.now()): string {
  const t = Date.parse(iso)
  const near = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const far = new Intl.RelativeTimeFormat(lang, { numeric: 'always' })
  const elapsed = Math.max(0, now - t)
  const mins = Math.round(elapsed / 60_000)
  if (mins < 60) return near.format(-Math.max(1, mins), 'minute')
  const midnight = (ms: number): number => new Date(ms).setHours(0, 0, 0, 0)
  const days = Math.round((midnight(now) - midnight(t)) / DAY_MS)
  if (days < 1) return near.format(-Math.max(1, Math.round(elapsed / 3_600_000)), 'hour')
  if (days < 7) return near.format(-days, 'day')
  if (days < 56) return far.format(-Math.round(days / 7), 'week')
  if (days < 350) return far.format(-Math.round(days / 30.44), 'month')
  return far.format(-Math.max(1, Math.round(days / 365.25)), 'year')
}

const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

const isActivity = (a: unknown): a is Activity => {
  if (!a || typeof a !== 'object') return false
  const o = a as Partial<Activity>
  return (
    typeof o.name === 'string' &&
    typeof o.sportType === 'string' &&
    typeof o.url === 'string' &&
    typeof o.startDate === 'string' &&
    !Number.isNaN(Date.parse(o.startDate)) &&
    finite(o.distanceM) &&
    finite(o.movingTime) &&
    finite(o.elevationM) &&
    finite(o.avgSpeedMs)
  )
}

// Fills and reveals #sv-latest. Anything missing or malformed (no activities,
// an old cached payload without `latest`) leaves the block hidden.
export function renderLatest(a: unknown, lang: string): void {
  const el = document.getElementById('sv-latest')
  if (!el || !isActivity(a)) return

  const sport = el.querySelector('[data-sport]')
  if (sport) sport.textContent = SPORTS[a.sportType] || a.sportType
  const name = el.querySelector('[data-name]') as HTMLAnchorElement | null
  if (name) {
    name.textContent = a.name
    name.href = a.url
  }
  const when = el.querySelector('time')
  if (when) {
    when.dateTime = a.startDate
    when.textContent = relTime(a.startDate, lang)
    const full = new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeStyle: 'short' }).format(
      new Date(a.startDate)
    )
    when.title = full
    // The tooltip is unreachable on touch and for screen readers.
    const abs = el.querySelector('[data-abs]')
    if (abs) abs.textContent = ` (${full})`
  }
  mountRoute(el.querySelector('[data-route]'), a, el, true)
  fillStats(el, a)
  el.hidden = false
}
