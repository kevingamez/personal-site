// Strava "movement" section orchestrator. Fetches the distilled snapshot from
// /api/strava, renders the hero counters, weekly chart, insight tiles, training
// heatmap, and recent strip, then plays the reveal animations when the section
// scrolls into view. Fails silent: if the endpoint isn't routed, isn't
// configured, errors, or has no activity, the section just stays hidden.

import { buildSparkline, buildWeekly, buildHeatmap, type Week, type Day } from './strava-charts'

interface Totals {
  distanceM: number
  movingTime: number
  elevationM: number
  count: number
  activeDays: number
}
interface Insights {
  longest: {
    name: string
    distanceM: number
    sportType: string
    startDate: string
    url: string
  } | null
  biggestWeekStart: string | null
  biggestWeekDistanceM: number
  busiestWeekday: number | null
  busiestWeekdayCount: number
  avgSpeedMs: number
  eiffels: number
}
interface RecentActivity {
  name: string
  sportType: string
  distanceM: number
  movingTime: number
  avgSpeedMs: number
  startDate: string
  url: string
}
interface Payload {
  configured: boolean
  error?: boolean
  totals: Totals | null
  weekly: Week[]
  calendar: Day[]
  calendarWeeks: number
  insights: Insights
  recent: RecentActivity[]
}

const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

let SPORTS: Record<string, string> = {}
let WEEK_OF = 'week of'
let COMPARE = '× the Eiffel Tower'

function readI18n(): void {
  const el = document.getElementById('strava-i18n')
  if (!el?.textContent) return
  try {
    const j = JSON.parse(el.textContent) as {
      sports?: Record<string, string>
      weekOf?: string
      climbedCompare?: string
    }
    SPORTS = j.sports || {}
    if (j.weekOf) WEEK_OF = j.weekOf
    if (j.climbedCompare) COMPARE = j.climbedCompare
  } catch {
    /* leave defaults */
  }
}

const km = (m: number): string => (m / 1000).toFixed(1)
const clock = (s: number): string => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}
const pace = (m: number, s: number): string => {
  if (m <= 0) return ''
  const per = s / (m / 1000)
  let mm = Math.floor(per / 60)
  let ss = Math.round(per % 60)
  if (ss >= 60) {
    mm += 1
    ss = 0
  }
  return `${mm}:${String(ss).padStart(2, '0')}/km`
}
const speed = (ms: number): string => `${(ms * 3.6).toFixed(1)} km/h`

function relTime(iso: string, lang: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  return Math.abs(days) >= 7 ? rtf.format(Math.round(days / 7), 'week') : rtf.format(days, 'day')
}
function shortDate(date: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  )
}
function weekdayName(idx: number, lang: string): string {
  const ref = new Date(Date.UTC(2024, 0, 1 + idx)) // 2024-01-01 is a Monday
  const s = new Intl.DateTimeFormat(lang, { weekday: 'long', timeZone: 'UTC' }).format(ref)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

// Collect count-up closures; run them (and flip the `.on` reveal classes) once
// the section scrolls into view.
const plays: (() => void)[] = []
function countUp(id: string, target: number, fmt: (n: number) => string): void {
  const el = document.getElementById(id)
  if (!el) return
  plays.push(() => {
    if (REDUCE) {
      el.textContent = fmt(target)
      return
    }
    const dur = 1400
    const t0 = performance.now()
    const tick = (now: number): void => {
      const p = Math.min(1, (now - t0) / dur)
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
      else el.textContent = fmt(target)
    }
    requestAnimationFrame(tick)
  })
}

function renderRecent(host: HTMLElement, acts: RecentActivity[], lang: string): void {
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
    tag.append(dot, document.createTextNode(SPORTS[a.sportType] || a.sportType))

    const body = document.createElement('div')
    body.className = 'act-body'
    const name = document.createElement('div')
    name.className = 'act-name'
    name.textContent = a.name
    const meta = document.createElement('div')
    meta.className = 'act-meta'
    const bits: string[] = []
    if (a.distanceM > 0) bits.push(`${km(a.distanceM)} km`)
    bits.push(clock(a.movingTime))
    if (a.distanceM > 0)
      bits.push(
        FOOT_SPORTS.has(a.sportType) ? pace(a.distanceM, a.movingTime) : speed(a.avgSpeedMs)
      )
    meta.textContent = bits.filter(Boolean).join(' · ')
    body.append(name, meta)

    const when = document.createElement('time')
    when.className = 'act-when'
    when.dateTime = a.startDate
    when.textContent = relTime(a.startDate, lang)

    card.append(tag, body, when)
    frag.appendChild(card)
  }
  host.replaceChildren(frag)
}

function fillInsights(ins: Insights, lang: string): void {
  if (ins.longest) {
    countUp('sv-longest-val', ins.longest.distanceM, (n) => `${km(n)} km`)
    setText('sv-longest-sub', ins.longest.name)
  }
  countUp('sv-biggest-val', ins.biggestWeekDistanceM, (n) => `${Math.round(n / 1000)} km`)
  if (ins.biggestWeekStart)
    setText('sv-biggest-sub', `${WEEK_OF} ${shortDate(ins.biggestWeekStart, lang)}`)
  // (climbed is counted up by the caller so it shares the reveal trigger)
  if (ins.busiestWeekday !== null) {
    setText('sv-busiest-val', weekdayName(ins.busiestWeekday, lang))
    setText('sv-busiest-sub', `${ins.busiestWeekdayCount}×`)
  }
}

export async function initStrava(): Promise<void> {
  const section = document.getElementById('strava')
  if (!section) return

  let data: Payload
  try {
    const res = await fetch('/api/strava', { headers: { Accept: 'application/json' } })
    if (!res.ok) return
    data = (await res.json()) as Payload
  } catch {
    return
  }
  if (!data.configured || !data.totals || !data.recent.length) return

  readI18n()
  const lang = document.documentElement.lang || 'en'
  const t = data.totals

  // hero counters
  countUp('sv-km', t.distanceM / 1000, (n) => String(Math.round(n)))
  countUp('sv-hours', t.movingTime / 3600, (n) => (n >= 10 ? String(Math.round(n)) : n.toFixed(1)))
  countUp('sv-elev', t.elevationM, (n) => Math.round(n).toLocaleString(lang))
  countUp('sv-acts', t.count, (n) => String(Math.round(n)))

  // insights (climbed counted up here so it shares the reveal trigger)
  fillInsights(data.insights, lang)
  countUp(
    'sv-climbed-val',
    data.totals.elevationM,
    (n) => `${Math.round(n).toLocaleString(lang)} m`
  )
  setText('sv-climbed-sub', `≈ ${data.insights.eiffels} ${COMPARE}`)

  // charts
  const spark = document.getElementById('sv-spark')
  const weekly = document.getElementById('sv-weekly')
  const heat = document.getElementById('sv-heat')
  const recent = document.getElementById('sv-acts-list')
  if (spark) buildSparkline(spark, data.weekly)
  if (weekly)
    buildWeekly(weekly, data.weekly, {
      lang,
      weekOf: WEEK_OF,
      peakEl: document.getElementById('sv-weekly-peak'),
    })
  if (heat) buildHeatmap(heat, data.calendar, data.calendarWeeks)
  if (recent) renderRecent(recent, data.recent, lang)

  // reveal + play animations when the section enters view
  section.hidden = false
  const play = (): void => {
    plays.forEach((f) => f())
    ;[spark, weekly, heat, section].forEach((el) => el?.classList.add('on'))
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
