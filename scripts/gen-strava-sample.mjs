// Refresh the dev-only Strava snapshot used by `astro dev` (which can't run the
// /api/strava function). Bakes REAL data — including decoded, bbox-normalized
// route shapes + raw polylines for the maps — into src/scripts/home/strava-sample.ts.
// Mirrors the /api/strava pipeline. Run: node scripts/gen-strava-sample.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const EIFFEL_M = 330
const ROUTE_PTS = 160
const LONGEST_SPORTS = 3

function decodePolyline(str) {
  let index = 0
  let lat = 0
  let lng = 0
  const out = []
  while (index < str.length) {
    let shift = 0
    let result = 0
    let b
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0
    result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    out.push([lat / 1e5, lng / 1e5])
  }
  return out
}
function extractRoute(poly, maxPts) {
  if (!poly) return null
  const pts = decodePolyline(poly)
  if (pts.length < 2) return null
  const meanLat = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const k = Math.cos((meanLat * Math.PI) / 180)
  const proj = pts.map(([la, ln]) => [ln * k, la])
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of proj) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const span = Math.max(maxX - minX, maxY - minY)
  if (span === 0) return null
  const scale = 1000 / span
  const step = Math.max(1, Math.floor(proj.length / maxPts))
  const points = []
  for (let i = 0; i < proj.length; i += step)
    points.push([Math.round((proj[i][0] - minX) * scale), Math.round((maxY - proj[i][1]) * scale)])
  const last = proj[proj.length - 1]
  points.push([Math.round((last[0] - minX) * scale), Math.round((maxY - last[1]) * scale)])
  return { points, w: Math.round((maxX - minX) * scale), h: Math.round((maxY - minY) * scale) }
}
const localDate = (a) => (a.start_date_local || a.start_date).slice(0, 10)
const mondayOf = (date) => {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
const weekdayMon = (date) => (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7
const toAct = (a) => ({
  name: a.name,
  sportType: a.sport_type || a.type || 'Workout',
  distanceM: a.distance || 0,
  movingTime: a.moving_time || 0,
  elevationM: a.total_elevation_gain || 0,
  avgSpeedMs: a.average_speed || 0,
  startDate: a.start_date,
  url: `https://www.strava.com/activities/${a.id}`,
  route: extractRoute(a.map?.summary_polyline, ROUTE_PTS),
  polyline: a.map?.summary_polyline ?? null,
})
const toEffort = (a) => ({
  name: a.name,
  startDate: a.start_date,
  url: `https://www.strava.com/activities/${a.id}`,
  distanceM: a.distance || 0,
  elevationM: a.total_elevation_gain || 0,
  avgSpeedMs: a.average_speed || 0,
})

function shape(raw) {
  let distanceM = 0
  let movingTime = 0
  let elevationM = 0
  const activeDays = new Set()
  const wd = [0, 0, 0, 0, 0, 0, 0]
  const weekMap = new Map()
  const bySport = new Map()
  let climb = null
  let fast = null
  for (const a of raw) {
    const dist = a.distance || 0
    distanceM += dist
    movingTime += a.moving_time || 0
    elevationM += a.total_elevation_gain || 0
    const ld = localDate(a)
    activeDays.add(ld)
    wd[weekdayMon(ld)]++
    weekMap.set(mondayOf(ld), (weekMap.get(mondayOf(ld)) || 0) + dist)
    const sp = a.sport_type || a.type || 'Workout'
    const cur = bySport.get(sp)
    if (!cur || (a.moving_time || 0) > (cur.moving_time || 0)) bySport.set(sp, a)
    if (!climb || (a.total_elevation_gain || 0) > (climb.total_elevation_gain || 0)) climb = a
    if (!fast || (a.average_speed || 0) > (fast.average_speed || 0)) fast = a
  }
  let bws = null
  let bwd = 0
  for (const [ws, dist] of weekMap)
    if (dist > bwd) {
      bwd = dist
      bws = ws
    }
  let bd = null
  let bdc = 0
  for (let d = 0; d < 7; d++)
    if (wd[d] > bdc) {
      bdc = wd[d]
      bd = d
    }
  const longestBySport = [...bySport.values()]
    .filter((a) => (a.moving_time || 0) > 0)
    .sort((a, b) => (b.moving_time || 0) - (a.moving_time || 0))
    .slice(0, LONGEST_SPORTS)
    .map(toAct)
  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    totals: { distanceM, movingTime, elevationM, count: raw.length, activeDays: activeDays.size },
    longestBySport,
    insights: {
      biggestWeekStart: bws,
      biggestWeekDistanceM: bwd,
      busiestWeekday: bd,
      busiestWeekdayCount: bdc,
      biggestClimb: climb && (climb.total_elevation_gain || 0) > 0 ? toEffort(climb) : null,
      fastest: fast && (fast.average_speed || 0) > 0 ? toEffort(fast) : null,
      eiffels: Math.round(elevationM / EIFFEL_M),
    },
  }
}

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const tr = await (
  await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: env.STRAVA_REFRESH_TOKEN,
    }),
  })
).json()
if (!tr.access_token) {
  console.error('token refresh failed:', tr)
  process.exit(1)
}
let raw = []
for (let page = 1; page <= 10; page++) {
  const r = await (
    await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`, {
      headers: { Authorization: `Bearer ${tr.access_token}` },
    })
  ).json()
  if (!Array.isArray(r) || !r.length) break
  raw = raw.concat(r)
  if (r.length < 200) break
}
const payload = shape(raw)
const esc = JSON.stringify(payload).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const out = `// AUTO-GENERATED dev snapshot of real Strava data (node scripts/gen-strava-sample.mjs).
// Dev-only: shown under \`astro dev\`, which can't run /api/strava. The real, live
// data flows through /api/strava in production. Stripped from prod builds.
export function devSample() {
  return JSON.parse(
    '${esc}'
  )
}
`
writeFileSync(new URL('../src/scripts/home/strava-sample.ts', import.meta.url), out)
console.log(
  'baked snapshot · activities:',
  Array.isArray(raw) ? raw.length : 0,
  '· sports:',
  payload.longestBySport.map((a) => a.sportType).join(', ')
)
