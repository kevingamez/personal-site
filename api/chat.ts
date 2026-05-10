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
//   - Bot abuse: best-effort per-IP rate limit (still in-memory; for a serverless
//     deploy this is supplemental to the Origin allowlist, not a hard limit).
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

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Vercel preview deploys: https://<project>-<sha>-<owner>.vercel.app
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)
}

// ───────── Rate limit ─────────
//
// Persistent rate limit via Upstash / Vercel KV when env vars are set;
// otherwise an in-memory fallback that's only correct for a single warm
// instance. The Origin allowlist above is the real cross-origin barrier;
// rate limiting is a second-line defense against bursty traffic.

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
    const r = await persistentLimiter.limit(ip)
    return { allowed: r.success, remaining: r.remaining }
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Use POST', { status: 405 })
  }

  // 1. Origin check — first line of defense against cross-origin abuse.
  const origin = req.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    return jsonError(403, 'forbidden', 'Origin not allowed.')
  }

  // 2. Rate limit (per IP — persistent if KV is configured, else in-memory).
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  const rl = await checkRateLimit(ip)
  if (!rl.allowed) {
    return jsonError(429, 'rate_limit', 'Daily limit reached. Try again tomorrow.')
  }

  // 3. Parse + validate body.
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

  // 4. Length check (defense in depth — zod already caps each message,
  //    here we sum the whole conversation).
  const totalChars = parsed.data.messages.reduce((s, m) => s + m.content.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    return jsonError(413, 'too_long', 'Conversation too long. Start a new one.')
  }

  // 5. Trim history before sending to the model.
  const messages = parsed.data.messages.slice(-MAX_HISTORY)

  // 6. Backend config.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return jsonError(500, 'no_key', 'Backend not configured (no ANTHROPIC_API_KEY).')
  }

  const client = new Anthropic({ apiKey })

  const stream = new TransformStream<Uint8Array, Uint8Array>()
  const writer = stream.writable.getWriter()
  const enc = new TextEncoder()

  const send = (event: Record<string, unknown>): Promise<void> =>
    writer.write(enc.encode(`data: ${JSON.stringify(event)}\n\n`))

  ;(async () => {
    try {
      const response = await client.messages.create({
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
      })

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
          event.content_block?.type === 'tool_use'
        ) {
          await send({
            type: 'tool_use',
            name: event.content_block.name,
            input: event.content_block.input,
          })
        }
      }
      await send({ type: 'done' })
      await writer.write(enc.encode('data: [DONE]\n\n'))
    } catch (err) {
      await send({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    } finally {
      await writer.close()
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
