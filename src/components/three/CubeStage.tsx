'use client'

// Mount for the particle experience: the full-page dust journey with the
// brain, at EVERY screen size (the scene itself builds a lighter figure
// on phones). The canvas is fixed behind the page, so this element just
// anchors the contact-section dock and lazy-loads the three.js chunk.
//
// The mount waits for the main thread to go idle. Mounting on the first commit
// put a ~230KB gzip chunk download and a ~250ms synchronous field build inside
// the LCP window, competing with the paint of the hero copy. The scene is
// decorative and lands a beat later, which nobody perceives.

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const BrainJourney = dynamic(() => import('./BrainJourney'), { ssr: false })

// Long enough that the hero has painted, short enough that the brain is there
// before anyone scrolls to the contact dock.
const IDLE_TIMEOUT_MS = 2000

export function CubeStage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const start = (): void => setMounted(true)

    // Checked as a value, not with `in`: the latter narrows `window` itself to
    // never in the else branch, because lib.dom declares the method as always
    // present.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS })
      return () => window.cancelIdleCallback(id)
    }

    const id = window.setTimeout(start, 300)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="cube-stage" aria-hidden="true">
      {mounted && <BrainJourney />}
    </div>
  )
}
