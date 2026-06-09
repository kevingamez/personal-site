// Shared eased-counter tween used by the home GitHub widgets (the contribution
// graph totals and the stats banner). Counts up from 0 to `target` with a cubic
// ease-out, honoring prefers-reduced-motion by jumping straight to the final
// value. The caller supplies `format` so each call site keeps its own number
// formatting (locale grouping, "K" compaction, etc.).

const REDUCE =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface CounterOptions {
  target: number
  duration: number
  delay: number
  format: (n: number) => string
}

export function animateCounter(el: HTMLElement, opts: CounterOptions): void {
  const { target, duration, delay, format } = opts
  if (REDUCE) {
    el.textContent = format(target)
    return
  }
  const start = performance.now() + delay
  function tick(now: number): void {
    const t = Math.max(0, Math.min(1, (now - start) / duration))
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = format(target * eased)
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = format(target)
  }
  requestAnimationFrame(tick)
}
