// Render-on-demand for the dust journey, used only under prefers-reduced-motion.
//
// The scene freezes its own inputs when motion is reduced (`t: 0`, `waves: 0`,
// no rotation), but the render loop kept running at frameloop="always", so it
// recomputed and re-uploaded 13k particles every frame to draw an image that
// never changed. Measured on a 4x-throttled machine that was ~46 rAF/s of pure
// waste while the page sat still.
//
// The pose is still scroll-driven, so the scene cannot simply stop: it has to
// render while the page is moving and for long enough afterwards that the
// easing in useFrame (k = 1 - exp(-6 * delta)) reaches its target. SETTLE_MS
// covers that tail - by 900ms the residual is under half a percent.
//
// Pointer parallax deliberately does NOT wake the loop. Following the cursor is
// exactly the motion a reduced-motion request is asking us to drop.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const SETTLE_MS = 900

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useDemandRender(enabled: boolean): void {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (!enabled) return
    let until = 0
    let raf = 0

    const pump = (): void => {
      invalidate()
      raf = performance.now() < until ? requestAnimationFrame(pump) : 0
    }

    const wake = (): void => {
      until = performance.now() + SETTLE_MS
      if (!raf) raf = requestAnimationFrame(pump)
    }

    // The opening pose has to resolve once even if the visitor never scrolls.
    wake()
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', wake)

    return () => {
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', wake)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled, invalidate])
}
