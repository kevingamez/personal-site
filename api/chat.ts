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

// ───────── Limits ─────────

const DAILY_LIMIT = 20
const MAX_MESSAGE_CHARS = 2000
const MAX_TOTAL_CHARS = 12_000
const MAX_HISTORY = 8

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

const persistentLimiter = (() => {
  if (!kvUrl || !kvToken) return null
  try {
    const redis = new Redis({ url: kvUrl, token: kvToken })
    return new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(DAILY_LIMIT, '1 d'),
      prefix: 'kg-chat-rl',
      analytics: false,
    })
  } catch {
    return null
  }
})()

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

function jsonError(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ───────── Handler ─────────

// Resolve the client IP from Vercel-controlled headers only. `x-forwarded-for`
// is appended-to by the platform, so its left-most value is whatever the client
// sent — never trust it for rate-limit keys. `x-real-ip` / `x-vercel-forwarded-for`
// are set by Vercel's proxy and overwrite anything the client supplies.
function clientIp(req: Request): string | null {
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const vff = req.headers.get('x-vercel-forwarded-for')
  if (vff) return vff.split(',')[0].trim()
  return null
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Use POST', { status: 405 })
  }

  // 1. Origin check — the first line of defense against cross-origin abuse.
  const origin = req.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    return jsonError(403, 'forbidden', 'Origin not allowed.')
  }

  // 2. Parse + validate body BEFORE spending a rate-limit token, so malformed
  //    requests can't drain an IP's daily quota.
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError(400, 'bad_json', 'Could not parse JSON body.')
  }
  const parsed = ChatBodySchema.safeParse(raw)
  if (!parsed.success) {
    return jsonError(400, 'bad_shape', 'Body does not match expected schema.')
  }

  // 3. Length check (defense in depth — zod already caps each message; here we
  //    sum the whole conversation).
  const totalChars = parsed.data.messages.reduce((s, m) => s + m.content.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    return jsonError(413, 'too_long', 'Conversation too long. Start a new one.')
  }

  // 4. Backend config.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return jsonError(500, 'no_key', 'Backend not configured (no ANTHROPIC_API_KEY).')
  }

  // 5. Rate limit (per IP, only for well-formed requests). When no trusted IP
  //    is resolvable (e.g. local dev) we use a single per-instance in-memory
  //    bucket rather than keying on spoofable input.
  const ip = clientIp(req)
  const rl = await checkRateLimit(ip ?? 'local')
  if (!rl.allowed) {
    return jsonError(429, 'rate_limit', 'Daily limit reached. Try again tomorrow.')
  }

  // 6. Trim history before sending to the model.
  const messages = parsed.data.messages.slice(-MAX_HISTORY)

  const client = new Anthropic({ apiKey })

  const stream = new TransformStream<Uint8Array, Uint8Array>()
  const writer = stream.writable.getWriter()
  const enc = new TextEncoder()

  // Writes never throw out of the streaming task: once the client disconnects
  // the writer rejects, and we just stop instead of crashing the detached IIFE.
  const send = async (event: Record<string, unknown>): Promise<void> => {
    try {
      await writer.write(enc.encode(`data: ${JSON.stringify(event)}\n\n`))
    } catch {
      /* client disconnected — nothing to do */
    }
  }

  ;(async () => {
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
        { signal: req.signal }
      )

      for await (const event of response as unknown as AsyncIterable<{
        type: string
        index?: number
        delta?: { type?: string; text?: string }
        content_block?: { type?: string; name?: string; input?: unknown }
      }>) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          await send({ type: 'text_delta', text: event.delta.text || '' })
        } else if (
          event.type === 'content_block_start' &&
          (event.content_block?.type === 'tool_use' ||
            event.content_block?.type === 'server_tool_use')
        ) {
          await send({
            type: 'tool_use',
            name: event.content_block.name,
            input: event.content_block.input,
          })
        }
      }
      await send({ type: 'done' })
      try {
        await writer.write(enc.encode('data: [DONE]\n\n'))
      } catch {
        /* client disconnected */
      }
    } catch (err) {
      // A client abort is expected, not an error — don't log it or try to write
      // to a stream that's already gone. For anything else, log the real cause
      // server-side and hand the client a generic message (never leak internals).
      if (!req.signal?.aborted) {
        console.error('[api/chat] stream error:', err)
        await send({ type: 'error', message: 'Sorry, something went wrong generating a reply.' })
      }
    } finally {
      await writer.close().catch(() => {})
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Restrict CORS to the allowlist (echoing the validated origin).
      'Access-Control-Allow-Origin': origin || '',
      Vary: 'Origin',
      'X-RateLimit-Remaining': String(rl.remaining),
      'X-RateLimit-Limit': String(DAILY_LIMIT),
    },
  })
}
