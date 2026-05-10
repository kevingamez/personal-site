// Vercel Serverless Function — /api/chat
//
// Streams an Anthropic Claude response back to the home-page console as SSE
// events. Tools enabled: web_search. Per-IP rate limit via in-memory bucket
// (best-effort across instances; for stricter limits swap to Vercel KV).
//
// Runs on Node (the @anthropic-ai/sdk imports node:fs/node:path which aren't
// available in the Edge runtime).
//
// Required env: ANTHROPIC_API_KEY.

import Anthropic from '@anthropic-ai/sdk'

export const config = { runtime: 'nodejs' }

const DAILY_LIMIT = 20
const buckets = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string): { allowed: boolean; remaining: number } {
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

const KEVIN_CONTEXT = `You are a helpful assistant embedded on Kevin Gámez's personal website (kevingamez.com).
Kevin's facts (only state these as facts; otherwise use web_search):
- Founding engineer at Enttor (June 2025–present), based in New York / Bogotá. AI outbound platform: browser automation for Instagram & LinkedIn prospecting, OpenAI pipelines, Next.js dashboards, NestJS APIs, Vercel infra, Supabase + Inngest backend.
- Previously founding engineer at Samsam (Feb 2024–Mar 2025), e-commerce: TypeScript / React Native / Next.js / Prisma / PostgreSQL.
- M.Sc. Information Engineering (deep-learning specialization) at Universidad de los Andes (Jan 2024–May 2025); concurrent graduate teaching assistant. B.Sc. Systems and Computing (Jan 2019–Dec 2023), Andrés Bello National Distinction.
- Public GitHub @kevingamez: 28 repos, 14 followers, joined April 2019. Notable repos: personal-site (TS), AD_ASTRA2023-SpaceInvaders (Python · aerial deforestation detection · OpenCV / YOLOv5 / FastAPI), Palladium_Chat (TS), budget-app (Swift), GCP-CloudRun (Dockerfile).
- Languages he ships: TypeScript (33% of public repos), Python (27%), Swift, JavaScript, Java, Dart.
- Contact: kevingamez.kg@gmail.com · github.com/kevingamez · linkedin.com/in/kevin-gamez

Be concise (2-4 sentences for casual chat). Use markdown sparingly: **bold** for names, \`code\` for tech, [text](url) for links. When asked about anything time-sensitive or outside Kevin's profile, use web_search. Never invent stars, metrics or projects that aren't listed above.`

interface ChatBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Use POST', { status: 405 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  const rl = rateLimit(ip)
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error: 'rate_limit',
        message: 'Daily limit reached. Try again tomorrow ✋',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: ChatBody
  try {
    body = (await req.json()) as ChatBody
  } catch {
    return new Response('bad json', { status: 400 })
  }
  const messages = (body.messages || []).slice(-12).filter((m) => m.role && m.content)
  if (!messages.length) {
    return new Response('no messages', { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'no_key',
        message: 'Backend not configured (no ANTHROPIC_API_KEY).',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
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
        max_tokens: 1024,
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
      'X-RateLimit-Remaining': String(rl.remaining),
      'X-RateLimit-Limit': String(DAILY_LIMIT),
    },
  })
}
