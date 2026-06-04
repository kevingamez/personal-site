// GitHub-style contribution graph. Reads the real calendar (including
// private + org repo contributions) baked into a <script id="contrib-data">
// JSON carrier by the Astro build, falls back to a synthetic recency-biased
// sample when the data is empty (e.g. build ran without a GITHUB_TOKEN).

const WEEKS = 52
const DAYS = 7
const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}
interface ContribCalendar {
  totalContributions: number
  days: ContribDay[]
  longestStreak: number
  currentStreak: number
}

function readCalendar(): ContribCalendar | null {
  const node = document.getElementById('contrib-data')
  if (!node?.textContent) return null
  try {
    const data = JSON.parse(node.textContent) as ContribCalendar
    if (!data || !Array.isArray(data.days) || !data.days.length) return null
    return data
  } catch {
    return null
  }
}

function fallbackCalendar(): ContribCalendar {
  // Recency-biased synthetic sample, used only when the real calendar
  // didn't make it into the build (no token / API hiccup).
  const days: ContribDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const recency = w / WEEKS
      const r = Math.random() + recency * 0.18
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (r > 0.5) level = 1
      if (r > 0.72) level = 2
      if (r > 0.86) level = 3
      if (r > 0.96) level = 4
      if (d === 0 || d === 6) level = Math.max(0, level - 1) as 0 | 1 | 2 | 3 | 4
      const count =
        level === 0
          ? 0
          : level === 1
            ? 1 + Math.floor(Math.random() * 2)
            : level === 2
              ? 3 + Math.floor(Math.random() * 3)
              : level === 3
                ? 6 + Math.floor(Math.random() * 5)
                : 11 + Math.floor(Math.random() * 8)
      const dt = new Date(today)
      dt.setDate(today.getDate() - ((WEEKS - 1 - w) * DAYS + (DAYS - 1 - d)))
      days.push({ date: dt.toISOString().slice(0, 10), count, level })
    }
  }
  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.count > 0) {
      run++
      if (run > longest) longest = run
    } else run = 0
  }
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++
    else break
  }
  const total = days.reduce((s, d) => s + d.count, 0)
  return { totalContributions: total, days, longestStreak: longest, currentStreak: current }
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

  const calendar = readCalendar() ?? fallbackCalendar()

  // Trim to the most recent WEEKS*DAYS days so the visual stays fixed-size.
  const tail = calendar.days.slice(-WEEKS * DAYS)
  // GitHub's calendar starts on Sunday; if the tail doesn't start aligned
  // we just render whatever is there - cells flow column-major into the grid.
  for (let i = 0; i < tail.length; i++) {
    const day = tail[i]
    const w = Math.floor(i / DAYS)
    const d = i % DAYS
    const el = document.createElement('div')
    el.className = 'day' + (day.level ? ' l' + day.level : '')
    el.style.setProperty('--w', String(w))
    el.style.setProperty('--d', String(d))
    el.dataset.count = String(day.count)
    el.dataset.lvl = String(day.level)
    el.dataset.date = day.date
    el.setAttribute('role', 'img')
    el.setAttribute(
      'aria-label',
      `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
    )
    g.appendChild(el)
  }

  const totalEl = document.getElementById('contrib-total')
  const currentEl = document.getElementById('contrib-current')
  const longestEl = document.getElementById('contrib-longest')

  if (totalEl) totalEl.textContent = '0'
  if (currentEl) currentEl.textContent = '0'
  if (longestEl) longestEl.textContent = '0'

  const card = g.closest('.gh-card') as HTMLElement | null
  let played = false
  const play = (): void => {
    if (played) return
    played = true
    g.classList.add('contrib-on')
    if (totalEl) animateNumber(totalEl, calendar.totalContributions, 1800, 200)
    if (currentEl) animateNumber(currentEl, calendar.currentStreak, 1400, 400)
    if (longestEl) animateNumber(longestEl, calendar.longestStreak, 1600, 600)
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
