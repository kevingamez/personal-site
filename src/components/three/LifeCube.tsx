'use client'

// Idea A - the Cube of Life: the particle cube's six faces are live Conway
// boards. Each particle is a cell following B3/S23; generations tick while
// the cube spins. Two looks: 'ink' (monochrome stipple, alive = full ink)
// and 'prism' (each face keeps its prism hue, alive = full color).

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, MathUtils, type Group, type Points } from 'three'
import { makeParticleMaterial } from './particle-material'

const N = 22 // cells per face side
const FACE_CELLS = N * N
const COUNT = FACE_CELLS * 6
const HALF = 1.35
const STEP_MS = 480
const FACE_COLORS = ['#7c5cff', '#e9a521', '#3e8e6e', '#d2617a', '#0b0b0c', '#a3a3a9']
const FACES: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

export type LifeVariant = 'ink' | 'prism'

function buildGrid() {
  const positions = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  for (let f = 0; f < 6; f++) {
    const [nx, ny, nz] = FACES[f]
    for (let c = 0; c < FACE_CELLS; c++) {
      const i = f * FACE_CELLS + c
      const u = ((c % N) / (N - 1)) * 2 - 1
      const w = (Math.floor(c / N) / (N - 1)) * 2 - 1
      const j = i * 3
      positions[j] = nx ? nx * HALF : u * HALF
      positions[j + 1] = ny ? ny * HALF : nx ? u * HALF : w * HALF
      positions[j + 2] = nz ? nz * HALF : w * HALF
      sizes[i] = 0.052
    }
  }
  return { positions, sizes }
}

function seedBoards(): Uint8Array[] {
  let seed = 1234
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  return Array.from({ length: 6 }, () => {
    const b = new Uint8Array(FACE_CELLS)
    for (let i = 0; i < FACE_CELLS; i++) b[i] = rand() < 0.32 ? 1 : 0
    return b
  })
}

// One B3/S23 step on a toroidal N x N board.
function stepBoard(b: Uint8Array): Uint8Array {
  const next = new Uint8Array(FACE_CELLS)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue
          n += b[((y + dy + N) % N) * N + ((x + dx + N) % N)]
        }
      }
      const i = y * N + x
      next[i] = b[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0
    }
  }
  return next
}

function Scene({ variant }: { variant: LifeVariant }) {
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const { positions, sizes } = useMemo(buildGrid, [])
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 1, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const boards = useRef(seedBoards())
  const lastStep = useRef(0)
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })

  // Alive/dead color pairs per face, blended toward the live state each frame.
  const palette = useMemo(() => {
    const alive = new Float32Array(COUNT * 3)
    const dead = new Float32Array(COUNT * 3)
    const c = new Color()
    const paper = new Color('#f4f4f2')
    for (let f = 0; f < 6; f++) {
      c.set(variant === 'ink' ? '#0b0b0c' : FACE_COLORS[f])
      const d = c.clone().lerp(paper, variant === 'ink' ? 0.88 : 0.85)
      for (let k = 0; k < FACE_CELLS; k++) {
        const i = (f * FACE_CELLS + k) * 3
        alive[i] = c.r
        alive[i + 1] = c.g
        alive[i + 2] = c.b
        dead[i] = d.r
        dead[i + 1] = d.g
        dead[i + 2] = d.b
      }
    }
    return { alive, dead }
  }, [variant])
  const colors = useMemo(() => palette.dead.slice(), [palette])

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

  useFrame((state, delta) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    g.rotation.y += drag.current.vy + (drag.current.on ? 0 : delta * 0.14)
    g.rotation.x = MathUtils.clamp(g.rotation.x + drag.current.vx, -1.1, 1.1)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    const now = state.clock.elapsedTime * 1000
    if (now - lastStep.current > STEP_MS) {
      lastStep.current = now
      boards.current = boards.current.map(stepBoard)
    }
    // Ease every cell's color toward its current alive/dead target.
    const col = geo.attributes.color.array as Float32Array
    const { alive, dead } = palette
    for (let f = 0; f < 6; f++) {
      const b = boards.current[f]
      for (let k = 0; k < FACE_CELLS; k++) {
        const i = (f * FACE_CELLS + k) * 3
        const t = b[k] ? alive : dead
        col[i] += (t[i] - col[i]) * 0.12
        col[i + 1] += (t[i + 1] - col[i + 1]) * 0.12
        col[i + 2] += (t[i + 2] - col[i + 2]) * 0.12
      }
    }
    geo.attributes.color.needsUpdate = true
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

export default function LifeCube({ variant }: { variant: LifeVariant }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 5.6], fov: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Scene variant={variant} />
    </Canvas>
  )
}
