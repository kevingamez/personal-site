import { expect, test } from '@playwright/test'

const routes = [
  { path: '/', title: /Kevin G[áa]mez/ },
  { path: '/es/', title: /Kevin G[áa]mez/ },
  { path: '/dev', title: /Kevin G[áa]mez|dev/i },
]

for (const { path, title } of routes) {
  test(`${path} renders without console errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveTitle(title)
    expect(errors, `console / page errors on ${path}`).toEqual([])
  })
}

test('404 page returns 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist')
  expect(response?.status()).toBe(404)
})
