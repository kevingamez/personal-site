const { chromium } = require('@playwright/test');
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const SHOTS = '/private/tmp/claude-501/-Users-kevin-Desktop/00805db7-db90-4fba-a392-a993d2005001/scratchpad/shots/audit';
const viewports = [
  { w: 1024, h: 768 },
  { w: 1180, h: 820 },
  { w: 1280, h: 800 },
];
const routes = [
  { path: '/', tag: 'root' },
  { path: '/es/', tag: 'es' },
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
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' });
      const name = vp.w + 'x' + vp.h + '_' + rt.tag;
      try {
        await page.goto('http://127.0.0.1:4321' + rt.path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SHOTS + '/' + name + '.png', fullPage: true });
        const res = await page.evaluate(probe);
        console.log('=== ' + name + ' overflow:', JSON.stringify(res));
        const card = page.locator('[data-deck-card="2"]');
        if (await card.count()) {
          await card.first().scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await card.first().click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: SHOTS + '/' + name + '_deck.png', fullPage: false });
          const res2 = await page.evaluate(probe);
          console.log('=== ' + name + '_deck overflow:', JSON.stringify(res2));
        } else {
          console.log('=== ' + name + ' no deck card found');
        }
      } catch (e) {
        console.log('ERROR ' + name + ': ' + e.message);
      }
      await page.close();
    }
  }
  await browser.close();
})();
