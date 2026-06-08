// Strava "movement" section. Pulls a sanitized snapshot from /api/strava and
// renders the last four weeks of activity. Fails silent: if the endpoint isn't
// routed (e.g. `astro preview`), isn't configured, errors, or has no activity,
// the section simply stays hidden instead of surfacing a console error.

interface Activity {
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  elevationM: number
  avgSpeedMs: number
  startDate: string
  url: string
}

interface Totals {
  distanceM: number
  movingTime: number
  count: number
  activeDays: number
  windowDays: number
}

interface Payload {
  configured: boolean
  error?: boolean
  generatedAt?: string
  totals: Totals | null
  activities: Activity[]
}

// Sports measured by pace (min/km) rather than speed (km/h).
const FOOT_SPORTS = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'])

const SPORT_COLOR: Record<string, string> = {
  Run: '#c1462e',
  TrailRun: '#c1462e',
  VirtualRun: '#c1462e',
  Ride: '#34506b',
  VirtualRide: '#34506b',
  GravelRide: '#34506b',
  MountainBikeRide: '#34506b',
  Swim: '#2f6d8f',
  Walk: '#5b8a72',
  Hike: '#5b8a72',
  WeightTraining: '#8a6a1f',
  Workout: '#8a6a1f',
  Yoga: '#8a6a1f',
}

function sportLabels(): Record<string, string> {
  const el = document.getElementById('strava-i18n')
  if (!el?.textContent) return {}
  try {
    const parsed = JSON.parse(el.textContent) as { sports?: Record<string, string> }
    return parsed.sports || {}
  } catch {
    return {}
  }
}

function fmtKm(meters: number): string {
  return (meters / 1000).toFixed(1)
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

function fmtPace(meters: number, sec: number): string {
  if (meters <= 0) return ''
  const perKm = sec / (meters / 1000)
  let m = Math.floor(perKm / 60)
  let s = Math.round(perKm % 60)
  if (s >= 60) {
    m += 1
    s = 0
  }
  return `${m}:${String(s).padStart(2, '0')}/km`
}

function fmtSpeed(metersPerSec: number): string {
  return `${(metersPerSec * 3.6).toFixed(1)} km/h`
}

function relTime(iso: string, lang: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  return Math.abs(days) >= 7 ? rtf.format(Math.round(days / 7), 'week') : rtf.format(days, 'day')
}

function setNum(id: string, value: string): void {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function renderActivities(
  host: HTMLElement,
  acts: Activity[],
  labels: Record<string, string>,
  lang: string
): void {
  const frag = document.createDocumentFragment()
  for (const a of acts) {
    const card = document.createElement('a')
    card.className = 'act'
    card.href = a.url
    card.target = '_blank'
    card.rel = 'noopener'

    const tag = document.createElement('span')
    tag.className = 'act-tag'
    const dot = document.createElement('span')
    dot.className = 'act-dot'
    dot.style.setProperty('--c', SPORT_COLOR[a.sportType] || 'var(--muted)')
    tag.append(dot, document.createTextNode(labels[a.sportType] || a.sportType))

    const body = document.createElement('div')
    body.className = 'act-body'
    const name = document.createElement('div')
    name.className = 'act-name'
    name.textContent = a.name
    const meta = document.createElement('div')
    meta.className = 'act-meta'
    const bits: string[] = []
    if (a.distanceM > 0) bits.push(`${fmtKm(a.distanceM)} km`)
    bits.push(fmtClock(a.movingTime))
    if (a.distanceM > 0) {
      bits.push(
        FOOT_SPORTS.has(a.sportType) ? fmtPace(a.distanceM, a.movingTime) : fmtSpeed(a.avgSpeedMs)
      )
    }
    meta.textContent = bits.filter(Boolean).join(' · ')
    body.append(name, meta)

    const when = document.createElement('time')
    when.className = 'act-when'
    when.dateTime = a.startDate
    when.textContent = relTime(a.startDate, lang)

    card.append(tag, body, when)
    frag.append(card)
  }
  host.replaceChildren(frag)
}

export async function initStrava(): Promise<void> {
  const section = document.getElementById('strava')
  const host = document.getElementById('strava-acts')
  if (!section || !host) return

  let data: Payload
  try {
    const res = await fetch('/api/strava', { headers: { Accept: 'application/json' } })
    if (!res.ok) return
    data = (await res.json()) as Payload
  } catch {
    return
  }

  if (!data.configured || !data.activities.length) return

  const lang = document.documentElement.lang || 'en'
  const labels = sportLabels()

  if (data.totals) {
    setNum('strava-dist', Math.round(data.totals.distanceM / 1000).toString())
    const hours = data.totals.movingTime / 3600
    setNum('strava-time', hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1))
    setNum('strava-days', data.totals.activeDays.toString())
  }

  renderActivities(host, data.activities, labels, lang)

  section.hidden = false
  requestAnimationFrame(() => section.classList.add('strava-on'))
}
