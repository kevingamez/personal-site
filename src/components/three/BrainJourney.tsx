'use client'

// Scroll choreography for the brain, in the reference site's style: ONE
// fixed canvas behind the page, anchored to the contact slot. Transparent
// until the slot nears, then dust streams in from the right margin and
// assembles into the brain (frontal pole first) while it docks. Formed, it
// fires waves and reacts to touch and drag; scrolled past, it disperses.

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

const CAM_Z = 10
const FOV = 40
const BRAIN_R = 1.5 // local half-extent used to fit the dock slot

function Scene() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const { base, phase, edges, origins, sizes, baseColors, scatter, stagger } = useMemo(
    buildVolume,
    []
  )
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const positions = useMemo(() => scatter.slice(), [scatter])
  const nodeColors = useMemo(() => baseColors.slice(), [baseColors])
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
  const st = useRef({ assemble: 0.1, alpha: 0, lastScroll: 0, spin: 0 })
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
    const overBrain = (sx: number, sy: number): boolean => {
      const g = group.current
      if (!g) return false
      const [wx, wy] = toWorld(sx, sy)
      const r = g.scale.x * BRAIN_R * 1.8
      return Math.abs(wx - g.position.x) < r && Math.abs(wy - g.position.y) < r
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !overBrain(e.clientX, e.clientY)) return
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
    const aspect = vw / vh

    // Section-anchored: everything derives from the live contact-slot rect.
    const rect = document.querySelector('.cube-stage')?.getBoundingClientRect()
    if (!rect || rect.height === 0) return
    const approach = MathUtils.clamp((vh * 1.4 - rect.top) / (vh * 0.9), 0, 1)
    const e = approach * approach * (3 - 2 * approach)
    const xf = MathUtils.lerp(0.95, (rect.left + rect.width / 2) / vw, e)
    const yf = MathUtils.lerp(0.88, (rect.top + rect.height / 2) / vh, e)
    const sf = MathUtils.lerp(0.14, (rect.height / vh) * 1.05, e)
    let assemble = MathUtils.lerp(0.2, 1, e)
    let alpha = Math.min(1, e * 1.6)
    const past = MathUtils.clamp(((vh - rect.height) / 2 - rect.top) / (vh * 0.5), 0, 1)
    if (past > 0) {
      assemble = MathUtils.lerp(assemble, 0.04, past)
      alpha = MathUtils.lerp(alpha, 0, past)
    }
    if (alpha < 0.01 && st.current.alpha < 0.01) {
      material.uniforms.uOpacity.value = 0
      lineMat.opacity = 0
      return
    }

    // Damped travel toward the dock; scale fits the slot.
    const k = 1 - Math.exp(-6 * delta)
    g.position.x = MathUtils.lerp(g.position.x, (xf - 0.5) * worldH * aspect, k)
    g.position.y = MathUtils.lerp(g.position.y, (0.5 - yf) * worldH, k)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, (sf * worldH) / (2 * BRAIN_R), k))
    // Particle pixel size follows the figure's scale so the docked brain
    // keeps the fullscreen render's density; flying dust stays visible.
    material.uniforms.uPx.value = Math.min(gl.getPixelRatio(), 1.75) * Math.max(0.6, g.scale.x)
    st.current.assemble = MathUtils.lerp(st.current.assemble, assemble, k)
    st.current.alpha = MathUtils.lerp(st.current.alpha, alpha, k)
    material.uniforms.uOpacity.value = st.current.alpha * 0.95
    const es = st.current.assemble
    // Waves and synapses ignite only once the figure has mostly formed.
    const fw = MathUtils.clamp((es - 0.72) / 0.28, 0, 1)
    lineMat.opacity = st.current.alpha * fw * 0.07

    // Spin: the brain sways around its legible profile view instead of
    // drifting freely; drag and scroll kicks add offset that relaxes back.
    const scrollVel = window.scrollY - st.current.lastScroll
    st.current.lastScroll = window.scrollY
    st.current.spin += drag.current.vy + scrollVel * 0.0004
    st.current.spin *= 0.985
    g.rotation.y = 1.35 + (reduced ? 0 : Math.sin(t * 0.12) * 0.22) + st.current.spin
    const tiltX = 0.08 + MathUtils.clamp(-cursor.current.ny * 0.2, -0.3, 0.3) * fw
    g.rotation.x = MathUtils.lerp(g.rotation.x + drag.current.vx, tiltX, 0.02)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Cursor into local space; grazing the formed body re-fires the ripple.
    local.set(cursor.current.x, cursor.current.y, 0)
    g.worldToLocal(local)
    if (fw > 0.5 && local.length() < 2.3) {
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
    for (let i = 0; i < NODES; i++) {
      const j = i * 3
      // Assembly: each neuron streams from its dust position on its own cue.
      const a = MathUtils.clamp((es - stagger[i] * 0.45) / 0.55, 0, 1)
      const b = 0.035 * a
      let tx = MathUtils.lerp(scatter[j], base[j], a) + Math.sin(t * 0.6 + phase[i]) * b
      let ty =
        MathUtils.lerp(scatter[j + 1], base[j + 1], a) + Math.cos(t * 0.5 + phase[i] * 1.3) * b
      let tz =
        MathUtils.lerp(scatter[j + 2], base[j + 2], a) + Math.sin(t * 0.7 + phase[i] * 0.7) * b
      const rx = tx - local.x
      const ry = ty - local.y
      const rz = tz - local.z
      const rd2 = rx * rx + ry * ry + rz * rz
      if (fw > 0 && rd2 < 0.6) {
        const rd = Math.sqrt(rd2) || 0.001
        const f = ((0.77 - rd) / 0.77) * 0.5 * fw
        tx += (rx / rd) * f
        ty += (ry / rd) * f
        tz += (rz / rd) * f
      }
      pos[j] += (tx - pos[j]) * 0.12
      pos[j + 1] += (ty - pos[j + 1]) * 0.12
      pos[j + 2] += (tz - pos[j + 2]) * 0.12
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
      heat *= fw
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

    // Synapses follow their displaced endpoints and inherit their heat.
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
