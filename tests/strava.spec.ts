import { expect, test, type Page } from '@playwright/test'
import { devSample } from '../src/scripts/home/strava-sample'

// The Strava section is filled on the client from /api/strava once it scrolls
// near the viewport. These serve a known payload and check the render paths.
async function openWith(page: Page, payload: unknown): Promise<void> {
  await page.route('**/api/strava/**', (route) => route.fulfill({ json: payload }))
  // The intro curtain covers the page for its first seconds and would swallow
  // the hit-tests below; mark it as already played.
  await page.addInitScript(() => window.sessionStorage.setItem('kg-intro', '1'))
  await page.goto('/')
  await page.locator('[data-strava-lazy-anchor]').scrollIntoViewIfNeeded()
  await expect(page.locator('#strava')).toBeVisible()
}

test('latest activity block renders from the payload', async ({ page }) => {
  await openWith(page, devSample())
  const latest = page.locator('#sv-latest')
  await expect(latest).toBeVisible()
  await expect(latest.locator('[data-name]')).toHaveAttribute('href', /strava\.com\/activities\//)
  await expect(latest.locator('time')).toHaveText(/.+/)
  // A click anywhere on a card, including its map, lands on the activity link.
  for (const sel of ['#sv-latest', '#sv-longest .sv-feat']) {
    const card = page.locator(sel).first()
    const href = await card.locator('[data-name]').getAttribute('href')
    const hit = await card.evaluate((el) => {
      // Centred, so the fixed nav never sits over the point being probed.
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      const r = el.getBoundingClientRect()
      const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return at?.closest('a')?.getAttribute('href') ?? null
    })
    expect(hit).toBe(href)
  }
  // Every longest-effort card carries its date.
  const dates = page.locator('#sv-longest .sv-feat-date')
  await expect(dates.first()).toHaveText(/\d{4}/)
  expect(await dates.count()).toBe(await page.locator('#sv-longest .sv-feat').count())
})

test('no number is shown twice in the section', async ({ page }) => {
  await openWith(page, devSample())
  await page.locator('.sv-insights').scrollIntoViewIfNeeded()
  // Count-ups settle on their final values.
  await expect(page.locator('#sv-active-val')).not.toHaveText('0')
  await page.waitForTimeout(2500)
  const values = await page
    .locator('#strava .sv-hero-side .sv-mini span, #strava .sv-hero-km span, #strava .sv-tile-val')
    .allTextContents()
  const seen = values.map((v) => v.replace(/[^\d]/g, '')).filter((v) => v.length > 1)
  expect(new Set(seen).size).toBe(seen.length)
})

test('a payload without latest hides the block, not the section', async ({ page }) => {
  await openWith(page, { ...devSample(), latest: undefined })
  await expect(page.locator('#sv-latest')).toBeHidden()
  await expect(page.locator('#sv-longest > *').first()).toBeVisible()
})

test('a malformed latest hides the block, not the section', async ({ page }) => {
  const sample = devSample()
  // No polyline, so the block takes the drawn-route path, which the bad points break.
  const broken = { ...sample.latest, polyline: null, route: { points: [1, 2, 3], w: 10, h: 10 } }
  await openWith(page, { ...sample, latest: broken })
  await expect(page.locator('#sv-latest')).toBeHidden()
  await expect(page.locator('#sv-longest > *').first()).toBeVisible()
})

test('an inline snapshot renders the section without calling the API', async ({ page }) => {
  let apiCalls = 0
  await page.route('**/api/strava/**', (route) => {
    apiCalls++
    return route.abort()
  })
  // What the server inlines when it has Strava data at render time.
  const seed = { ...devSample(), generatedAt: new Date().toISOString() }
  await page.addInitScript((json) => {
    document.addEventListener('DOMContentLoaded', () => {
      const tag = document.createElement('script')
      tag.id = 'strava-data'
      tag.type = 'application/json'
      tag.textContent = json
      // In <head>: React drops unexpected nodes inside the tree it hydrates.
      document.head.appendChild(tag)
    })
  }, JSON.stringify(seed))
  await page.goto('/')
  await page.locator('[data-strava-lazy-anchor]').scrollIntoViewIfNeeded()
  await expect(page.locator('#strava')).toBeVisible()
  await expect(page.locator('#sv-longest .sv-feat').first()).toBeVisible()
  await expect(page.locator('#sv-latest')).toBeVisible()
  expect(apiCalls).toBe(0)
})

test('a stale inline snapshot is refreshed from the API', async ({ page }) => {
  const live = devSample() as { totals: { count: number } }
  live.totals.count = 4321
  await page.route('**/api/strava/**', (route) => route.fulfill({ json: live }))
  const seed = { ...devSample(), generatedAt: '2020-01-01T00:00:00.000Z' }
  await page.addInitScript((json) => {
    document.addEventListener('DOMContentLoaded', () => {
      const tag = document.createElement('script')
      tag.id = 'strava-data'
      tag.type = 'application/json'
      tag.textContent = json
      // In <head>: React drops unexpected nodes inside the tree it hydrates.
      document.head.appendChild(tag)
    })
  }, JSON.stringify(seed))
  await page.goto('/')
  await page.locator('[data-strava-lazy-anchor]').scrollIntoViewIfNeeded()
  await expect(page.locator('#strava')).toBeVisible()
  await page.locator('#sv-acts').scrollIntoViewIfNeeded()
  await expect(page.locator('#sv-acts')).toHaveText('4,321')
})
