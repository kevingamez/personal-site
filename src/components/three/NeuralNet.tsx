'use client'

// Idea B - the Neural Network: particles arranged as a 4-layer net with
// visible connections; an activation pulse propagates layer by layer (a
// forward pass, visualized). Two looks: 'flat' (the net faces the visitor)
// and 'depth' (layers stacked into z, seen from a three-quarter angle).

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
import { makeParticleMaterial } from './particle-material'

const LAYERS = [10, 14, 14, 6]
const NODE_COUNT = LAYERS.reduce((a, b) => a + b, 0)
const PULSE_S = 2.6 // seconds per full forward pass
const INK = new Color('#0b0b0c')
const FAINT = new Color('#0b0b0c').lerp(new Color('#f4f4f2'), 0.82)
const VIOLET = new Color('#7c5cff')

export type NetVariant = 'flat' | 'depth'

function buildNet(variant: NetVariant) {
  const positions = new Float32Array(NODE_COUNT * 3)
  const sizes = new Float32Array(NODE_COUNT)
  const layerOf = new Float32Array(NODE_COUNT)
  let seed = 77
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  let i = 0
  for (let l = 0; l < LAYERS.length; l++) {
    const n = LAYERS[l]
    for (let k = 0; k < n; k++) {
      const j = i * 3
      const spreadY = ((k / (n - 1)) * 2 - 1) * 1.6
      if (variant === 'flat') {
        positions[j] = ((l / (LAYERS.length - 1)) * 2 - 1) * 1.9
        positions[j + 1] = spreadY
        positions[j + 2] = (rand() - 0.5) * 0.12
      } else {
        positions[j] = ((l / (LAYERS.length - 1)) * 2 - 1) * 1.1 + (rand() - 0.5) * 0.1
        positions[j + 1] = spreadY
        positions[j + 2] = ((l / (LAYERS.length - 1)) * 2 - 1) * -1.4
      }
      sizes[i] = 0.11 + rand() * 0.05
      layerOf[i] = l
      i++
    }
  }
  // Edges: each node connects to ~45% of the next layer, deterministically.
  const edges: [number, number][] = []
  let offset = 0
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const nextOffset = offset + LAYERS[l]
    for (let a = 0; a < LAYERS[l]; a++) {
      for (let b = 0; b < LAYERS[l + 1]; b++) {
        if (rand() < 0.45) edges.push([offset + a, nextOffset + b])
      }
    }
    offset = nextOffset
  }
  return { positions, sizes, layerOf, edges }
}

function Scene({ variant }: { variant: NetVariant }) {
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const { positions, sizes, layerOf, edges } = useMemo(() => buildNet(variant), [variant])
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 1, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const nodeColors = useMemo(() => {
    const c = new Float32Array(NODE_COUNT * 3)
    for (let i = 0; i < NODE_COUNT; i++) {
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
      for (let v = 0; v < 6; v += 3) {
        col[e * 6 + v] = FAINT.r
        col[e * 6 + v + 1] = FAINT.g
        col[e * 6 + v + 2] = FAINT.b
      }
    })
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('color', new BufferAttribute(col, 3))
    return g
  }, [edges, positions])
  const lineMat = useMemo(
    () => new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 }),
    []
  )
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const scratch = useMemo(() => new Color(), [])

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
    g.rotation.y += drag.current.vy + (drag.current.on ? 0 : 0.0016)
    g.rotation.x = MathUtils.clamp(g.rotation.x + drag.current.vx, -0.9, 0.9)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Forward pass: the pulse sweeps layer 0 -> L, ink at rest, violet at peak.
    const pulse = ((state.clock.elapsedTime % PULSE_S) / PULSE_S) * (LAYERS.length + 0.6) - 0.3
    const col = geo.attributes.color.array as Float32Array
    for (let i = 0; i < NODE_COUNT; i++) {
      const heat = MathUtils.clamp(1 - Math.abs(layerOf[i] - pulse) / 0.7, 0, 1)
      scratch
        .copy(FAINT)
        .lerp(INK, Math.min(1, heat * 1.6))
        .lerp(VIOLET, heat * 0.75)
      col[i * 3] = scratch.r
      col[i * 3 + 1] = scratch.g
      col[i * 3 + 2] = scratch.b
    }
    geo.attributes.color.needsUpdate = true
    const lcol = lineGeo.attributes.color.array as Float32Array
    edges.forEach(([a], e) => {
      const heat = MathUtils.clamp(1 - Math.abs(layerOf[a] + 0.5 - pulse) / 0.6, 0, 1)
      scratch.copy(FAINT).lerp(VIOLET, heat * 0.8)
      for (let v = 0; v < 6; v += 3) {
        lcol[e * 6 + v] = scratch.r
        lcol[e * 6 + v + 1] = scratch.g
        lcol[e * 6 + v + 2] = scratch.b
      }
    })
    lineGeo.attributes.color.needsUpdate = true
  })

  return (
    <group ref={group} rotation={variant === 'depth' ? [0.25, -0.5, 0] : [0.05, -0.15, 0]}>
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
      camera={{ position: [0, 0, 5.6], fov: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Scene variant={variant} />
    </Canvas>
  )
}
