// KV (Upstash Redis) cache helpers for /api/strava: client setup from env,
// hard-timeout wrapper, and get/set of the cached Payload.

import { Redis } from '@upstash/redis'

import type { Payload } from './strava-shape'

const CACHE_KEY = 'kg-strava:v4'
const REDIS_TIMEOUT_MS = 2000

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

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])
}

export async function cacheGet(): Promise<Payload | null> {
  if (!redis) return null
  return withTimeout(
    redis.get<Payload>(CACHE_KEY).catch(() => null),
    REDIS_TIMEOUT_MS,
    null
  )
}
export async function cacheSet(payload: Payload, ttl: number): Promise<void> {
  if (!redis) return
  await withTimeout(
    redis
      .set(CACHE_KEY, payload, { ex: ttl })
      .then(() => null)
      .catch(() => null),
    REDIS_TIMEOUT_MS,
    null
  )
}
