// Intro curtain driver. head-init.js decides pre-paint whether the curtain
// shows (html.intro-pending); this module runs the counter + progress bar,
// slides the curtain out, and lets any input skip it instantly. A safety
// timeout guarantees the page is never trapped behind the overlay.

const DURATION = 1400
const EXIT_MS = 480
const SAFETY_MS = 2600

export function initIntro(): void {
  const root = document.documentElement
  const el = document.querySelector<HTMLElement>('.intro')
  if (!el) {
    root.classList.remove('intro-pending')
    return
  }
  if (!root.classList.contains('intro-pending')) {
    el.remove()
    return
  }
  try {
    window.sessionStorage.setItem('kg-intro', '1')
  } catch {
    // Storage unavailable: the intro may replay next load, nothing breaks.
  }

  const count = el.querySelector<HTMLElement>('[data-intro-count]')
  const bar = el.querySelector<HTMLElement>('[data-intro-bar]')
  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
  let done = false

  const finish = (): void => {
    if (done) return
    done = true
    for (const ev of events) window.removeEventListener(ev, finish)
    el.classList.add('intro-out')
    window.setTimeout(() => {
      el.remove()
      root.classList.remove('intro-pending')
    }, EXIT_MS)
  }

  for (const ev of events) window.addEventListener(ev, finish, { passive: true })

  const start = performance.now()
  const tick = (now: number): void => {
    if (done) return
    const t = Math.min(1, (now - start) / DURATION)
    if (count) count.textContent = String(Math.round(t * 100)).padStart(3, '0')
    if (bar) bar.style.transform = `scaleX(${t})`
    if (t >= 1) finish()
    else window.requestAnimationFrame(tick)
  }
  window.requestAnimationFrame(tick)
  window.setTimeout(finish, SAFETY_MS)
}
