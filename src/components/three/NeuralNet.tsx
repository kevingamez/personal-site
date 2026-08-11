'use client'

// Idea B, rebuilt the way the reference brain is built: a VOLUMETRIC figure.
// ~2800 neuron-particles fill a 3D body, short synapse-like connections web
// the volume, and activation waves ripple THROUGH it from firing points -
// neurons flash violet as the wavefront passes. Drag to spin. Two bodies:
// 'cloud' (one ellipsoid) and 'lobes' (two-lobed, brain-silhouetted).

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MathUtils,
  type Group,
  type Points,
} from 'three'
import { buildSizes, makeParticleMaterial } from './particle-material'

const NODES = 2800
const LINKS_PER_NODE = 2
const LINK_MAX_DIST = 0.42
const WAVE_S = 3.2 // seconds per wave
const WAVE_BAND = 0.55
const INK = new Color('#0b0b0c')
const FAINT = new Color('#0b0b0c').lerp(new Color('#f4f4f2'), 0.78)
const VIOLET = new Color('#7c5cff')

export type NetVariant = 'cloud' | 'lobes'

function buildVolume(variant: NetVariant) {
  const positions = new Float32Array(NODES * 3)
  let seed = 424242
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let i = 0; i < NODES; i++) {
    // Dense-core ellipsoid sampling (cube-root bias keeps the body solid).
    const th = rand() * Math.PI * 2
    const ph = Math.acos(rand() * 2 - 1)
    const r = Math.cbrt(rand())
    let x = Math.sin(ph) * Math.cos(th) * r * 1.9
    const y = Math.cos(ph) * r * 1.35
    const z = Math.sin(ph) * Math.sin(th) * r * 1.45
    if (variant === 'lobes') {
      // Two lobes with a soft central fissure, like the reference figure.
      const side = i % 2 === 0 ? 1 : -1
      x = x * 0.62 + side * 0.72
    }
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }

  // Synapses: each node links to its nearest few neighbors within reach,
  // found via a coarse spatial hash so build time stays trivial.
  const cell = LINK_MAX_DIST
  const hash = new Map<string, number[]>()
  const keyOf = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  for (let i = 0; i < NODES; i++) {
    const k = keyOf(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
    const arr = hash.get(k)
    if (arr) arr.push(i)
    else hash.set(k, [i])
  }
  const edges: [number, number][] = []
  for (let i = 0; i < NODES; i++) {
    const x = positions[i * 3]
    const y = positions[i * 3 + 1]
    const z = positions[i * 3 + 2]
    const near: { j: number; d: number }[] = []
    for (let cx = -1; cx <= 1; cx++)
      for (let cy = -1; cy <= 1; cy++)
        for (let cz = -1; cz <= 1; cz++) {
          const bucket = hash.get(keyOf(x + cx * cell, y + cy * cell, z + cz * cell))
          if (!bucket) continue
          for (const j of bucket) {
            if (j <= i) continue
            const dx = positions[j * 3] - x
            const dy = positions[j * 3 + 1] - y
            const dz = positions[j * 3 + 2] - z
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            if (d < LINK_MAX_DIST) near.push({ j, d })
          }
        }
    near.sort((a, b) => a.d - b.d)
    for (let n = 0; n < Math.min(LINKS_PER_NODE, near.length); n++) edges.push([i, near[n].j])
  }

  // Firing origins for the activation waves: a handful of scattered nodes.
  const origins: number[] = []
  for (let o = 0; o < 5; o++) origins.push(Math.floor(rand() * NODES))
  const sizes = buildSizes(NODES, rand, 1.5)
  return { positions, edges, origins, sizes }
}

