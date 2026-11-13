import { expect, test, type Page } from '@playwright/test'
import {
  ChatBodySchema,
  MAX_ASSISTANT_CHARS,
  MAX_HISTORY,
  MAX_MESSAGE_CHARS,
  MAX_TOTAL_CHARS,
} from '../app/api/chat/chat-schema'
import {
  MAX_ASSISTANT_CHARS as CLIENT_ASSISTANT,
  MAX_CLIENT_HISTORY,
  MAX_TOTAL_CHARS as CLIENT_TOTAL,
  MAX_USER_CHARS,
  clipReply,
  fitHistory,
} from '../src/scripts/home/console-chat'

// A console reply can run far past the 2000-char user cap (one answer spans up
// to five model rounds). The client echoes history back on the next turn, and
// the route used to reject the whole request when any message passed 2000, so
// one long answer broke every later question. These pin the fix on both sides.

type Msg = { role: 'user' | 'assistant'; content: string }

test('client caps mirror the route schema', () => {
  expect(MAX_CLIENT_HISTORY).toBe(MAX_HISTORY)
  expect(MAX_USER_CHARS).toBe(MAX_MESSAGE_CHARS)
  expect(CLIENT_ASSISTANT).toBe(MAX_ASSISTANT_CHARS)
  expect(CLIENT_TOTAL).toBe(MAX_TOTAL_CHARS)
})

test('route keeps the user cap but accepts a long assistant turn', () => {
  const long = 'a'.repeat(MAX_MESSAGE_CHARS + 500)
  const asUser = ChatBodySchema.safeParse({ messages: [{ role: 'user', content: long }] })
  expect(asUser.success).toBe(false)
  const asReply = ChatBodySchema.safeParse({
    messages: [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: long },
      { role: 'user', content: 'and then?' },
    ],
  })
  expect(asReply.success).toBe(true)
})

test('fitted history always passes the route schema and total cap', () => {
  const history: Msg[] = []
  for (let i = 0; i < 6; i++) {
    history.push({ role: 'user', content: 'q'.repeat(MAX_MESSAGE_CHARS) })
    history.push({ role: 'assistant', content: 'r'.repeat(9000) })
  }
  history.push({ role: 'user', content: 'last question' })
  const sent = fitHistory(history)
  expect(ChatBodySchema.safeParse({ messages: sent }).success).toBe(true)
  expect(sent.reduce((s, m) => s + m.content.length, 0)).toBeLessThanOrEqual(MAX_TOTAL_CHARS)
  expect(sent[0].role).toBe('user')
  expect(sent.at(-1)?.content).toBe('last question')
  expect(clipReply('x'.repeat(9000)).length).toBe(MAX_ASSISTANT_CHARS)
})

function sse(text: string): string {
  return `data: ${JSON.stringify({ type: 'text_delta', text })}\n\ndata: [DONE]\n\n`
}

async function ready(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator('#console').scrollIntoViewIfNeeded()
  const input = page.locator('#console-msg')
  // The console script loads lazily; Tab completion only works once it is wired.
  await expect(async () => {
    await input.click()
    await input.fill('whoam')
    await input.press('Tab')
    await expect(input).toHaveValue(/^whoami/, { timeout: 500 })
  }).toPass({ timeout: 15_000 })
  await input.fill('')
}

test('a reply longer than the cap does not break the next question', async ({ page }) => {
  const long = 'word '.repeat(1200) // 6000 chars
  const bodies: Msg[][] = []
  await page.route('**/api/chat/**', async (route) => {
    const body = route.request().postDataJSON() as { messages: Msg[] }
    bodies.push(body.messages)
    const ok = ChatBodySchema.safeParse(body).success
    if (!ok) {
      await route.fulfill({ status: 400, json: { error: 'bad_shape', message: 'rejected' } })
      return
    }
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
      body: sse(bodies.length === 1 ? long : 'second answer ok'),
    })
  })
  await ready(page)
  const input = page.locator('#console-msg')

  await input.fill('kevin tell me everything')
  await input.press('Enter')
  await expect(page.locator('#console-stream')).toContainText('word word word')
  await expect(input).toBeEnabled()

  await input.fill('kevin and then?')
  await input.press('Enter')
  await expect(page.locator('#console-stream')).toContainText('second answer ok')

  expect(bodies).toHaveLength(2)
  const second = bodies[1]
  expect(second.map((m) => m.role)).toEqual(['user', 'assistant', 'user'])
  expect(second[1].content.length).toBeLessThanOrEqual(MAX_ASSISTANT_CHARS)
})
