// Animated GitHub stats banner.
// Counters tween from 0 to target with cubic ease-out; the language bar
// fills its segments staggered. Triggered when the banner enters view.

import { animateCounter } from './counter'

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

export function initGhStats(): void {
  const banner = document.querySelector<HTMLElement>('.gh-banner')
  if (!banner) return

  let played = false
  const play = (): void => {
    if (played) return
    played = true
    banner.classList.add('gh-banner-on')
    banner.querySelectorAll<HTMLElement>('.gh-stat-num').forEach((el, i) => {
      const target = parseFloat(el.dataset.target || '0')
      const fmt = el.dataset.format || 'plain'
      animateCounter(el, {
        target,
        duration: 1600,
        delay: 200 + i * 200,
        format: (n) => formatNumber(n, fmt),
      })
    })
    // The segments are already laid out at their real widths by the server, so
    // the reveal only has to scale them. Collapsing here rather than in CSS is
    // what keeps the bar correct when this script never runs; and scaleX is
    // composited, where the old width tween relaid out the whole track on
    // every frame for a second and a half.
    banner.querySelectorAll<HTMLElement>('.gh-langbar-seg').forEach((el, i) => {
      if (REDUCE_MOTION) return
      el.style.transform = 'scaleX(0)'
      el.style.transitionDelay = 600 + i * 90 + 'ms'
      requestAnimationFrame(() => {
        el.style.transform = 'scaleX(1)'
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
    { threshold: 0.25 }
  )
  io.observe(banner)
}
