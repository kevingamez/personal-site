'use client'

// Lazy mount for the contact-section particle cube: the three.js chunk loads
// only when the section approaches, self-motion runs only while visible and
// motion is allowed. Dragging always works - it is user-initiated.

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ParticleCube = dynamic(() => import('./ParticleCube'), { ssr: false })
const CubeJourney = dynamic(() => import('./CubeJourney'), { ssr: false })

export function CubeStage() {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [journey, setJourney] = useState(false)

  useEffect(() => {
    // The scroll-choreographed figure needs a wide viewport; phones get the
    // section-local cube. It mounts even under prefers-reduced-motion because
    // its choreography is scroll-scrubbed (user-driven); only the self-running
    // idle spin is gated inside the scene.
    const mq = window.matchMedia('(min-width: 900px)')
    setJourney(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setJourney(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      setVisible(true)
      return
    }
    const loadIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          loadIo.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )
    const runIo = new IntersectionObserver((entries) => {
      setVisible(entries.some((e) => e.isIntersecting))
    })
    loadIo.observe(el)
    runIo.observe(el)
    return () => {
      loadIo.disconnect()
      runIo.disconnect()
    }
  }, [])

  return (
    <div ref={host} className="cube-stage" aria-hidden="true">
      {journey ? (
        <CubeJourney />
      ) : (
        near && <ParticleCube animate={visible && !reduced} reduced={reduced} />
      )}
    </div>
  )
}
