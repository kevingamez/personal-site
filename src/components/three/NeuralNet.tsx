'use client'

// The neural figure, built and behaving like the reference brain:
// a two-lobed volumetric body of ~2800 neuron-particles webbed with short
// synapses. It breathes, tilts subtly toward the cursor, and - the core
// interaction - TOUCHING it stimulates it: ripples fire from wherever the
// cursor grazes the body, neurons flash ink-to-violet as fronts pass, and
// the ones under your hand shy away elastically. Drag spins it.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MathUtils,
  Vector3,
  type Group,
  type Points,
} from 'three'
import { makeParticleMaterial } from './particle-material'
import {
  AUTO_WAVE_S,
  buildVolume,
  INK,
  NODES,
  TOUCH_WAVE_SPEED,
  VIOLET,
  WAVE_BAND,
} from './net-geometry'

function Scene() {
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const { base, phase, edges, origins, sizes, baseColors } = useMemo(buildVolume, [])
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const positions = useMemo(() => base.slice(), [base])
  const nodeColors = useMemo(() => baseColors.slice(), [baseColors])
  const lineGeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(edges.length * 6), 3))
    g.setAttribute('color', new BufferAttribute(new Float32Array(edges.length * 6), 3))
    return g
  }, [edges])
  const lineMat = useMemo(
    () => new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.13 }),
    []
  )
  const drag = useRef({ on: false, moved: 0, vx: 0, vy: 0, px: 0, py: 0 })
  const cursor = useRef({ x: 9e9, y: 9e9, nx: 0, ny: 0 })
  const touch = useRef({ ox: 0, oy: 0, oz: 0, start: -99 })
  const autoWave = useRef({ cycle: -1, ox: 0, oy: 0, oz: 0 })
  const spin = useRef(0)
  const local = useMemo(() => new Vector3(), [])
  const scratch = useMemo(() => new Color(), [])

  useEffect(() => {
    const el = gl.domElement
    el.style.cursor = 'grab'
    const v = new Vector3()
    const down = (e: PointerEvent) => {
      drag.current.on = true
      drag.current.moved = 0
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      cursor.current.nx = ((e.clientX - r.left) / r.width) * 2 - 1
      cursor.current.ny = -((e.clientY - r.top) / r.height) * 2 + 1
      v.set(cursor.current.nx, cursor.current.ny, 0.5)
      v.unproject(camera).sub(camera.position).normalize()
      const t = -camera.position.z / v.z
      cursor.current.x = camera.position.x + v.x * t
      cursor.current.y = camera.position.y + v.y * t
      if (!drag.current.on) return
      drag.current.moved += Math.abs(e.clientX - drag.current.px)
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
  }, [gl, camera])

  useFrame((state) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    const t = state.clock.elapsedTime

    // Spin: sway around the legible profile view; drag adds an offset
    // that slowly relaxes back, like the reference brain settling.
    spin.current += drag.current.vy
    spin.current *= 0.985
    g.rotation.y = 1.35 + Math.sin(t * 0.12) * 0.22 + spin.current
    const tiltX = MathUtils.clamp(-cursor.current.ny * 0.22, -0.35, 0.35)
    g.rotation.x = MathUtils.lerp(g.rotation.x + drag.current.vx, tiltX, 0.02)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Cursor into local space; touching the body re-fires the touch ripple.
    local.set(cursor.current.x, cursor.current.y, 0)
    g.worldToLocal(local)
    const withinBody = local.length() < 2.3
    if (withinBody) {
      const dx = local.x - touch.current.ox
      const dy = local.y - touch.current.oy
      if (dx * dx + dy * dy > 0.5 || t - touch.current.start > 1.6) {
        touch.current = { ox: local.x, oy: local.y, oz: 0, start: t }
      }
    }
    const touchFront = (t - touch.current.start) * TOUCH_WAVE_SPEED

    // Automatic wave: a new origin fires every cycle.
    const cycle = Math.floor(t / AUTO_WAVE_S)
    if (autoWave.current.cycle !== cycle) {
      const o = origins[cycle % origins.length]
      autoWave.current = { cycle, ox: base[o * 3], oy: base[o * 3 + 1], oz: base[o * 3 + 2] }
    }
    const autoFront = ((t % AUTO_WAVE_S) / AUTO_WAVE_S) * 4.6

    const pos = geo.attributes.position.array as Float32Array
    const col = geo.attributes.color.array as Float32Array
    const aw = autoWave.current
    const tc = touch.current
    for (let i = 0; i < NODES; i++) {
      const j = i * 3
      // Breathing: each neuron drifts on its own tiny orbit.
      const b = 0.035
      let tx = base[j] + Math.sin(t * 0.6 + phase[i]) * b
      let ty = base[j + 1] + Math.cos(t * 0.5 + phase[i] * 1.3) * b
      let tz = base[j + 2] + Math.sin(t * 0.7 + phase[i] * 0.7) * b
      // Neurons shy away from the cursor within a small radius.
      const rx = tx - local.x
      const ry = ty - local.y
      const rz = tz - local.z
      const rd2 = rx * rx + ry * ry + rz * rz
      if (rd2 < 0.6) {
        const rd = Math.sqrt(rd2) || 0.001
        const f = ((0.77 - rd) / 0.77) * 0.5
        tx += (rx / rd) * f
        ty += (ry / rd) * f
        tz += (rz / rd) * f
      }
      pos[j] += (tx - pos[j]) * 0.12
      pos[j + 1] += (ty - pos[j + 1]) * 0.12
      pos[j + 2] += (tz - pos[j + 2]) * 0.12
      // Heat: the stronger of the automatic wave and your touch ripple.
      const da = Math.sqrt(
        (base[j] - aw.ox) ** 2 + (base[j + 1] - aw.oy) ** 2 + (base[j + 2] - aw.oz) ** 2
      )
      let heat = MathUtils.clamp(1 - Math.abs(da - autoFront) / WAVE_BAND, 0, 1) * 0.8
      if (touchFront < 5) {
        const dt = Math.sqrt(
          (base[j] - tc.ox) ** 2 + (base[j + 1] - tc.oy) ** 2 + (base[j + 2] - tc.oz) ** 2
        )
        heat = Math.max(heat, MathUtils.clamp(1 - Math.abs(dt - touchFront) / WAVE_BAND, 0, 1))
      }
      scratch
        .setRGB(baseColors[j], baseColors[j + 1], baseColors[j + 2])
        .lerp(INK, Math.min(1, heat * 1.4))
        .lerp(VIOLET, heat * 0.85)
      col[j] = scratch.r
      col[j + 1] = scratch.g
      col[j + 2] = scratch.b
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true

    // Synapses follow their (displaced) endpoints and inherit their heat.
    const lpos = lineGeo.attributes.position.array as Float32Array
    const lcol = lineGeo.attributes.color.array as Float32Array
    edges.forEach(([a, b2], e) => {
      const ea = e * 6
      for (const [off, n] of [
        [0, a],
        [3, b2],
      ] as const) {
        lpos[ea + off] = pos[n * 3]
        lpos[ea + off + 1] = pos[n * 3 + 1]
        lpos[ea + off + 2] = pos[n * 3 + 2]
        lcol[ea + off] = col[n * 3]
        lcol[ea + off + 1] = col[n * 3 + 1]
        lcol[ea + off + 2] = col[n * 3 + 2]
      }
    })
    lineGeo.attributes.position.needsUpdate = true
    lineGeo.attributes.color.needsUpdate = true
  })

  return (
    <group ref={group} rotation={[0.08, 1.35, 0]}>
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

export default function NeuralNet() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.1, 4.9], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop="always"
    >
      <Scene />
    </Canvas>
  )
}
