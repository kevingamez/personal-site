'use client'

// Mount for the particle experience: the full-page dust journey with the
// brain, at EVERY screen size (the scene itself builds a lighter figure
// on phones). The canvas is fixed behind the page, so this element just
// anchors the contact-section dock and lazy-loads the three.js chunk.
//
// The mount waits for the intro curtain to leave, and then for the main thread
// to go idle. Two separate reasons:
//
//   - Idle: mounting on the first commit put a ~230KB gzip chunk download and a
//     ~250ms synchronous field build inside the LCP window, competing with the
//     paint of the hero copy.
//   - Curtain: idle alone was not enough. The curtain animates its counter and
//     bar from a rAF loop for 1400ms, and requestIdleCallback happily fires in
//     the gaps between those frames. buildField() is synchronous over 13k
//     particles, so it landed mid-animation and froze the counter for 275ms on
//     a fast machine and ~880ms on a throttled one. The scene is decorative and
//     sits behind the page, so it can wait for the curtain to finish.

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const BrainJourney = dynamic(() => import('./BrainJourney'), { ssr: false })

// Long enough that the hero has painted, short enough that the brain is there
// before anyone scrolls to the contact dock.
const IDLE_TIMEOUT_MS = 2000
// Past the curtain's own safety timeout, so a curtain that somehow never
// resolves can't strand the scene.
const CURTAIN_CAP_MS = 2400

export function CubeStage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    let idleId = 0
    let timerId = 0

    const start = (): void => setMounted(true)

    const startWhenIdle = (): void => {
      // Checked as a value, not with `in`: the latter narrows `window` itself to
      // never in the else branch, because lib.dom declares the method as always
      // present.
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS })
        return
      }
      timerId = window.setTimeout(start, 300)
    }

    // No curtain (returning visitor in this session, or reduced motion): the
    // old behaviour, straight to idle.
    if (!root.classList.contains('intro-pending')) {
      startWhenIdle()
      return () => {
        if (idleId) window.cancelIdleCallback(idleId)
        if (timerId) window.clearTimeout(timerId)
      }
    }

    const observer = new MutationObserver(() => {
      if (root.classList.contains('intro-pending')) return
      observer.disconnect()
      window.clearTimeout(timerId)
      timerId = 0
      startWhenIdle()
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    timerId = window.setTimeout(() => {
      observer.disconnect()
      startWhenIdle()
    }, CURTAIN_CAP_MS)

    return () => {
      observer.disconnect()
      if (idleId) window.cancelIdleCallback(idleId)
      if (timerId) window.clearTimeout(timerId)
    }
  }, [])

  return (
    <div className="cube-stage" aria-hidden="true">
      {mounted && <BrainJourney />}
    </div>
  )
}
