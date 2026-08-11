// Lenis smooth scrolling - the weighted, cinematic glide the reference site
// runs on. Wheel input is interpolated; the cube journey and reveals read
// window.scrollY, so they inherit the damped motion for free. Native scroll
// stays untouched on coarse pointers (touch) and under reduced motion.

import Lenis from 'lenis'

export function initSmoothScroll(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(pointer: fine)').matches) return

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })
  const raf = (time: number): void => {
    lenis.raf(time)
    window.requestAnimationFrame(raf)
  }
  window.requestAnimationFrame(raf)

  // Anchor links glide through Lenis instead of jumping natively.
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null
    const link = target?.closest?.('a[href^="#"]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href || href === '#') return
    const el = document.querySelector(href)
    if (!el) return
    e.preventDefault()
    lenis.scrollTo(el as HTMLElement, { offset: -72 })
  })
}
