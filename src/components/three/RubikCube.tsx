'use client'

// Interactive Rubik's cube in the Vela palette: ink body, prism stickers.
// It scrambles itself with eased quarter-turns (the classic pivot-group
// technique: attach a layer to a pivot, rotate, re-attach and snap), and the
// whole cube can be grabbed and spun with the pointer, with inertia. Under
// prefers-reduced-motion nothing moves on its own, but direct manipulation
// always works: drag spins the cube and a click/tap twists a layer.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Group, MathUtils } from 'three'

const S = 1.06 // grid spacing
const TURN_MS = 620
const TURN_GAP_MS = 1500
const AXES = ['x', 'y', 'z'] as const
type Axis = (typeof AXES)[number]

// Face stickers: the prism, one hue per face (Vela taxonomy - violet leads,
// amber/emerald/rose as accents, paper and hairline-gray complete the six).
const FACES: { n: [number, number, number]; rot: [number, number, number]; color: string }[] = [
  { n: [1, 0, 0], rot: [0, Math.PI / 2, 0], color: '#7c5cff' },
  { n: [-1, 0, 0], rot: [0, -Math.PI / 2, 0], color: '#e9a521' },
  { n: [0, 1, 0], rot: [-Math.PI / 2, 0, 0], color: '#f4f4f2' },
  { n: [0, -1, 0], rot: [Math.PI / 2, 0, 0], color: '#3e8e6e' },
  { n: [0, 0, 1], rot: [0, 0, 0], color: '#d2617a' },
  { n: [0, 0, -1], rot: [0, Math.PI, 0], color: '#dedee0' },
]

function Cubie({ grid }: { grid: [number, number, number] }) {
  return (
    <group position={[grid[0] * S, grid[1] * S, grid[2] * S]}>
      <RoundedBox args={[1, 1, 1]} radius={0.09} smoothness={3}>
        <meshStandardMaterial color="#0b0b0c" roughness={0.32} metalness={0.05} />
      </RoundedBox>
      {FACES.filter((f) => f.n[0] * grid[0] + f.n[1] * grid[1] + f.n[2] * grid[2] === 1).map(
        (f, i) => (
          <mesh
            key={i}
            position={[f.n[0] * 0.501, f.n[1] * 0.501, f.n[2] * 0.501]}
            rotation={f.rot}
          >
            <planeGeometry args={[0.8, 0.8]} />
            <meshStandardMaterial color={f.color} roughness={0.4} metalness={0} />
          </mesh>
        )
      )}
    </group>
  )
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function Scene({ animate }: { animate: boolean }) {
  const spinner = useRef<Group>(null) // whole-cube orientation (drag + idle)
  const root = useRef<Group>(null) // holds resting cubies
  const pivot = useRef<Group>(null) // holds the turning layer
  const gl = useThree((s) => s.gl)

  const grids = useMemo(() => {
    const out: [number, number, number][] = []
    for (const x of [-1, 0, 1])
      for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) if (x || y || z) out.push([x, y, z])
    return out
  }, [])

  const turn = useRef<{ axis: Axis; dir: 1 | -1; t: number } | null>(null)
  const wait = useRef(600)
  const seed = useRef(7)
  const rand = () => {
    seed.current = (seed.current * 1664525 + 1013904223) % 4294967296
    return seed.current / 4294967296
  }
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0, sx: 0, sy: 0, click: false })

  useEffect(() => {
    const el = gl.domElement
    el.style.cursor = 'grab'
    const down = (e: PointerEvent) => {
      drag.current.on = true
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      drag.current.sx = e.clientX
      drag.current.sy = e.clientY
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!drag.current.on) return
      drag.current.vy = (e.clientX - drag.current.px) * 0.006
      drag.current.vx = (e.clientY - drag.current.py) * 0.006
      drag.current.px = e.clientX
      drag.current.py = e.clientY
    }
    const up = (e: PointerEvent) => {
      if (drag.current.on) {
        // A press without meaningful movement is a click: twist one layer.
        const moved = Math.abs(e.clientX - drag.current.sx) + Math.abs(e.clientY - drag.current.sy)
        if (moved < 6) drag.current.click = true
      }
      drag.current.on = false
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  const startTurn = () => {
    if (!root.current || !pivot.current) return
    const axis = AXES[Math.floor(rand() * 3)]
    const layer = [-1, 0, 1][Math.floor(rand() * 3)]
    const dir = rand() < 0.5 ? 1 : -1
    const eps = 0.3
    for (const child of [...root.current.children]) {
      const p = child.position
      const v = axis === 'x' ? p.x : axis === 'y' ? p.y : p.z
      if (Math.abs(v - layer * S) < eps) pivot.current.attach(child)
    }
    turn.current = { axis, dir, t: 0 }
  }

  const finishTurn = () => {
    if (!root.current || !pivot.current) return
    pivot.current.updateMatrixWorld(true)
    for (const child of [...pivot.current.children]) {
      root.current.attach(child)
      // Snap position to the grid and orientation to the nearest quarter turn
      // so floating-point drift never accumulates.
      child.position.set(
        Math.round(child.position.x / S) * S,
        Math.round(child.position.y / S) * S,
        Math.round(child.position.z / S) * S
      )
      const e = child.rotation
      e.x = (Math.round(e.x / (Math.PI / 2)) * Math.PI) / 2
      e.y = (Math.round(e.y / (Math.PI / 2)) * Math.PI) / 2
      e.z = (Math.round(e.z / (Math.PI / 2)) * Math.PI) / 2
    }
    pivot.current.rotation.set(0, 0, 0)
    turn.current = null
    wait.current = TURN_GAP_MS
  }

  useFrame((_, delta) => {
    const sp = spinner.current
    if (sp) {
      sp.rotation.y += drag.current.vy
      sp.rotation.x = MathUtils.clamp(sp.rotation.x + drag.current.vx, -1.2, 1.2)
      // Inertia decay; gentle idle spin when hands-off and motion is allowed.
      drag.current.vx *= 0.92
      drag.current.vy *= 0.92
      if (animate && !drag.current.on) sp.rotation.y += delta * 0.12
    }
    if (drag.current.click) {
      drag.current.click = false
      if (!turn.current) startTurn()
    }
    if (turn.current && pivot.current) {
      turn.current.t += (delta * 1000) / TURN_MS
      const angle = easeInOut(Math.min(turn.current.t, 1)) * (Math.PI / 2) * turn.current.dir
      pivot.current.rotation.set(0, 0, 0)
      pivot.current.rotation[turn.current.axis] = angle
      if (turn.current.t >= 1) finishTurn()
    } else if (animate) {
      wait.current -= delta * 1000
      if (wait.current <= 0) startTurn()
    }
  })

  return (
    <group ref={spinner} rotation={[0.5, -0.65, 0]}>
      <group ref={root}>
        {grids.map((g, i) => (
          <Cubie key={i} grid={g} />
        ))}
      </group>
      <group ref={pivot} />
    </group>
  )
}

export default function RubikCube({ animate }: { animate: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[5, 7, 4]} intensity={1.4} />
      <pointLight position={[-6, -2, 3]} intensity={20} color="#7c5cff" />
      <Scene animate={animate} />
    </Canvas>
  )
}
