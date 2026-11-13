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

  // The side panel is a drawer on phones: closed on load so the editor leads,
  // and every visible control is a full 44px target with no sideways scroll.
  test('/dev leads with the editor and has thumb-sized targets', async ({ page }) => {
    await page.goto('/dev')
    await expect(page.locator('#cmd')).toBeFocused({ timeout: 10_000 })
    await expect(page.locator('.explorer')).toBeHidden()
    await expect(page.locator('.editor')).toBeInViewport()

    await page.locator('[data-ab="explorer"]').tap()
    await expect(page.locator('.explorer')).toBeVisible()

    const report = await page.evaluate(() => {
      const small = [...document.querySelectorAll('a, button, [role=button], input')].filter(
        (el) => {
          const r = el.getBoundingClientRect()
          const shown = r.width > 0 && r.height > 0 && getComputedStyle(el).opacity !== '0'
          return shown && (r.width < 44 || r.height < 44)
        }
      )
      return {
        small: small.map((el) => el.className || el.tagName),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        promptPx: parseFloat(getComputedStyle(document.getElementById('cmd')!).fontSize),
      }
    })
    expect(report.small).toEqual([])
    expect(report.overflow).toBe(0)
    expect(report.promptPx).toBeGreaterThanOrEqual(16)

    await page.locator('[data-ab="explorer"]').tap()
    await expect(page.locator('.explorer')).toBeHidden()
  })
})

test('/dev on desktop still focuses the prompt', async ({ page }) => {
  await page.goto('/dev')
  await expect(page.locator('#cmd')).toBeFocused({ timeout: 10_000 })
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
