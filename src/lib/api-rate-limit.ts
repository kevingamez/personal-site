// Rate limiting for the READ-ONLY public routes: /api/repo, /api/strava,
// /api/weather, /api/geo.
//
// Deliberately NOT the same policy as app/api/chat/chat-ratelimit.ts. That one
// fails CLOSED because every request past it spends money at Anthropic, so an
// unbounded path is a billing incident. These four cost nothing per call, so
// failing closed would take working sections of the page down to prevent an
// expense that does not exist. They fail OPEN instead: if KV is missing or
// Redis hiccups, the request is served.
//
// What they are protecting is upstream quota, not the wallet:
//   /api/repo    fetches a file from GitHub. Up to 400 distinct paths, so the
//                CDN's s-maxage cannot absorb an attacker who rotates `path`.
//                Unauthenticated GitHub allows 60 requests/hour, which a loop
//                exhausts in seconds and takes /dev's source viewer with it.
//   /api/strava  hits Strava on a cache miss. Strava allows 200 per 15 minutes
//                and 2,000 per day, and blowing that degrades the section for
//                everyone until the window rolls.
//   /api/weather one upstream URL behind a 900s revalidate, so it is mostly
//                shielded already. Limited for symmetry, cheaply.
//   /api/geo     no upstream at all, but it is `no-store` by necessity (the
//                answer is per-visitor), so it is the one route where every
//                request is a cold function invocation.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = (() => {
  if (!kvUrl || !kvToken) return null
  try {
    return new Redis({ url: kvUrl, token: kvToken })
  } catch {
    return null
  }
})()

// Resolve the caller from Vercel-controlled headers only. `x-forwarded-for` is
// appended to by the platform, so its left-most value is whatever the client
// sent: never key a limiter on it. Same reasoning as clientIp in api/chat.
export function clientIp(req: Request): string | null {
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const vff = req.headers.get('x-vercel-forwarded-for')
  if (vff) return vff.split(',')[0].trim()
  return null
}

export interface RouteLimit {
  /** Requests allowed per window, per IP. */
  limit: number
  /** Upstash duration string, e.g. '10 m'. */
  window: `${number} ${'s' | 'm' | 'h'}`
}

// One limiter per route name, built lazily and cached: constructing a Ratelimit
// per request would leak a client per invocation.
const limiters = new Map<string, Ratelimit>()

function limiterFor(name: string, cfg: RouteLimit): Ratelimit | null {
  if (!redis) return null
  let l = limiters.get(name)
  if (!l) {
    l = new Ratelimit({
      redis,
      // Sliding window, unlike chat's fixed daily window: these are bursty
      // (opening ten files in the viewer is one user, not an attack) and a
      // sliding window forgives a burst that a fixed window would punish for
      // the rest of the period.
      limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
      prefix: `kg-${name}-rl`,
      analytics: false,
    })
    limiters.set(name, l)
  }
  return l
}

// Per-instance fallback. Not a real ceiling across a fleet, which is exactly
// why chat refuses to rely on it. Here it is a courtesy speed bump, so its
// weakness is acceptable.
const buckets = new Map<string, { count: number; reset: number }>()
const WINDOW_MS: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000 }

function memoryLimit(key: string, cfg: RouteLimit): boolean {
  const [n, unit] = cfg.window.split(' ')
  const ms = Number(n) * (WINDOW_MS[unit] ?? 60_000)
  const now = Date.now()
  let b = buckets.get(key)
  if (!b || b.reset < now) {
    b = { count: 0, reset: now + ms }
    buckets.set(key, b)
  }
  if (b.count >= cfg.limit) return false
  b.count++
  return true
}

/**
 * Returns a 429 Response when the caller is over budget, or `null` to proceed.
 *
 * Fails OPEN on every error path: no KV, malformed IP, Redis unreachable. A
 * monitoring outage must not take the page's decorative sections offline.
 */
export async function limitRoute(
  req: Request,
  name: string,
  cfg: RouteLimit
): Promise<Response | null> {
  const key = clientIp(req) ?? 'local'

  let allowed: boolean
  const limiter = limiterFor(name, cfg)
  if (limiter) {
    try {
      allowed = (await limiter.limit(key)).success
    } catch {
      // KV hiccup: degrade to the in-memory bucket rather than 500-ing or
      // hard-blocking. Still fail-open if that also throws.
      allowed = memoryLimit(`${name}:${key}`, cfg)
    }
  } else {
    allowed = memoryLimit(`${name}:${key}`, cfg)
  }

  if (allowed) return null

  const [n, unit] = cfg.window.split(' ')
  const retry = Math.ceil((Number(n) * (WINDOW_MS[unit] ?? 60_000)) / 1000)
  return new Response(JSON.stringify({ error: 'rate_limit', message: 'Too many requests.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Retry-After': String(retry),
      'Cache-Control': 'no-store',
      'X-RateLimit-Limit': String(cfg.limit),
    },
  })
}
