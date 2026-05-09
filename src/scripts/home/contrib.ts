// GitHub-style contribution graph with wave reveal + animated stats.
// Cells are 7 rows (Sun→Sat) × 52 columns (weeks); reveal staggered by week,
// counters tween once the card scrolls into view.

const WEEKS = 52
const DAYS = 7
const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pickLevel(week: number, dow: number): number {
  // Recency bias: more recent weeks tend to be greener.
  const recency = week / WEEKS
  const r = Math.random() + recency * 0.18
  let lvl = 0
  if (r > 0.5) lvl = 1
  if (r > 0.72) lvl = 2
  if (r > 0.86) lvl = 3
  if (r > 0.96) lvl = 4
  // Weekends are quieter.
  if (dow === 0 || dow === 6) lvl = Math.max(0, lvl - 1)
  return lvl
}

function lvlToCount(lvl: number): number {
  if (lvl === 0) return 0
  if (lvl === 1) return 1 + Math.floor(Math.random() * 2)
  if (lvl === 2) return 3 + Math.floor(Math.random() * 3)
  if (lvl === 3) return 6 + Math.floor(Math.random() * 5)
  return 11 + Math.floor(Math.random() * 8)
}

function animateNumber(el: HTMLElement, target: number, duration: number, delay: number): void {
  if (REDUCE) {
    el.textContent = target.toLocaleString('en-US')
    return
  }
  const start = performance.now() + delay
  function tick(now: number): void {
    const t = Math.max(0, Math.min(1, (now - start) / duration))
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = Math.floor(target * eased).toLocaleString('en-US')
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = target.toLocaleString('en-US')
  }
  requestAnimationFrame(tick)
}

export function initContribGraph(): void {
  const g = document.getElementById('contrib-graph') as HTMLElement | null
  if (!g) return

  // Generate column-major: for each week, fill 7 days.
  const counts: number[] = []
  let total = 0
  let longest = 0
  let run = 0

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const lvl = pickLevel(w, d)
      const count = lvlToCount(lvl)
      counts.push(count)
      total += count
      if (count > 0) {
        run++
        if (run > longest) longest = run
      } else {
        run = 0
      }
      const el = document.createElement('div')
      el.className = 'day' + (lvl ? ' l' + lvl : '')
      el.style.setProperty('--w', String(w))
      el.style.setProperty('--d', String(d))
      el.dataset.count = String(count)
      el.dataset.lvl = String(lvl)
      el.setAttribute('role', 'img')
      el.setAttribute('aria-label', `${count} contribution${count === 1 ? '' : 's'}`)
      g.appendChild(el)
    }
  }

  // Current streak = trailing run from last cell backwards.
  let current = 0
  for (let i = counts.length - 1; i >= 0; i--) {
    if (counts[i] > 0) current++
    else break
  }

  // Mark the last cell as "hot" so the CSS pulse kicks in (only if it's coloured).
  const last = g.lastElementChild as HTMLElement | null
  if (last && parseInt(last.dataset.lvl || '0') > 0) last.classList.add('hot-now')

  const totalEl = document.getElementById('contrib-total')
  const currentEl = document.getElementById('contrib-current')
  const longestEl = document.getElementById('contrib-longest')

  // Initial values: zeroes (counters) until the card enters viewport.
  if (totalEl) totalEl.textContent = '0'
  if (currentEl) currentEl.textContent = '0'
  if (longestEl) longestEl.textContent = '0'

  const card = g.closest('.gh-card') as HTMLElement | null
  let played = false
  const play = (): void => {
    if (played) return
    played = true
    g.classList.add('contrib-on')
    if (totalEl) animateNumber(totalEl, total, 1800, 200)
    if (currentEl) animateNumber(currentEl, current, 1400, 400)
    if (longestEl) animateNumber(longestEl, longest, 1600, 600)
  }

  if (typeof IntersectionObserver === 'undefined' || !card) {
    play()
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          play()
          io.disconnect()
          break
        }
      }
    },
    { threshold: 0.2 }
  )
  io.observe(card)
}
