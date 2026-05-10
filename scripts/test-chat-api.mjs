// Smoke-test the validation/auth layer of /api/chat without Vercel.
// Imports the handler directly and calls it with mock Request objects.

import handler from '../api/chat.ts'

const ok = (label, cond) =>
  console.log(`${cond ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${label}`)

async function call(opts = {}) {
  const headers = new Headers(opts.headers || {})
  if (!headers.has('content-type')) headers.set('content-type', 'application/json')
  const init = { method: opts.method ?? 'POST', headers }
  if (opts.body !== undefined) init.body = opts.body
  const res = await handler(new Request('http://localhost/api/chat', init))
  let body = null
  try {
    body = await res.json()
  } catch {
    body = await res.text().catch(() => null)
  }
  return { status: res.status, body, headers: Object.fromEntries(res.headers) }
}

const VALID_ORIGIN = 'https://kevingamez.co'

console.log('\n— /api/chat hardening tests —\n')

// 1. Non-POST should be 405.
let r = await call({ method: 'GET', headers: { origin: VALID_ORIGIN } })
ok('GET → 405', r.status === 405)

// 2. No Origin header → 403.
r = await call({ body: '{"messages":[{"role":"user","content":"hi"}]}' })
ok('Missing Origin → 403', r.status === 403 && r.body?.error === 'forbidden')

// 3. Wrong Origin → 403.
r = await call({
  headers: { origin: 'https://evil.example' },
  body: '{"messages":[{"role":"user","content":"hi"}]}',
})
ok('Wrong Origin → 403', r.status === 403 && r.body?.error === 'forbidden')

// 4. Vercel preview origin → allowed past origin check (will fail later for no key).
r = await call({
  headers: { origin: 'https://personal-site-abc123-kevin.vercel.app' },
  body: '{"messages":[{"role":"user","content":"hi"}]}',
})
ok('vercel.app preview origin allowed', r.status === 500 && r.body?.error === 'no_key')

// 5. Bad JSON → 400.
r = await call({ headers: { origin: VALID_ORIGIN }, body: 'not-json' })
ok('Bad JSON → 400', r.status === 400 && r.body?.error === 'bad_json')

// 6. Empty messages → 400 (zod min(1)).
r = await call({ headers: { origin: VALID_ORIGIN }, body: '{"messages":[]}' })
ok('Empty messages → 400', r.status === 400 && r.body?.error === 'bad_shape')

// 7. Missing messages key → 400.
r = await call({ headers: { origin: VALID_ORIGIN }, body: '{}' })
ok('Missing messages → 400', r.status === 400 && r.body?.error === 'bad_shape')

// 8. Wrong role → 400.
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: '{"messages":[{"role":"system","content":"hi"}]}',
})
ok('Invalid role → 400', r.status === 400 && r.body?.error === 'bad_shape')

// 9. One message > 2000 chars → 400 (zod max).
const huge = 'x'.repeat(2001)
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: JSON.stringify({ messages: [{ role: 'user', content: huge }] }),
})
ok('Single message >2000 chars → 400', r.status === 400 && r.body?.error === 'bad_shape')

// 10. Total >12_000 chars → 413 (zod allows individual <=2000, but sum > MAX_TOTAL).
const seven = Array.from({ length: 7 }, (_, i) => ({
  role: i % 2 ? 'assistant' : 'user',
  content: 'y'.repeat(1900),
}))
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: JSON.stringify({ messages: seven }),
})
ok('Total >12000 chars → 413', r.status === 413 && r.body?.error === 'too_long')

// 11. Too many messages (>20) → 400.
const tooMany = Array.from({ length: 21 }, () => ({ role: 'user', content: 'hi' }))
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: JSON.stringify({ messages: tooMany }),
})
ok('>20 messages → 400', r.status === 400 && r.body?.error === 'bad_shape')

// 12. Valid request, no API key in env → 500 no_key.
delete process.env.ANTHROPIC_API_KEY
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: '{"messages":[{"role":"user","content":"hi"}]}',
})
ok('Valid request, no key → 500', r.status === 500 && r.body?.error === 'no_key')

// 13. Valid + key set → returns SSE stream (status 200, content-type event-stream).
process.env.ANTHROPIC_API_KEY = 'sk-test-fake-key'
r = await call({
  headers: { origin: VALID_ORIGIN },
  body: '{"messages":[{"role":"user","content":"hi"}]}',
})
ok(
  'Valid request → 200 SSE',
  r.status === 200 && r.headers['content-type']?.includes('text/event-stream')
)
ok(
  'CORS Allow-Origin echoes valid origin',
  r.headers['access-control-allow-origin'] === VALID_ORIGIN
)

console.log('\nDone.\n')
