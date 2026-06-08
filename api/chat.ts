// Vercel Serverless Function - /api/chat
//
// Streams an Anthropic Claude response back to the home-page console as SSE
// events. Hardened against:
//   - Cross-origin abuse: only requests from kevingamez.co/.com (or localhost
//     during dev) are accepted; everything else gets 403.
//   - Oversized inputs: each message capped at MAX_MESSAGE_CHARS, total
//     conversation capped at MAX_TOTAL_CHARS, history capped at 8 messages.
//   - Schema confusion: zod parses the request body and rejects malformed shapes.
//   - Token cost: max_tokens 512 (was 1024), and we slice history to 8.
//   - Bot abuse: per-IP daily rate limit, keyed on the Vercel-set client IP
//     (persistent via KV when configured, in-memory otherwise). The body is
//     validated before a token is spent so junk requests can't drain the quota.
//
// Required env: ANTHROPIC_API_KEY.

import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { z } from 'zod'

export const config = { runtime: 'nodejs' }

interface Req {
  method?: string
  headers: Record<string, string | string[] | undefined>
  on(event: 'data', cb: (chunk: Buffer | string) => void): void
  on(event: 'end', cb: () => void): void
  on(event: 'error', cb: (err: unknown) => void): void
  on(event: 'close', cb: () => void): void
}
interface Res {
  status(code: number): Res
  setHeader(name: string, value: string): void
  write(chunk: string): void
  end(body?: string): void
  writableEnded?: boolean
}

// ───────── Limits ─────────

const DAILY_LIMIT = 20
const MAX_MESSAGE_CHARS = 2000
const MAX_TOTAL_CHARS = 12_000
const MAX_HISTORY = 8
// Hard ceiling on the request body we buffer. The largest valid payload is
// ~12k chars of messages plus JSON overhead; 64 KB is generous.
const MAX_BODY_BYTES = 64 * 1024
// Global daily cap across ALL IPs — a backstop against distributed abuse that a
// per-IP limit can't bound. Only enforced when KV/Upstash is configured.
const GLOBAL_DAILY_LIMIT = 1000

// ───────── Origin allowlist ─────────

const ALLOWED_ORIGINS = new Set([
  'https://kevingamez.co',
  'https://www.kevingamez.co',
  'https://kevingamez.com',
  'https://www.kevingamez.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
])

// Vercel injects the canonical production + branch hostnames at run time; trust
// those exactly. We also allow this project's own preview deploys, whose
// hostnames always start with the project name ("personal-site-…"). This is far
// tighter than a blanket `*.vercel.app` rule, which would accept any project.
const VERCEL_ORIGINS = new Set(
  [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
    .filter((h): h is string => Boolean(h))
    .map((h) => `https://${h}`)
)

const PREVIEW_ORIGIN_RE = /^https:\/\/personal-site-[a-z0-9-]+\.vercel\.app$/

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  if (VERCEL_ORIGINS.has(origin)) return true
  return PREVIEW_ORIGIN_RE.test(origin)
}

// ───────── Rate limit ─────────
//
// Per-IP daily cap. Persistent via Upstash / Vercel KV when configured, with an
// in-memory fallback (correct only per warm instance) when KV is absent or
// momentarily unreachable. The IP comes from Vercel-set headers only, so it
// can't be spoofed or rotated by the client (see clientIp in the handler).

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

async function checkGlobalLimit(): Promise<boolean> {
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

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
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

// ───────── Schema ─────────

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
})
const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
})

// ───────── System prompt ─────────

const KEVIN_CONTEXT = `You are a helpful assistant embedded on Kevin Gámez's personal website (kevingamez.co).
Kevin's facts (only state these as facts; otherwise use web_search):
- Founding engineer at Enttor (June 2025–present), based in New York / Bogotá. AI outbound platform: browser automation for Instagram & LinkedIn prospecting, OpenAI pipelines, Next.js dashboards, NestJS APIs, Vercel infra, Supabase + Inngest backend.
- Previously founding engineer at Samsam (Feb 2024–Mar 2025), e-commerce: TypeScript / React Native / Next.js / Prisma / PostgreSQL.
- M.Sc. Information Engineering (deep-learning specialization) at Universidad de los Andes (Jan 2024–May 2025); concurrent graduate teaching assistant. B.Sc. Systems and Computing (Jan 2019–Dec 2023), Andrés Bello National Distinction.
- Public GitHub @kevingamez. Notable repos: personal-site (TS), AD_ASTRA2023-SpaceInvaders (Python, aerial deforestation detection, OpenCV / YOLOv5 / FastAPI), Palladium_Chat (TS), budget-app (Swift), GCP-CloudRun (Dockerfile).
- Languages he ships: TypeScript, Python, Swift, JavaScript, Java, Dart.
- Contact: kevingamez.kg@gmail.com, github.com/kevingamez, linkedin.com/in/kevin-gamez.

Be concise (2-4 sentences for casual chat). Use markdown sparingly: **bold** for names, \`code\` for tech, [text](url) for links. When asked about anything time-sensitive or outside Kevin's profile, use web_search. Never invent stars, metrics, or projects that aren't listed above.`

// ───────── Helpers ─────────

