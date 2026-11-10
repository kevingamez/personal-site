// "Latest activity" block: the most recent Strava activity, with a relative
// date computed here on the client (the server markup ships empty, so there is
// nothing time-dependent to hydrate).

import type { Activity } from './strava-types'
import { fillStats, mountRoute } from './strava-render'
import { SPORTS } from './strava-units'

const DAY_MS = 86_400_000

// "3 hours ago" under a day, then calendar days in the visitor's own timezone
// (so last night reads "yesterday"), then weeks, months, years.
export function relTime(iso: string, lang: string, now = Date.now()): string {
  const t = Date.parse(iso)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const elapsed = now - t
  if (elapsed < 3_600_000) return rtf.format(-Math.max(1, Math.round(elapsed / 60_000)), 'minute')
  const midnight = (ms: number): number => new Date(ms).setHours(0, 0, 0, 0)
  const days = Math.round((midnight(now) - midnight(t)) / DAY_MS)
  if (days < 1) return rtf.format(-Math.round(elapsed / 3_600_000), 'hour')
  if (days < 7) return rtf.format(-days, 'day')
  if (days < 30) return rtf.format(-Math.round(days / 7), 'week')
  if (days < 365) return rtf.format(-Math.round(days / 30.44), 'month')
  return rtf.format(-Math.round(days / 365.25), 'year')
}

const isActivity = (a: unknown): a is Activity => {
  if (!a || typeof a !== 'object') return false
  const o = a as Partial<Activity>
  return (
    typeof o.name === 'string' &&
    typeof o.sportType === 'string' &&
    typeof o.url === 'string' &&
    typeof o.startDate === 'string' &&
    !Number.isNaN(Date.parse(o.startDate))
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
    when.title = new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeStyle: 'short' }).format(
      new Date(a.startDate)
    )
  }
  mountRoute(el.querySelector('[data-route]'), a, el)
  fillStats(el, a)
  el.hidden = false
}
