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

test('the bottom bar is the phone navigation', async ({ page }) => {
  await page.goto('/')
  const bar = page.locator('#mobile-cta')
  const toggle = bar.locator('[data-mnav-toggle]')
  const sheet = bar.locator('[data-mnav-sheet]')

  // Present from the first screen, and the top bar no longer follows the page.
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveText('Menu')
  await expect(page.locator('.nav-links')).toBeHidden()
  await expect(sheet).toBeHidden()

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(sheet.locator('a')).toHaveCount(6)
  await expect(sheet.getByRole('link', { name: 'Work' })).toBeVisible()

  // Escape closes it and hands focus back to the toggle.
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(toggle).toBeFocused()

  // Picking a section closes the sheet, goes there, and the bar names it.
  await toggle.click()
  await sheet.getByRole('link', { name: 'Work' }).click()
  await expect(sheet).toBeHidden()
  await expect(toggle).toHaveText('Work')
  const top = await page.locator('#work').evaluate((el) => el.getBoundingClientRect().top)
  expect(Math.abs(top)).toBeLessThan(80)
})

test('every control in the phone navigation is a 44px target', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-mnav-toggle]').click()
  const small = await page
    .locator('#mobile-cta a, #mobile-cta button')
    .evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height < 43.5).length)
  expect(small).toBe(0)
})