function header(req: Req, name: string): string | null {
  const value = req.headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function writeJson(res: Res, status: number, body: unknown): void {
  res.status(status)
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function jsonError(res: Res, status: number, error: string, message: string): void {
  writeJson(res, status, { error, message })
}

function readJsonBody(req: Req, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    let body = ''
    req.on('data', (chunk) => {
      const part = String(chunk)
      size += Buffer.byteLength(part)
      if (size > maxBytes) {
        reject(new Error('too_large'))
        return
      }
      body += part
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('bad_json'))
      }
    })
    req.on('error', reject)
  })
}

// ───────── Handler ─────────

// Resolve the client IP from Vercel-controlled headers only. `x-forwarded-for`
// is appended-to by the platform, so its left-most value is whatever the client
// sent — never trust it for rate-limit keys. `x-real-ip` / `x-vercel-forwarded-for`
// are set by Vercel's proxy and overwrite anything the client supplies.
function clientIp(req: Req): string | null {
  const real = header(req, 'x-real-ip')
  if (real) return real.trim()
  const vff = header(req, 'x-vercel-forwarded-for')
  if (vff) return vff.split(',')[0].trim()
  return null
}

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).end('Use POST')
    return
  }

  // 1. Origin check — the first line of defense against cross-origin abuse.
  const origin = header(req, 'origin')
  if (!isOriginAllowed(origin)) {
    jsonError(res, 403, 'forbidden', 'Origin not allowed.')
    return
  }

  // 2. Reject oversized bodies before buffering them into memory.
  const contentLength = Number(header(req, 'content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    jsonError(res, 413, 'too_large', 'Request body too large.')
    return
  }

  // 3. Parse + validate body BEFORE spending a rate-limit token, so malformed
  //    requests can't drain an IP's daily quota.
  let raw: unknown
  try {
    raw = await readJsonBody(req, MAX_BODY_BYTES)
  } catch (err) {
    if (err instanceof Error && err.message === 'too_large') {
      jsonError(res, 413, 'too_large', 'Request body too large.')
      return
    }
    jsonError(res, 400, 'bad_json', 'Could not parse JSON body.')
    return
  }
  const parsed = ChatBodySchema.safeParse(raw)
  if (!parsed.success) {
    jsonError(res, 400, 'bad_shape', 'Body does not match expected schema.')
    return
  }

  // 4. Length check (defense in depth — zod already caps each message; here we
  //    sum the whole conversation).
  const totalChars = parsed.data.messages.reduce((s, m) => s + m.content.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    jsonError(res, 413, 'too_long', 'Conversation too long. Start a new one.')
    return
  }

  // 5. Backend config.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    jsonError(res, 500, 'no_key', 'Backend not configured (no ANTHROPIC_API_KEY).')
    return
  }

  // 6. Rate limit (per IP, only for well-formed requests). When no trusted IP
  //    is resolvable (e.g. local dev) we use a single per-instance in-memory
  //    bucket rather than keying on spoofable input.
  const ip = clientIp(req)
  const rl = await checkRateLimit(ip ?? 'local')
  if (!rl.allowed) {
    jsonError(res, 429, 'rate_limit', 'Daily limit reached. Try again tomorrow.')
    return
  }
  // Global backstop across all IPs (bounds total cost under IP rotation).
  if (!(await checkGlobalLimit())) {
    jsonError(res, 429, 'busy', 'The assistant is busy right now. Try again later.')
    return
  }

  // 7. Trim history before sending to the model.
  const messages = parsed.data.messages.slice(-MAX_HISTORY)

  const client = new Anthropic({ apiKey })
  const abort = new AbortController()
  req.on('close', () => abort.abort())

  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', origin || '')
  res.setHeader('Vary', 'Origin')
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining))
  res.setHeader('X-RateLimit-Limit', String(DAILY_LIMIT))

  // Writes never throw out of the streaming task: once the client disconnects
  // the writer rejects, and we just stop instead of crashing the detached IIFE.
  const send = (event: Record<string, unknown>): void => {
    if (res.writableEnded) return
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    } catch {
      /* client disconnected — nothing to do */
    }
  }

  try {
    const response = await client.messages.create(
      {
        model: 'claude-sonnet-4-5',
        max_tokens: 512,
        stream: true,
        system: KEVIN_CONTEXT,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          } as unknown as Anthropic.Tool,
        ],
        messages: messages as Anthropic.MessageParam[],
      },
      // Propagate client disconnects so we stop generating (and billing) the
      // moment the browser goes away.
      { signal: abort.signal }
    )

    for await (const event of response as unknown as AsyncIterable<{
      type: string
      index?: number
      delta?: { type?: string; text?: string }
      content_block?: { type?: string; name?: string; input?: unknown }
    }>) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        send({ type: 'text_delta', text: event.delta.text || '' })
      } else if (
        event.type === 'content_block_start' &&
        (event.content_block?.type === 'tool_use' ||
          event.content_block?.type === 'server_tool_use')
      ) {
        send({
          type: 'tool_use',
          name: event.content_block.name,
          input: event.content_block.input,
        })
      }
    }
    send({ type: 'done' })
    if (!res.writableEnded) res.write('data: [DONE]\n\n')
  } catch (err) {
    // A client abort is expected, not an error. For anything else, log the real
    // cause server-side and hand the client a generic message (never leak internals).
    if (!abort.signal.aborted) {
      console.error('[api/chat] stream error:', err)
      send({ type: 'error', message: 'Sorry, something went wrong generating a reply.' })
    }
  } finally {
    if (!res.writableEnded) res.end()
  }
}
