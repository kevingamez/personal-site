// Request schema + size caps for /api/chat: zod body validation and the character/byte limits.

import { z } from 'zod'

// ───────── Limits ─────────

export const MAX_MESSAGE_CHARS = 2000
export const MAX_TOTAL_CHARS = 12_000
export const MAX_HISTORY = 8
// Hard ceiling on the request body we buffer. The largest valid payload is
// ~12k chars of messages plus JSON overhead; 64 KB is generous.
export const MAX_BODY_BYTES = 64 * 1024

// ───────── Schema ─────────

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
})
export const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
})
