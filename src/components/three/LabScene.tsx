'use client'

// React Three Fiber setup scene: a Vela-toned still life (paper ground, ink
// object, one violet accent light). This is deliberately minimal - it exists
// to prove the R3F pipeline works end to end; the real 3D work comes later.
// Rotation is driven by useFrame and disabled under prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function InkCube({ paused }: { paused: boolean }) {
  const mesh = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (paused || !mesh.current) return
    mesh.current.rotation.x += delta * 0.25
    mesh.current.rotation.y += delta * 0.35
  })
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      <meshStandardMaterial color="#0b0b0c" roughness={0.35} metalness={0.1} />
    </mesh>
  )
}

export function LabScene() {
  const reduced = usePrefersReducedMotion()
  return (
    <Canvas camera={{ position: [2.6, 2, 3.2], fov: 40 }} style={{ background: '#f4f4f2' }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <pointLight position={[-4, 2, -2]} intensity={12} color="#7c5cff" />
      <InkCube paused={reduced} />
    </Canvas>
  )
}
