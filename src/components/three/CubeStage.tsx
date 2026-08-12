'use client'

// Mount for the particle experience. Desktop gets the full-page dust
// journey (the brain in the hero, dust between sections, the dock at
// contact); narrow screens get the section-local cube. The old ?fx=
// preview modes are gone - every URL shows the real experience.

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ParticleCube = dynamic(() => import('./ParticleCube'), { ssr: false })
const BrainJourney = dynamic(() => import('./BrainJourney'), { ssr: false })

export function CubeStage() {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [journey, setJourney] = useState(false)

  useEffect(() => {
    // The journey needs a wide viewport; phones get the section-local
    // cube. It mounts even under prefers-reduced-motion because its
    // choreography is scroll-scrubbed (user-driven); only self-running
    // motion is gated inside the scene.
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
        <BrainJourney />
      ) : (
        near && <ParticleCube animate={visible && !reduced} reduced={reduced} />
      )}
    </div>
  )
}
