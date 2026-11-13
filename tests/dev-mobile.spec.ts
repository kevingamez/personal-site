import { expect, test } from '@playwright/test'

// /dev focuses its terminal prompt on load. Below 880px the IDE window stacks
// and the document scrolls, so a plain focus() used to land phones halfway down
// the page. The prompt still takes focus, just without scrolling to it.

test.describe('phone viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('/dev loads at the top with the prompt focused', async ({ page }) => {
    await page.goto('/dev')
    await expect(page.locator('#cmd')).toBeFocused({ timeout: 10_000 })
    // Give any late focus or scroll a frame to land before measuring.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))))
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })
})

test('/dev on desktop still focuses the prompt', async ({ page }) => {
  await page.goto('/dev')
  await expect(page.locator('#cmd')).toBeFocused({ timeout: 10_000 })
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
