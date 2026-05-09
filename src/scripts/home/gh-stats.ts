// Animated GitHub stats banner.
// Counters tween from 0 to target with cubic ease-out; the language bar
// fills its segments staggered. Triggered when the banner enters view.

const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function formatNumber(n: number, fmt: string): string {
  if (fmt === 'k') {
    if (n >= 1000) {
      const k = n / 1000
      return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K'
    }
    return Math.floor(n).toString()
  }
  if (fmt === 'comma') return Math.floor(n).toLocaleString('en-US')
  return Math.floor(n).toString()
}

function animateCounter(el: HTMLElement, delay: number): void {
  const target = parseFloat(el.dataset.target || '0')
  const fmt = el.dataset.format || 'plain'
  if (REDUCE_MOTION) {
    el.textContent = formatNumber(target, fmt)
    return
  }
  const duration = 1600
  const start = performance.now() + delay
  function tick(now: number): void {
    const t = Math.max(0, Math.min(1, (now - start) / duration))
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = formatNumber(target * eased, fmt)
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = formatNumber(target, fmt)
  }
  requestAnimationFrame(tick)
}

export function initGhStats(): void {
  const banner = document.querySelector<HTMLElement>('.gh-banner')
  if (!banner) return

  let played = false
  const play = (): void => {
    if (played) return
    played = true
    banner.classList.add('gh-banner-on')
    banner.querySelectorAll<HTMLElement>('.gh-stat-num').forEach((el, i) => {
      animateCounter(el, 200 + i * 200)
    })
    banner.querySelectorAll<HTMLElement>('.gh-langbar-seg').forEach((el, i) => {
      const pct = el.dataset.pct || '0'
      const baseDelay = 600 + i * 90
      if (REDUCE_MOTION) {
        el.style.width = pct + '%'
        return
      }
      el.style.transitionDelay = baseDelay + 'ms'
      requestAnimationFrame(() => {
        el.style.width = pct + '%'
      })
    })
  }

  if (typeof IntersectionObserver === 'undefined') {
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
    { threshold: 0.25 },
  )
  io.observe(banner)
}
