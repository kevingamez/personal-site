import { expect, test, type Page } from '@playwright/test'
import { devSample } from '../src/scripts/home/strava-sample'

// The Strava section is filled on the client from /api/strava once it scrolls
// near the viewport. These serve a known payload and check the render paths.
async function openWith(page: Page, payload: unknown): Promise<void> {
  await page.route('**/api/strava/**', (route) => route.fulfill({ json: payload }))
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
