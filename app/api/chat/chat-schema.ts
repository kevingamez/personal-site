// Request schema + size caps for /api/chat: zod body validation and the character/byte limits.

import { z } from 'zod'

// ───────── Limits ─────────
//
// The client (src/scripts/home/console-chat.ts) mirrors these numbers and trims
// its history to fit before sending; keep both sides in sync.

// What a visitor can type in one turn. This is the abuse-facing cap.
export const MAX_MESSAGE_CHARS = 2000
// Assistant turns are history the client echoes back. One reply can span up to
// five 512-token model rounds (tool use), so it routinely runs past the user
// cap; the client clips longer replies to this before storing them.
export const MAX_ASSISTANT_CHARS = 4000
export const MAX_TOTAL_CHARS = 12_000
export const MAX_HISTORY = 8
// Hard ceiling on the request body we buffer. The largest valid payload is
// ~12k chars of messages plus JSON overhead; 64 KB is generous.
export const MAX_BODY_BYTES = 64 * 1024

// ───────── Schema ─────────

const MessageSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('user'), content: z.string().min(1).max(MAX_MESSAGE_CHARS) }),
  z.object({ role: z.literal('assistant'), content: z.string().min(1).max(MAX_ASSISTANT_CHARS) }),
])
export const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
})
