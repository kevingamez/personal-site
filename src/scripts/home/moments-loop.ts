// Lifecycle for the moments deck: when its render loop is allowed to run.

// The deck is one section of a very long page, and its frame is not cheap: 58
// cards, exponential fog, three lights and a raycast. It used to keep drawing
// all of that while scrolled far off screen, and while the tab sat in the
// background. The loop runs only when the section is near the viewport AND the
// tab is visible. dt is clamped, so returning from a long pause cannot jump the
// animation forward.
export function createVisibleLoop(
  root: Element,
  frame: (dt: number) => void
): { stop: () => void; dispose: () => void } {
  let raf = 0
  let running = false
  let onscreen = false
  let last = performance.now()

  const tick = (now: number): void => {
    frame(Math.min((now - last) / 1000, 1 / 30))
    last = now
    if (running) raf = requestAnimationFrame(tick)
  }
  const start = (): void => {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
  const stop = (): void => {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }
  const sync = (): void => {
    if (onscreen && !document.hidden) start()
    else stop()
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) onscreen = e.isIntersecting
      sync()
    },
    { rootMargin: '200px 0px' }
  )
  io.observe(root)
  document.addEventListener('visibilitychange', sync)

  return {
    stop,
    dispose: () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    },
  }
}