function Scene({ variant }: { variant: NetVariant }) {
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const { positions, edges, origins, sizes } = useMemo(() => buildVolume(variant), [variant])
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const nodeColors = useMemo(() => {
    const c = new Float32Array(NODES * 3)
    for (let i = 0; i < NODES; i++) {
      c[i * 3] = FAINT.r
      c[i * 3 + 1] = FAINT.g
      c[i * 3 + 2] = FAINT.b
    }
    return c
  }, [])
  const lineGeo = useMemo(() => {
    const g = new BufferGeometry()
    const pos = new Float32Array(edges.length * 6)
    const col = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], e) => {
      pos.set(positions.slice(a * 3, a * 3 + 3), e * 6)
      pos.set(positions.slice(b * 3, b * 3 + 3), e * 6 + 3)
    })
    col.fill(0)
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('color', new BufferAttribute(col, 3))
    return g
  }, [edges, positions])
  const lineMat = useMemo(
    () => new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22 }),
    []
  )
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const scratch = useMemo(() => new Color(), [])
  // Per-node distance to the currently firing origin, recomputed on switch.
  const waveState = useRef({ origin: -1, dists: new Float32Array(NODES) })

  useEffect(() => {
    const el = gl.domElement
    el.style.cursor = 'grab'
    const down = (e: PointerEvent) => {
      drag.current.on = true
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!drag.current.on) return
      drag.current.vy = (e.clientX - drag.current.px) * 0.005
      drag.current.vx = (e.clientY - drag.current.py) * 0.005
      drag.current.px = e.clientX
      drag.current.py = e.clientY
    }
    const up = () => {
      drag.current.on = false
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  useFrame((state) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    g.rotation.y += drag.current.vy + (drag.current.on ? 0 : 0.0022)
    g.rotation.x = MathUtils.clamp(g.rotation.x + drag.current.vx, -0.9, 0.9)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Each wave cycle fires from the next origin; the front expands through
    // the volume and neurons flash as it passes.
    const t = state.clock.elapsedTime
    const cycle = Math.floor(t / WAVE_S)
    const originIdx = origins[cycle % origins.length]
    if (waveState.current.origin !== originIdx) {
      waveState.current.origin = originIdx
      const ox = positions[originIdx * 3]
      const oy = positions[originIdx * 3 + 1]
      const oz = positions[originIdx * 3 + 2]
      for (let i = 0; i < NODES; i++) {
        const dx = positions[i * 3] - ox
        const dy = positions[i * 3 + 1] - oy
        const dz = positions[i * 3 + 2] - oz
        waveState.current.dists[i] = Math.sqrt(dx * dx + dy * dy + dz * dz)
      }
    }
    const front = ((t % WAVE_S) / WAVE_S) * 4.6
    const col = geo.attributes.color.array as Float32Array
    const dists = waveState.current.dists
    for (let i = 0; i < NODES; i++) {
      const heat = MathUtils.clamp(1 - Math.abs(dists[i] - front) / WAVE_BAND, 0, 1)
      scratch
        .copy(FAINT)
        .lerp(INK, Math.min(1, heat * 1.4))
        .lerp(VIOLET, heat * 0.85)
      col[i * 3] = scratch.r
      col[i * 3 + 1] = scratch.g
      col[i * 3 + 2] = scratch.b
    }
    geo.attributes.color.needsUpdate = true
    // Synapses inherit their endpoints' heat.
    const lcol = lineGeo.attributes.color.array as Float32Array
    edges.forEach(([a, b], e) => {
      for (const [v, n] of [
        [0, a],
        [3, b],
      ] as const) {
        lcol[e * 6 + v] = col[n * 3]
        lcol[e * 6 + v + 1] = col[n * 3 + 1]
        lcol[e * 6 + v + 2] = col[n * 3 + 2]
      }
    })
    lineGeo.attributes.color.needsUpdate = true
  })

  return (
    <group ref={group} rotation={[0.15, -0.4, 0]}>
      <lineSegments geometry={lineGeo} material={lineMat} />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
    </group>
  )
}

export default function NeuralNet({ variant }: { variant: NetVariant }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Scene variant={variant} />
    </Canvas>
  )
}
