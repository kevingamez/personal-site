import { expect, test } from '@playwright/test'

const routes = [
  { path: '/', title: /Kevin G[áa]mez/ },
  { path: '/es/', title: /Kevin G[áa]mez/ },
  { path: '/dev', title: /Kevin G[áa]mez|dev/i },
  { path: '/privacy', title: /Privacy|Kevin G[áa]mez/ },
]

// Ignore noise that's expected when running against the preview server:
// - third-party analytics scripts (Vercel, Clarity, GA) that need real
//   prod hosts to respond, and 404 on file:// preview / static deploys.
// - the dev console hits /api/chat which isn't routed by `astro preview`.
// - missing favicons / og-image variants in dev.
// We only care about real JS errors from our own code.
function isThirdPartyResourceError(text: string): boolean {
  return (
    text.includes('Failed to load resource') ||
    text.includes('vercel-scripts.com') ||
    text.includes('clarity.ms') ||
    text.includes('google-analytics.com') ||
    text.includes('googletagmanager.com') ||
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
  expect(response?.status()).toBe(500)
  await expect(page).toHaveTitle(/500|Kevin G[áa]mez/)
  expect(errors, 'console / page errors on /500').toEqual([])
})
