// Rate limiting for /api/chat: per-IP daily cap + global backstop in KV/Upstash, fail-closed readiness.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const DAILY_LIMIT = 20
// Global daily cap across ALL IPs - a backstop against distributed abuse that a
// per-IP limit can't bound. Only enforced when KV/Upstash is configured.
const GLOBAL_DAILY_LIMIT = 1000

// ───────── Rate limit ─────────
//
// Per-IP daily cap. Persistent via Upstash / Vercel KV when configured, with an
// in-memory fallback (correct only per warm instance) when KV is absent or
// momentarily unreachable. The IP comes from Vercel-set headers only, so it
// can't be spoofed or rotated by the client (see clientIp in the handler).

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const redis = (() => {
  if (!kvUrl || !kvToken) return null
  try {
    return new Redis({ url: kvUrl, token: kvToken })
  } catch {
    return null
  }
})()

const persistentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(DAILY_LIMIT, '1 d'),
      prefix: 'kg-chat-rl',
      analytics: false,
    })
  : null

// Global backstop: caps total daily requests across every IP, so IP rotation
// can't run up an unbounded model bill.
const globalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(GLOBAL_DAILY_LIMIT, '1 d'),
      prefix: 'kg-chat-global',
      analytics: false,
    })
  : null

// Persistent rate limiting (per-IP cap + global backstop) lives in KV/Upstash.
// When a model key is configured but KV is not, there is NO durable cost ceiling
// across instances/IPs, so the handler fails closed (503) rather than serving the
// model unbounded. A loud startup log makes a missing or rotated KV token obvious.
//
// ...except on a local dev server, where the premise does not hold. The reason
// the in-memory limiter is not a real ceiling is that a deployment is many
// instances behind a load balancer, so each one counts its own bucket; `next
// dev` is a single process on one machine that nobody else can reach. Failing
// closed there only meant the console was dead locally for anyone without an
// Upstash database, which is every fresh checkout. Production still refuses.
const IS_LOCAL_DEV = process.env.NODE_ENV !== 'production' && !process.env.VERCEL
export const RATE_LIMIT_READY = redis !== null || IS_LOCAL_DEV
if (process.env.ANTHROPIC_API_KEY && redis === null) {
  console[IS_LOCAL_DEV ? 'warn' : 'error'](
    '[api/chat] ANTHROPIC_API_KEY is set but KV/Upstash is not configured. ' +
      (IS_LOCAL_DEV
        ? 'Falling back to the in-memory limiter for local development; set KV_REST_API_URL and KV_REST_API_TOKEN to exercise the real path.'
        : 'Persistent rate limiting is unavailable - chat requests will be refused (503).')
  )
}

export async function checkGlobalLimit(): Promise<boolean> {
  if (!globalLimiter) return true
  try {
    return (await globalLimiter.limit('all')).success
  } catch {
    return true // KV hiccup: don't hard-fail; the per-IP limit still applies.
  }
}

const buckets = new Map<string, { count: number; reset: number }>()

function memoryLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  let b = buckets.get(ip)
  if (!b || b.reset < now) {
    b = { count: 0, reset: now + day }
    buckets.set(ip, b)
  }
  if (b.count >= DAILY_LIMIT) return { allowed: false, remaining: 0 }
  b.count++
  return { allowed: true, remaining: DAILY_LIMIT - b.count }
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (persistentLimiter) {
    try {
      const r = await persistentLimiter.limit(ip)
      return { allowed: r.success, remaining: r.remaining }
    } catch {
      // Redis hiccup: degrade to the in-memory limiter instead of 500-ing.
      return memoryLimit(ip)
    }
  }
  return memoryLimit(ip)
}
