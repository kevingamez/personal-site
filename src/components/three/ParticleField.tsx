'use client'

// The Vela ParticleBackdrop: Dala's prismatic particle field, restated as a
// low-opacity wash for a light section. ~2400 points in the prism palette
// (mostly white/violet, a few amber/emerald per the taxonomy rule) drifting
// slowly, with a soft pointer parallax. Same technique as the reference site
// (three.js Points + BufferGeometry), driven by React Three Fiber.

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Points } from 'three'

const COUNT = 2400
const PRISM = ['#ffffff', '#7c5cff', '#9b82ff', '#e9a521', '#3e8e6e']
// white and violet dominate; amber/emerald are accents (Vela taxonomy).
const WEIGHTS = [0.5, 0.22, 0.14, 0.07, 0.07]

function buildField(): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const color = new Color()
  // Deterministic LCG so SSR/client and re-mounts agree; no visual jitter.
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const pick = () => {
    const r = rand()
    let acc = 0
    for (let i = 0; i < WEIGHTS.length; i++) {
      acc += WEIGHTS[i]
      if (r <= acc) return PRISM[i]
    }
    return PRISM[0]
  }
  for (let i = 0; i < COUNT; i++) {
    // A wide, shallow drifting band, denser toward the middle.
    const t = rand() * Math.PI * 2
    const rr = Math.sqrt(rand())
    positions[i * 3] = Math.cos(t) * rr * 8
    positions[i * 3 + 1] = (rand() - 0.5) * (2.6 - rr)
    positions[i * 3 + 2] = Math.sin(t) * rr * 3 - 1
    color.set(pick())
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  return { positions, colors }
}

function Field({ animate }: { animate: boolean }) {
  const points = useRef<Points>(null)
  const { positions, colors } = useMemo(buildField, [])

  useFrame((state, delta) => {
    if (!animate || !points.current) return
    const t = state.clock.elapsedTime
    points.current.rotation.y += delta * 0.02
    points.current.position.y = Math.sin(t * 0.18) * 0.12
    // Soft pointer parallax, eased toward the target.
    const target = state.pointer.x * 0.08
    points.current.rotation.z += (target - points.current.rotation.z) * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleField({ animate }: { animate: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 6], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop={animate ? 'always' : 'demand'}
    >
      <Field animate={animate} />
    </Canvas>
  )
}
