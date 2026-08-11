const { chromium } = require('@playwright/test');
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const SHOTS = '/private/tmp/claude-501/-Users-kevin-Desktop/00805db7-db90-4fba-a392-a993d2005001/scratchpad/shots/audit/';
const BASE = 'http://127.0.0.1:4321';

const probe = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 1 && (r.right > vw + 2 || r.left < -2)) bad.push(el.tagName + '.' + String(el.className).split(' ')[0] + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
  }
  return { vw, scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 20) };
};

const jobs = [
  { vp: [1440, 900], routes: ['/', '/es/', '/privacy/', '/lab/'] },
  { vp: [1440, 760], routes: ['/', '/es/'] },
  { vp: [1920, 1080], routes: ['/', '/es/'] },
];

(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  for (const job of jobs) {
    const [w, h] = job.vp;
    for (const route of job.routes) {
      const tag = 'desk_' + w + 'x' + h + '_' + (route.replace(/\//g, '') || 'home');
      const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await page.goto(BASE + route, { waitUntil: 'networkidle' }).catch(e => console.log(tag, 'goto err', e.message));
      await page.waitForTimeout(2500);
      await page.screenshot({ path: SHOTS + tag + '.png', fullPage: true });
      const res = await page.evaluate(probe);
      console.log('=== ' + tag + ' overflow:', JSON.stringify(res));
      const deck = await page.$('[data-deck-card="2"]');
      if (deck) {
        await deck.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await deck.click().catch(e => console.log(tag, 'deck click err', e.message.split('\n')[0]));
        await page.waitForTimeout(1200);
        await page.screenshot({ path: SHOTS + tag + '_deck.png', fullPage: false });
        const res2 = await page.evaluate(probe);
        console.log('=== ' + tag + '_deck overflow:', JSON.stringify(res2));
      } else {
        console.log('=== ' + tag + ' no deck card');
      }
      await page.close();
    }
  }
  await browser.close();
  console.log('ALL DONE');
})();
