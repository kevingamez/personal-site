import { expect, test } from '@playwright/test'

const routes = [
  { path: '/', title: /Kevin G[áa]mez/ },
  { path: '/es/', title: /Kevin G[áa]mez/ },
  { path: '/dev', title: /Kevin G[áa]mez|dev/i },
  { path: '/privacy', title: /Privacy|Kevin G[áa]mez/ },
  { path: '/resume', title: /R[ée]sum[ée]|Kevin G[áa]mez/ },
  { path: '/es/resume', title: /Hoja de vida|Kevin G[áa]mez/ },
]

// Ignore noise that's expected when running against the preview server:
// - the Vercel analytics script needs real prod hosts to respond, and 404s
//   on file:// preview / static deploys.
// - the dev console hits /api/chat which isn't routed by `astro preview`.
// - missing favicons / og-image variants in dev.
// We only care about real JS errors from our own code.
function isThirdPartyResourceError(text: string): boolean {
  return (
    text.includes('Failed to load resource') ||
    text.includes('vercel-scripts.com') ||
    text.includes('/api/chat') ||
    text.includes('/api/strava')
  )
}

for (const { path, title } of routes) {
  test(`${path} renders without console errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (isThirdPartyResourceError(text)) return
      errors.push(text)
    })

    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveTitle(title)
    expect(errors, `console / page errors on ${path}`).toEqual([])
  })
}

// The Strava section is rendered server-side but stays `hidden` until the
// client confirms live activity from /api/strava (which `astro preview` doesn't
// route). Assert the static markup ships on both locales regardless.
for (const path of ['/', '/es/']) {
  test(`${path} ships the Strava section markup`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('#strava')).toHaveCount(1)
    await expect(page.locator('#strava .sec-title')).toHaveText(/.+/)
  })
}

test('404 page returns 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist')
  expect(response?.status()).toBe(404)
})

test('500 page returns 500 and renders without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (isThirdPartyResourceError(text)) return
    errors.push(text)
  })

  const response = await page.goto('/500')
  // `astro preview` serves the explicit /500 route as a normal static page (200);
  // on Vercel, 500.html is the platform error document returned with a 500 status.
  expect([200, 500]).toContain(response?.status())
  await expect(page).toHaveTitle(/500|Kevin G[áa]mez/)
  expect(errors, 'console / page errors on /500').toEqual([])
})

// The share control ships on both locales, in the contact section, on every
// viewport. The sticky bar's icon-only twin is asserted separately below.
for (const path of ['/', '/es/']) {
  test(`${path} ships a share control`, async ({ page }) => {
    await page.goto(path)
    const share = page.locator('#contact [data-share]')
    await expect(share).toHaveCount(1)
    await expect(share).toHaveAttribute('data-share-copied', /.+/)
  })
}

// Clipboard fallback: Chromium exposes navigator.share only on mobile, so the
// desktop path here is always the copy branch.
test('share button copies the page URL when there is no share sheet', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.locator('#contact [data-share]').click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('/')
  // The button reports back rather than copying silently.
  await expect(page.locator('#contact [data-share]')).toHaveClass(/is-shared/)
})

test('the sticky CTA stays off the hero and arrives once it is scrolled past', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const bar = page.locator('#mobile-cta')
  await expect(bar).toHaveCount(1)
  // Nothing floats over the first screen.
  await expect(bar).toBeHidden()

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
  await expect(bar).toBeVisible()
  await expect(bar.locator('[data-share]')).toHaveCount(1)
  await expect(bar.locator('a[href^="mailto:"]')).toHaveCount(1)
})

test('the sticky CTA is desktop-suppressed, where the nav already carries it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
  await expect(page.locator('#mobile-cta')).toBeHidden()
})
