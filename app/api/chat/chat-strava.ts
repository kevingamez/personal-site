// Strava tool for /api/chat: get_strava_stats definition + cached-snapshot reader.

import Anthropic from '@anthropic-ai/sdk'

import { redis } from './chat-ratelimit'

// ───────── Strava tool (get_strava_stats) ─────────
//
// /api/strava caches a sanitized snapshot of Kevin's full Strava history in the
// SAME Upstash/KV store this function uses, under the key below. The chat model
// pulls it ON DEMAND via the get_strava_stats tool (only when a visitor asks
// about movement/training), so ordinary chats stay cheap. We read the cache
// directly - never the Strava API - so there's no OAuth round-trip or cold-fetch
// latency; a cold cache or unconfigured Strava degrades gracefully. Keep
// STRAVA_CACHE_KEY in sync with api/strava.ts (currently 'kg-strava:v4').
const STRAVA_CACHE_KEY = 'kg-strava:v4'
const STRAVA_READ_TIMEOUT_MS = 1500
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface StravaSnapshot {
  generatedAt?: string
  totals?: {
    distanceM: number
    movingTime: number
    elevationM: number
    count: number
    activeDays: number
  } | null
  longestBySport?: {
    name: string
    sportType: string
    distanceM: number
    movingTime: number
    elevationM: number
    startDate: string
  }[]
  insights?: {
    biggestWeekStart: string | null
    biggestWeekDistanceM: number
    busiestWeekday: number | null
    biggestClimb: { name: string; elevationM: number } | null
    fastest: { name: string; avgSpeedMs: number } | null
    eiffels: number
  }
}

const fmtKm = (m: number): string => (m / 1000).toFixed(1)
const fmtHm = (s: number): string => {
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}

async function stravaSnapshotText(): Promise<string | null> {
  if (!redis) return null
  let snap: StravaSnapshot | null = null
  try {
    snap = await Promise.race([
      redis.get<StravaSnapshot>(STRAVA_CACHE_KEY),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), STRAVA_READ_TIMEOUT_MS)),
    ])
  } catch {
    return null
  }
  if (!snap || !snap.totals) return null

  const t = snap.totals
  const lines = [
    `- All-time totals: ${fmtKm(t.distanceM)} km across ${t.count} activities, ${fmtHm(t.movingTime)} moving, ${Math.round(t.elevationM)} m climbed, active on ${t.activeDays} days.`,
  ]
  const efforts = snap.longestBySport ?? []
  if (efforts.length) {
    lines.push('- Longest effort per sport:')
    for (const a of efforts.slice(0, 3)) {
      lines.push(
        `  - ${a.sportType}: "${a.name}" - ${fmtKm(a.distanceM)} km, ${fmtHm(a.movingTime)}, ${Math.round(a.elevationM)} m gain (${a.startDate.slice(0, 10)})`
      )
    }
  }
  const ins = snap.insights
  if (ins) {
    const bits: string[] = []
    if (ins.biggestWeekStart)
      bits.push(
        `biggest week ${fmtKm(ins.biggestWeekDistanceM)} km (week of ${ins.biggestWeekStart})`
      )
    if (ins.biggestClimb)
      bits.push(
        `biggest climb ${Math.round(ins.biggestClimb.elevationM)} m ("${ins.biggestClimb.name}")`
      )
    if (ins.fastest)
      bits.push(
        `fastest avg ${(ins.fastest.avgSpeedMs * 3.6).toFixed(1)} km/h ("${ins.fastest.name}")`
      )
    if (ins.busiestWeekday != null) bits.push(`busiest day ${WEEKDAYS[ins.busiestWeekday] ?? '?'}`)
    if (bits.length) lines.push(`- Insights: ${bits.join('; ')}.`)
  }

  const freshness = snap.generatedAt ? `, snapshot generated ${snap.generatedAt}` : ''
  return `Kevin's Strava stats (cached${freshness}, refreshed about every 10 minutes):\n${lines.join('\n')}`
}

export const STRAVA_TOOL: Anthropic.Tool = {
  name: 'get_strava_stats',
  description:
    "Get Kevin's real training data from Strava: all-time totals (distance, moving time, elevation, activity count, active days), the longest effort per sport, and insights (biggest week, biggest single climb, fastest average pace, busiest weekday). Call this for ANY question about Kevin's running, cycling, hiking, swimming, or training/fitness. Returns a cached snapshot refreshed about every 10 minutes; takes no arguments.",
  input_schema: { type: 'object', properties: {} },
}

export async function runStravaTool(): Promise<string> {
  const text = await stravaSnapshotText()
  return (
    text ??
    'No live Strava data is available right now (the cache is cold or Strava is not configured). Tell the visitor to check the movement section of the site for the latest.'
  )
}
