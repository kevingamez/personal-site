'use client'

// Lazy mount for the contact-section particle wash. three.js is a heavy
// chunk, so it only loads when the section approaches the viewport, and the
// frameloop only runs while the section is actually on screen. Under
// prefers-reduced-motion the field renders once, static.

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false })

export function ContactParticles() {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

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
    <div ref={host} className="contact-fx" aria-hidden="true">
      {near && <ParticleField animate={visible && !reduced} />}
    </div>
  )
}
