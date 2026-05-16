import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/shots'
mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
]
const pages = [
  { name: 'home', url: 'http://localhost:4321/' },
  { name: 'es', url: 'http://localhost:4321/es/' },
  { name: 'dev', url: 'http://localhost:4321/dev/' },
]

const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${vp.name}] ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${vp.name}] pageerror: ${e.message}`))
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/${p.name}-${vp.name}.png`, fullPage: true })
    console.log(`shot ${p.name}-${vp.name}`)
  }
  await ctx.close()
}
await browser.close()
console.log('\nCONSOLE ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none')
