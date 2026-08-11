'use client'

// The Dala move, in Vela form: a figure MADE OF particles. ~7200 points form
// a cube whose six faces carry the prism hues. On first sight the particles
// fly in from a scattered cloud and assemble into the figure; drag spins it
// with inertia and the cursor pushes nearby particles off the surface, where
// they spring back. Under prefers-reduced-motion the cube starts assembled
// and only direct manipulation (drag, cursor) moves anything.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, MathUtils, Vector3, type Group, type Points } from 'three'
import { buildSizes, makeParticleMaterial } from './particle-material'
import { type CubeVariant } from './cube-variants'

const HALF = 1.35 // cube half-size
// One prism hue per face; dark-leaning so the figure reads on paper.
const FACE_COLORS = ['#7c5cff', '#e9a521', '#3e8e6e', '#d2617a', '#0b0b0c', '#a3a3a9']
// ink-violet palette: ink dust with violet glints, amber as a rare accent
// (the judges' one note on the winning look: keep amber scarce).
const INK_VIOLET = [
  '#0b0b0c',
  '#0b0b0c',
  '#0b0b0c',
  '#0b0b0c',
  '#0b0b0c',
  '#0b0b0c',
  '#3a3a3e',
  '#3a3a3e',
  '#7c5cff',
  '#7c5cff',
  '#7c5cff',
  '#e9a521',
]
const FACES: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

function buildCube(cfg: CubeVariant) {
  const count = cfg.count
  const target = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const stagger = new Float32Array(count)
  const color = new Color()
  let seed = 99
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const setColor = (i: number, f: number) => {
    if (cfg.palette === 'faces') color.set(FACE_COLORS[f])
    else if (cfg.palette === 'ink') color.set(rand() < 0.9 ? '#0b0b0c' : '#3a3a3e')
    else color.set(INK_VIOLET[Math.floor(rand() * INK_VIOLET.length)])
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  for (let i = 0; i < count; i++) {
    const j = i * 3
    const f = Math.floor(rand() * 6)
    const [nx, ny, nz] = FACES[f]
    const u = (rand() * 2 - 1) * HALF
    const w = (rand() * 2 - 1) * HALF
    const jit = (rand() - 0.5) * cfg.jitter * 2
    if (cfg.distribution === 'volume') {
      // Fill the body, biased toward the shell so the form still reads.
      const r = Math.cbrt(rand())
      target[j] = (rand() * 2 - 1) * HALF * r
      target[j + 1] = (rand() * 2 - 1) * HALF * r
      target[j + 2] = (rand() * 2 - 1) * HALF * r
    } else if (cfg.distribution === 'edges' && rand() < (cfg.edgeShare ?? 0.45)) {
      // Concentrate on the 12 edges: two coordinates pinned, one free.
      const e1 = rand() < 0.5 ? -HALF : HALF
      const e2 = rand() < 0.5 ? -HALF : HALF
      const axis = Math.floor(rand() * 3)
      const t = (rand() * 2 - 1) * HALF
      const soft = () => (rand() - 0.5) * 0.08
      if (axis === 0) {
        target[j] = t
        target[j + 1] = e1 + soft()
        target[j + 2] = e2 + soft()
      } else if (axis === 1) {
        target[j] = e1 + soft()
        target[j + 1] = t
        target[j + 2] = e2 + soft()
      } else {
        target[j] = e1 + soft()
        target[j + 1] = e2 + soft()
        target[j + 2] = t
      }
    } else {
      target[j] = nx ? nx * (HALF + jit) : u
      target[j + 1] = ny ? ny * (HALF + jit) : nx ? u : w
      target[j + 2] = nz ? nz * (HALF + jit) : w
    }
    // Scatter start: a wide loose sphere the particles fly in from.
    const th = rand() * Math.PI * 2
    const ph = Math.acos(rand() * 2 - 1)
    const rr = 3.4 + rand() * 2.2
    scatter[j] = Math.sin(ph) * Math.cos(th) * rr
    scatter[j + 1] = Math.cos(ph) * rr
    scatter[j + 2] = Math.sin(ph) * Math.sin(th) * rr
    stagger[i] = rand() * 0.45
    setColor(i, f)
  }
  const sizes = buildSizes(count, rand, cfg.sizeScale)
  return { target, scatter, colors, stagger, sizes, count }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function Scene({
  animate,
  reduced,
  cfg,
}: {
  animate: boolean
  reduced: boolean
  cfg: CubeVariant
}) {
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const { target, scatter, colors, stagger, sizes, count } = useMemo(() => buildCube(cfg), [cfg])
  const material = useMemo(
    () =>
      makeParticleMaterial({
        opacity: cfg.opacity,
        pixelRatio: Math.min(gl.getPixelRatio(), 1.75),
      }),
    [gl, cfg]
  )
  const positions = useMemo(
    () => (reduced ? target.slice() : scatter.slice()),
    [reduced, target, scatter]
  )
  const progress = useRef(reduced ? 1 : 0)
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const cursor = useRef({ x: 9e9, y: 9e9 })
  const local = useMemo(() => new Vector3(), [])

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
      const r = el.getBoundingClientRect()
      const v = new Vector3(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
        0.5
      )
      v.unproject(camera).sub(camera.position).normalize()
      const t = -camera.position.z / v.z
      cursor.current.x = camera.position.x + v.x * t
      cursor.current.y = camera.position.y + v.y * t
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
    const leave = () => {
      cursor.current.x = 9e9
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('pointerleave', leave)
    }
  }, [gl, camera])

  useFrame((_, delta) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    // Whole-figure spin: drag with inertia, gentle idle rotation.
    g.rotation.y += drag.current.vy
    g.rotation.x = MathUtils.clamp(g.rotation.x + drag.current.vx, -1.1, 1.1)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93
    if (animate && !drag.current.on) g.rotation.y += delta * 0.16
    // Assembly progress (skipped when reduced - starts formed).
    if (animate && progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / 1.7)
    }
    // Cursor into the figure's local space so repulsion tracks the rotation.
    local.set(cursor.current.x, cursor.current.y, 0)
    g.worldToLocal(local)
    const pos = geo.attributes.position.array as Float32Array
    const p = progress.current
    for (let i = 0; i < count; i++) {
      const j = i * 3
      const t = easeOutCubic(MathUtils.clamp((p - stagger[i]) / 0.55, 0, 1))
      let tx = scatter[j] + (target[j] - scatter[j]) * t
      let ty = scatter[j + 1] + (target[j + 1] - scatter[j + 1]) * t
      let tz = scatter[j + 2] + (target[j + 2] - scatter[j + 2]) * t
      const dx = tx - local.x
      const dy = ty - local.y
      const dz = tz - local.z
      const d2 = dx * dx + dy * dy + dz * dz
      if (d2 < 1.1) {
        const d = Math.sqrt(d2) || 0.001
        const f = ((1.05 - d) / 1.05) * 0.9
        tx += (dx / d) * f
        ty += (dy / d) * f
        tz += (dz / d) * f
      }
      pos[j] += (tx - pos[j]) * 0.11
      pos[j + 1] += (ty - pos[j + 1]) * 0.11
      pos[j + 2] += (tz - pos[j + 2]) * 0.11
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <group ref={group} rotation={[0.42, -0.6, 0]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
    </group>
  )
}

export default function ParticleCube({
  animate,
  reduced,
  cfg,
}: {
  animate: boolean
  reduced: boolean
  cfg: CubeVariant
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 5.6], fov: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Scene animate={animate} reduced={reduced} cfg={cfg} />
    </Canvas>
  )
}
