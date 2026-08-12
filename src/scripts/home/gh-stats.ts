// Language-mix bar reveal. The segments ship at their real widths from the
// server, so this only scales them in when the strip enters view.
//
// It used to also tween the three stat counters in the banner above the bar;
// those tiles folded into the section's single stat row, which is plain
// server-rendered text.

const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initGhStats(): void {
  const banner = document.querySelector<HTMLElement>('.gh-banner')
  if (!banner) return
  if (REDUCE_MOTION) return

  let played = false
  const play = (): void => {
    if (played) return
    played = true
    // Collapsing here rather than in CSS is what keeps the bar correct when
    // this script never runs; and scaleX is composited, where the old width
    // tween relaid out the whole track on every frame for a second and a half.
    banner.querySelectorAll<HTMLElement>('.gh-langbar-seg').forEach((el, i) => {
      el.style.transform = 'scaleX(0)'
      el.style.transitionDelay = 200 + i * 90 + 'ms'
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
