'use client'

// The Vela ParticleBackdrop: Dala's prismatic particle field. ~2400 points in
// the prism palette drift gently and - like the reference site - are pushed
// aside by the pointer, springing back once it leaves. Repulsion is direct
// manipulation, so it also works under prefers-reduced-motion; only the
// ambient drift is gated.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Color, Vector3, type Points } from 'three'

const COUNT = 2400
const PRISM = ['#ffffff', '#7c5cff', '#9b82ff', '#e9a521', '#3e8e6e']
// white and violet dominate; amber/emerald are accents (Vela taxonomy).
const WEIGHTS = [0.5, 0.22, 0.14, 0.07, 0.07]
const REPULSE_RADIUS = 1.7
const REPULSE_FORCE = 1.15
const EASE = 0.09

function buildField(): { base: Float32Array; colors: Float32Array; phase: Float32Array } {
  const base = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const phase = new Float32Array(COUNT)
  const color = new Color()
  // Deterministic LCG so re-mounts render the same field.
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
    const t = rand() * Math.PI * 2
    const rr = Math.sqrt(rand())
    base[i * 3] = Math.cos(t) * rr * 8
    base[i * 3 + 1] = (rand() - 0.5) * (2.6 - rr)
    base[i * 3 + 2] = Math.sin(t) * rr * 2 - 0.5
    phase[i] = (i * 0.618034 * Math.PI * 2) % (Math.PI * 2)
    color.set(pick())
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  return { base, colors, phase }
}

function Field({ animate }: { animate: boolean }) {
  const points = useRef<Points>(null)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const cursor = useRef({ x: 9e9, y: 9e9 })
  const { base, colors, phase } = useMemo(buildField, [])
  const positions = useMemo(() => base.slice(), [base])

  useEffect(() => {
    // The canvas sits behind content with pointer-events:none, so the pointer
    // is tracked on the window and unprojected onto the field's plane.
    const v = new Vector3()
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect()
      if (
        e.clientX < r.left - 60 ||
        e.clientX > r.right + 60 ||
        e.clientY < r.top - 60 ||
        e.clientY > r.bottom + 60
      ) {
        cursor.current.x = 9e9
        return
      }
      v.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
        0.5
      )
      v.unproject(camera).sub(camera.position).normalize()
      const t = -camera.position.z / v.z
      cursor.current.x = camera.position.x + v.x * t
      cursor.current.y = camera.position.y + v.y * t
    }
    const onLeave = () => {
      cursor.current.x = 9e9
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [gl, camera])

  useFrame((state) => {
    const geo = points.current?.geometry
    if (!geo) return
    const pos = geo.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    const cx = cursor.current.x
    const cy = cursor.current.y
    const r2 = REPULSE_RADIUS * REPULSE_RADIUS
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3
      const bob = animate ? Math.sin(t * 0.45 + phase[i]) * 0.07 : 0
      let tx = base[j]
      let ty = base[j + 1] + bob
      const dx = tx - cx
      const dy = ty - cy
      const d2 = dx * dx + dy * dy
      if (d2 < r2) {
        const d = Math.sqrt(d2) || 0.001
        const f = ((REPULSE_RADIUS - d) / REPULSE_RADIUS) * REPULSE_FORCE
        tx += (dx / d) * f
        ty += (dy / d) * f
      }
      pos[j] += (tx - pos[j]) * EASE
      pos[j + 1] += (ty - pos[j + 1]) * EASE
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleField({ active, animate }: { active: boolean; animate: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 6], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop={active ? 'always' : 'demand'}
    >
      <Field animate={animate} />
    </Canvas>
  )
}
