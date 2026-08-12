// /lab - unlisted React Three Fiber proving ground. Not linked from the site
// and noindexed; it exists so the R3F setup stays verified while the real 3D
// work is designed.

import type { Metadata } from 'next'
import '@/styles/home/index.css'
import { LabScene } from '@/components/three/LabScene'

export const metadata: Metadata = {
  title: 'Lab, Kevin Gámez',
  description: 'Unlisted experiments.',
  robots: { index: false, follow: false },
}

export default function LabPage() {
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px' }}>
      <div className="sec-num">Lab</div>
      <h1 className="sec-title">Three.js, wired up.</h1>
      <p className="sec-blurb" style={{ margin: '12px 0 32px' }}>
        React Three Fiber renders below. This page is unlisted.
      </p>
      <div
        style={{
          height: '60vh',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        <LabScene />
      </div>
    </main>
  )
}
