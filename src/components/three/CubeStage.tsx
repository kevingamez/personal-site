'use client'

// Mount for the particle experience: the full-page dust journey with the
// brain, at EVERY screen size (the scene itself builds a lighter figure
// on phones). The canvas is fixed behind the page, so this element just
// anchors the contact-section dock and lazy-loads the three.js chunk.

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const BrainJourney = dynamic(() => import('./BrainJourney'), { ssr: false })

export function CubeStage() {
  const host = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div ref={host} className="cube-stage" aria-hidden="true">
      {mounted && <BrainJourney />}
    </div>
  )
}
