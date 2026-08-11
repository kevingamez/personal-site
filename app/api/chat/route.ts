// Next.js Route Handler - /api/chat
//
// Streams an Anthropic Claude response back to the home-page console as SSE
// events. Hardened against:
//   - Cross-origin abuse: only requests from kevingamez.co (or localhost
//     during dev) are accepted; everything else gets 403.
//   - Oversized inputs: each message capped at MAX_MESSAGE_CHARS, total
//     conversation capped at MAX_TOTAL_CHARS, history capped at 8 messages.
//   - Schema confusion: zod parses the request body and rejects malformed shapes.
//   - Token cost: max_tokens 512 (was 1024), and we slice history to 8.
//   - Bot abuse: per-IP daily rate limit + a global daily backstop, both keyed
//     in KV/Upstash. If KV is unavailable the endpoint FAILS CLOSED (503) rather
//     than serving the model without a durable cost ceiling. The body is
//     validated before a token is spent so junk requests can't drain the quota.
//
// Required env: ANTHROPIC_API_KEY.

import Anthropic from '@anthropic-ai/sdk'

import { isOriginAllowed } from './chat-origin'
import { DAILY_LIMIT, RATE_LIMIT_READY, checkGlobalLimit, checkRateLimit } from './chat-ratelimit'
import { ChatBodySchema, MAX_BODY_BYTES, MAX_HISTORY, MAX_TOTAL_CHARS } from './chat-schema'
import { createChatStream } from './chat-stream'

export const runtime = 'nodejs'

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
// sent - never trust it for rate-limit keys. `x-real-ip` / `x-vercel-forwarded-for`
// are set by Vercel's proxy and overwrite anything the client supplies.
function clientIp(req: Request): string | null {
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const vff = req.headers.get('x-vercel-forwarded-for')
  if (vff) return vff.split(',')[0].trim()
  return null
}

export async function POST(req: Request): Promise<Response> {
  // (Method gating: only POST is exported, so Next serves 405 for other verbs.)

  // 1. Origin check - the first line of defense against cross-origin abuse.
  const origin = req.headers.get('origin')
  if (!isOriginAllowed(origin)) {
    return jsonError(403, 'forbidden', 'Origin not allowed.')
  }

  // 2. Reject oversized bodies before buffering them into memory.
  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError(413, 'too_large', 'Request body too large.')
  }

  // 3. Parse + validate body BEFORE spending a rate-limit token, so malformed
  //    requests can't drain an IP's daily quota. Guard the ACTUAL byte length
  //    too - content-length can be absent or lie.
  let raw: unknown
  try {
    const body = await req.text()
    // Same UTF-8 byte count the Node version got from Buffer.byteLength(body).
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return jsonError(413, 'too_large', 'Request body too large.')
    }
    try {
      raw = JSON.parse(body || '{}')
    } catch {
      return jsonError(400, 'bad_json', 'Could not parse JSON body.')
    }
  } catch {
    return jsonError(400, 'bad_json', 'Could not parse JSON body.')
  }
  const parsed = ChatBodySchema.safeParse(raw)
  if (!parsed.success) {
    return jsonError(400, 'bad_shape', 'Body does not match expected schema.')
  }

  // 4. Length check (defense in depth - zod already caps each message; here we
  //    sum the whole conversation).
  const totalChars = parsed.data.messages.reduce((s, m) => s + m.content.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    return jsonError(413, 'too_long', 'Conversation too long. Start a new one.')
  }

  // 5. Backend config.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return jsonError(500, 'no_key', 'Backend not configured (no ANTHROPIC_API_KEY).')
  }

  // 5b. Persistent rate limiting is mandatory: without KV we cannot bound total
  //     cost across instances and IPs, so refuse rather than serve unbounded.
  if (!RATE_LIMIT_READY) {
    return jsonError(
      503,
      'unavailable',
      'The assistant is temporarily unavailable. Try again later.'
    )
  }

  // 6. Rate limit (per IP, only for well-formed requests). When no trusted IP
  //    is resolvable (e.g. local dev) we use a single per-instance in-memory
  //    bucket rather than keying on spoofable input.
  const ip = clientIp(req)
  const rl = await checkRateLimit(ip ?? 'local')
  if (!rl.allowed) {
    return jsonError(429, 'rate_limit', 'Daily limit reached. Try again tomorrow.')
  }
  // Global backstop across all IPs (bounds total cost under IP rotation).
  if (!(await checkGlobalLimit())) {
    return jsonError(429, 'busy', 'The assistant is busy right now. Try again later.')
  }

  // 7. Trim history before sending to the model. The assistant pulls live data
  //    on demand through the tools below, so the system prompt stays static.
  const convo = parsed.data.messages.slice(-MAX_HISTORY) as Anthropic.MessageParam[]

  const stream = createChatStream(req, apiKey, convo)

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': origin || '',
      Vary: 'Origin',
      'X-RateLimit-Remaining': String(rl.remaining),
      'X-RateLimit-Limit': String(DAILY_LIMIT),
    },
  })
}
