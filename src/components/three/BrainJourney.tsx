'use client'

// The full-page dust journey, the reference site's effect: ONE fixed
// canvas whose particle swarm is alive from the hero on. Scrolling walks
// it through section keyframes - ambient dust beside the hero, the brain
// forming next to About, melting to dust, half-condensing at Experience,
// then re-forming and docking into the contact slot, where touch fires
// neural waves and drag spins it. Past the dock it melts out. See
// journey-timeline.ts for the keyframes.

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
import { AUTO_WAVE_S, INK, NODES, TOUCH_WAVE_SPEED, VIOLET, WAVE_BAND } from './net-geometry'
import { buildField } from './journey-field'
import { resolvePose } from './journey-timeline'

const CAM_Z = 10
const FOV = 40
const R = 1.5 // local half-extent used to fit poses

function Scene() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const { brain, dustCol } = useMemo(buildField, [])
  const { base, phase, edges, origins, sizes, baseColors, scatter, stagger } = brain
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const positions = useMemo(() => scatter.slice(), [scatter])
  const nodeColors = useMemo(() => dustCol.slice(), [dustCol])
  const lineGeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(edges.length * 6), 3))
    g.setAttribute('color', new BufferAttribute(new Float32Array(edges.length * 6), 3))
    return g
  }, [edges])
  const lineMat = useMemo(
    () => new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }),
    []
  )
  const st = useRef({ a: 0, fB: 0, waves: 0, rot: 1.35, spin: 0, lastScroll: 0 })
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const cursor = useRef({ x: 9e9, y: 9e9, ny: 0 })
  const touch = useRef({ ox: 0, oy: 0, oz: 0, start: -99 })
  const autoWave = useRef({ cycle: -1, ox: 0, oy: 0, oz: 0 })
  const local = useMemo(() => new Vector3(), [])
  const scratch = useMemo(() => new Color(), [])
  const worldH = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)

  useEffect(() => {
    const toWorld = (sx: number, sy: number): [number, number] => {
      const aspect = window.innerWidth / window.innerHeight
      return [
        (sx / window.innerWidth - 0.5) * worldH * aspect,
        (0.5 - sy / window.innerHeight) * worldH,
      ]
    }
    const overFigure = (sx: number, sy: number): boolean => {
      const g = group.current
      if (!g) return false
      const [wx, wy] = toWorld(sx, sy)
      const r = g.scale.x * R * 1.8
      return Math.abs(wx - g.position.x) < r && Math.abs(wy - g.position.y) < r
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !overFigure(e.clientX, e.clientY)) return
      drag.current.on = true
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      document.documentElement.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      const [wx, wy] = toWorld(e.clientX, e.clientY)
      cursor.current.x = wx
      cursor.current.y = wy
      cursor.current.ny = -(e.clientY / window.innerHeight) * 2 + 1
      if (!drag.current.on) return
      drag.current.vy = (e.clientX - drag.current.px) * 0.005
      drag.current.vx = (e.clientY - drag.current.py) * 0.005
      drag.current.px = e.clientX
      drag.current.py = e.clientY
    }
    const up = () => {
      if (!drag.current.on) return
      drag.current.on = false
      document.documentElement.style.cursor = ''
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [worldH])

  useFrame((state, delta) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    const t = state.clock.elapsedTime
    const vw = size.width
    const vh = size.height
    const pose = resolvePose(window.scrollY, vw, vh)
    if (!pose) return

    const k = 1 - Math.exp(-6 * delta)
    const s = st.current
    s.a = MathUtils.lerp(s.a, pose.a, k)
    s.fB = MathUtils.lerp(s.fB, pose.fB, k)
    s.waves = MathUtils.lerp(s.waves, pose.waves, k)
    material.uniforms.uOpacity.value = s.a * 0.95
    if (s.a < 0.01 && pose.a < 0.01) {
      lineMat.opacity = 0
      return
    }
    g.position.x = MathUtils.lerp(g.position.x, (pose.x - 0.5) * worldH * (vw / vh), k)
    g.position.y = MathUtils.lerp(g.position.y, (0.5 - pose.y) * worldH, k)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, (pose.s * worldH) / (2 * R), k))
    material.uniforms.uPx.value = Math.min(gl.getPixelRatio(), 1.75) * Math.max(0.55, g.scale.x)
    lineMat.opacity = s.a * s.fB * 0.1

    // Rotation: a slow tumble while it is dust or cube, settling into the
    // brain's legible profile as it forms; drag and scroll kicks decay.
    const scrollVel = window.scrollY - s.lastScroll
    s.lastScroll = window.scrollY
    s.spin += drag.current.vy + scrollVel * 0.0004
    s.spin *= 0.985
    // Tumble while dust; settle by the shortest path into the brain's
    // legible profile pose as it forms.
    s.rot += reduced ? 0 : delta * 0.2 * (1 - s.fB)
    const wrapped = 1.35 + Math.round((s.rot - 1.35) / (Math.PI * 2)) * Math.PI * 2
    s.rot = MathUtils.lerp(s.rot, wrapped, 0.03 * s.fB)
    g.rotation.y = s.rot + (reduced ? 0 : Math.sin(t * 0.12) * 0.22 * s.fB) + s.spin
    const tiltX = 0.08 + MathUtils.clamp(-cursor.current.ny * 0.2, -0.3, 0.3) * s.fB
    g.rotation.x = MathUtils.lerp(g.rotation.x + drag.current.vx, tiltX, 0.02)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Cursor in local space; grazing the formed brain re-fires the ripple.
    local.set(cursor.current.x, cursor.current.y, 0)
    g.worldToLocal(local)
    if (s.fB > 0.7 && local.length() < 2.3) {
      const dx = local.x - touch.current.ox
      const dy = local.y - touch.current.oy
      if (dx * dx + dy * dy > 0.5 || t - touch.current.start > 1.6) {
        touch.current = { ox: local.x, oy: local.y, oz: 0, start: t }
      }
    }
    const touchFront = (t - touch.current.start) * TOUCH_WAVE_SPEED
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
    const doWaves = s.waves > 0.02
    for (let i = 0; i < NODES; i++) {
      const j = i * 3
      // Per-particle formation staggers so shapes stream, not snap.
      const fb = MathUtils.clamp((s.fB - stagger[i] * 0.35) / 0.65, 0, 1)
      const fd = 1 - fb
      const wob = 0.03 + 0.3 * fd
      let tx = scatter[j] * 0.75 * fd + base[j] * fb + Math.sin(t * 0.5 + phase[i]) * wob
      let ty =
        scatter[j + 1] * 0.75 * fd + base[j + 1] * fb + Math.cos(t * 0.4 + phase[i] * 1.3) * wob
      let tz =
        scatter[j + 2] * 0.75 * fd + base[j + 2] * fb + Math.sin(t * 0.6 + phase[i] * 0.7) * wob
      const rx = tx - local.x
      const ry = ty - local.y
      const rz = tz - local.z
      const rd2 = rx * rx + ry * ry + rz * rz
      if (rd2 < 0.6) {
        const rd = Math.sqrt(rd2) || 0.001
        const f = ((0.77 - rd) / 0.77) * (0.2 + 0.3 * fb)
        tx += (rx / rd) * f
        ty += (ry / rd) * f
        tz += (rz / rd) * f
      }
      pos[j] += (tx - pos[j]) * 0.1
      pos[j + 1] += (ty - pos[j + 1]) * 0.1
      pos[j + 2] += (tz - pos[j + 2]) * 0.1
      let heat = 0
      if (doWaves && fb > 0.3) {
        const da = Math.sqrt(
          (base[j] - aw.ox) ** 2 + (base[j + 1] - aw.oy) ** 2 + (base[j + 2] - aw.oz) ** 2
        )
        heat = MathUtils.clamp(1 - Math.abs(da - autoFront) / WAVE_BAND, 0, 1) * 0.8
        if (touchFront < 5) {
          const dt = Math.sqrt(
            (base[j] - tc.ox) ** 2 + (base[j + 1] - tc.oy) ** 2 + (base[j + 2] - tc.oz) ** 2
          )
          heat = Math.max(heat, MathUtils.clamp(1 - Math.abs(dt - touchFront) / WAVE_BAND, 0, 1))
        }
        heat *= s.waves * fb
      }
      scratch
        .setRGB(
          dustCol[j] * fd + baseColors[j] * fb,
          dustCol[j + 1] * fd + baseColors[j + 1] * fb,
          dustCol[j + 2] * fd + baseColors[j + 2] * fb
        )
        .lerp(INK, Math.min(1, heat * 1.4))
        .lerp(VIOLET, heat * 0.85)
      col[j] = scratch.r
      col[j + 1] = scratch.g
      col[j + 2] = scratch.b
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true

    // Synapses render only while the brain is formed enough to read.
    if (lineMat.opacity > 0.02) {
      const lpos = lineGeo.attributes.position.array as Float32Array
      const lcol = lineGeo.attributes.color.array as Float32Array
      edges.forEach(([a2, b2], i2) => {
        const ea = i2 * 6
        for (const [off, n] of [
          [0, a2],
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
    }
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

export default function BrainJourney() {
  return (
    <div className="cube-journey" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        frameloop="always"
      >
        <Scene />
      </Canvas>
    </div>
  )
}
