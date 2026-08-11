const { chromium } = require('@playwright/test');
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = '/private/tmp/claude-501/-Users-kevin-Desktop/00805db7-db90-4fba-a392-a993d2005001/scratchpad/shots/audit/';

const viewports = [
  { name: '768x1024', width: 768, height: 1024 },
  { name: '834x1112', width: 834, height: 1112 },
  { name: '900x1280', width: 900, height: 1280 },
];
const routes = [
  { name: 'home', path: '/' },
  { name: 'es', path: '/es/' },
];

const probe = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 1 && (r.right > vw + 2 || r.left < -2)) bad.push(el.tagName + '.' + String(el.className).split(' ')[0] + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
  }
  return { vw, scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 20) };
};

(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  for (const vp of viewports) {
    for (const rt of routes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      await page.goto('http://127.0.0.1:4321' + rt.path, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2500);
      const tag = vp.name + '-' + rt.name;
      await page.screenshot({ path: OUT + tag + '-full.png', fullPage: true });
      const res = await page.evaluate(probe);
      console.log('=== ' + tag + ' overflow:', JSON.stringify(res));

      // deck card click
      const card = page.locator('[data-deck-card="2"]');
      if (await card.count()) {
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await card.click({ force: true });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: OUT + tag + '-deck.png' });
        const res2 = await page.evaluate(probe);
        console.log('=== ' + tag + ' deck-open overflow:', JSON.stringify(res2));
      } else {
        console.log('=== ' + tag + ' no deck card found');
      }
      await page.close();
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
