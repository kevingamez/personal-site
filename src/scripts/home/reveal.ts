// Scroll-reveal: elements fade + lift into place as they enter the viewport.
//
// Progressive enhancement: the hiding only happens once this script adds the
// `reveal-on` class to <html>, and only when motion is allowed. With no JS, a
// reduced-motion preference, or no IntersectionObserver, every element stays
// visible — content is never trapped at opacity 0. Elements inside the
// optional #strava section are skipped (it can be display:none until its data
// loads, which would prevent the observer from ever firing).

const STAGGER_GROUPS = new Set(['.tl-item', '.achievement', '.work-card', '.repo', '.post-card'])

// Hero (above the fold) animates via CSS on load instead, to avoid any
// first-paint flash; here we only reveal content that scrolls into view.
const SELECTORS = [
  '.sec-head',
  '.work-feature',
  '.work-card',
  '.tl-item',
  '.achievement',
  '.repo',
  '.post-card',
]

export function initReveal(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (typeof IntersectionObserver === 'undefined') return

  document.documentElement.classList.add('reveal-on')

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('in')
        obs.unobserve(e.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  for (const sel of SELECTORS) {
    const els = Array.from(document.querySelectorAll<HTMLElement>(sel)).filter(
      (el) => !el.closest('#strava')
    )
    const stagger = STAGGER_GROUPS.has(sel)
    els.forEach((el, i) => {
      el.classList.add('reveal')
      if (stagger) el.style.transitionDelay = `${Math.min(i * 70, 350)}ms`
      io.observe(el)
    })
  }
}
