import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 760 }, hasTouch: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('kg-intro', '1'))
})

// The panel's phone breakpoints once lived in a stylesheet imported before the
// panel's base rules, so they lost the cascade and the desktop grid shipped to
// phones: a 180px empty column, then facts squeezed into the remainder.
test('an open experience row is one column on a phone', async ({ page }) => {
  await page.goto('/')
  const row = page.locator('.tl-row[data-exp-open]').first()
  await expect(row).toBeVisible()

  const cols = (sel: string) =>
    row
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
  expect(await cols('.tl-panel-in')).toBe(1)
  expect(await cols('.tl-band')).toBe(1)
  expect(await cols('.tl-ledger')).toBe(1)

  const desc = await row.locator('.tl-desc').first().boundingBox()
  expect(desc!.x).toBeLessThan(40)
  expect(desc!.width).toBeGreaterThan(300)

  // No fact's label runs into its value.
  const clash = await row.locator('.tl-fact').evaluateAll((facts) =>
    facts.some((f) => {
      const dt = f.querySelector('dt')!.getBoundingClientRect()
      const dd = f.querySelector('dd')!.getBoundingClientRect()
      return dt.right > dd.left + 1 && dt.bottom > dd.top && dd.bottom > dt.top
    })
  )
  expect(clash).toBe(false)
})

test('the nav steps aside on the way down and returns on the way up', async ({ page }) => {
  await page.goto('/')
  const root = page.locator('html')

  // The scroll listener is attached after hydration, so retry until it is.
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.evaluate(() => window.scrollTo(0, 1200))
    await expect(root).toHaveClass(/nav-away/, { timeout: 500 })
  }).toPass()
  const hidden = await page.locator('.nav').boundingBox()
  expect(hidden!.y + hidden!.height).toBeLessThanOrEqual(0)

  await page.evaluate(() => window.scrollTo(0, 1100))
  await expect(root).not.toHaveClass(/nav-away/)
})
