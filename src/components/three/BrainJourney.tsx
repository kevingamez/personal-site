'use client'

// The full-page dust journey on the site's own paper theme: ONE fixed
// canvas whose swarm is alive from the hero on. It opens as the brain
// beside the headline, melts into traveling dust as you scroll, half
// condenses at Experience, and finally resolves into the CUBE docked in
// the contact section - the page opens on the mind and closes on the
// object. Keyframes live in journey-timeline.ts, the per-grain pass in
// journey-particles.ts.

import { useMemo, useRef } from 'react'
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
import { GRAIN, makeParticleMaterial } from './particle-material'
import { AUTO_WAVE_S, TOUCH_WAVE_SPEED } from './net-geometry'
import { buildField } from './journey-field'
import { resolvePose } from './journey-timeline'
import { useJourneyPointer } from './journey-pointer'
import { updateParticles } from './journey-particles'
import { FACE_NORMALS } from './cube-figure'
import { PulseLayer } from './journey-pulses'

const CAM_Z = 10
const FOV = 40
const R = 1.5 // local half-extent of the brain, used to fit poses
// The cube does not fit the brain's box. Its half-side is 1.3, but at the
// three-quarter angle it keeps turning through, a corner swings out to ~1.86 -
// so fitting it with R rendered it ~25% oversized, spilling out of its dock
// (and off the sides on phones). Fit each figure with its own radius.
const R_CUBE = 1.87
// Reference viewport height for grain sizing. gl_PointSize is driven by
// g.scale.x, a WORLD-space scale, and the world is exactly one viewport tall -
// so the same on-screen figure yields a smaller scale the taller the window
// gets, and the grains shrink as the figure grows. On a 1440px-tall display
// the docked cube laid down ~40% of the ink it does on a 900px laptop and read
// as a ghost. Normalizing by this height fixes tall screens and leaves the
// 900px laptop case exactly as it was.
const REF_VH = 900
const REST_BRAIN = 1.5 + Math.PI // legible profile, flipped 180deg
const REST_CUBE = REST_BRAIN - 0.72 // three-quarter view of the cube

function Scene() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const { brain, dustCol, cube } = useMemo(() => buildField(), [])
  const { count, base, phase, edges, origins, sizes, baseColors, scatter, stagger } = brain
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const positions = useMemo(() => scatter.slice(), [scatter])
  const nodeColors = useMemo(() => dustCol.slice(), [dustCol])
  const grainSizes = useMemo(() => sizes.slice(), [sizes])
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
  const pulses = useMemo(() => new PulseLayer(edges, count), [edges, count])
  const pulseMat = useMemo(
    () => makeParticleMaterial({ opacity: 0.9, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const st = useRef({ a: 0, fB: 0, fC: 0, waves: 0, rot: REST_BRAIN, spin: 0, lastScroll: 0 })
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const cursor = useRef({ x: 9e9, y: 9e9, nx: 0, ny: 0 })
  const touch = useRef({ ox: 0, oy: 0, oz: 0, start: -99 })
  const autoWave = useRef({ cycle: -1, ox: 0, oy: 0, oz: 0 })
  const local = useMemo(() => new Vector3(), [])
  const faceVis = useMemo(() => new Float32Array(6), [])
  const normal = useMemo(() => new Vector3(), [])
  const scratch = useMemo(() => new Color(), [])
  const worldH = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)

  useJourneyPointer(worldH, R, group, drag, cursor)

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
    s.fC = MathUtils.lerp(s.fC, pose.fC, k)
    s.waves = MathUtils.lerp(s.waves, pose.waves, k)
    material.uniforms.uOpacity.value = s.a * 0.95
    if (s.a < 0.01 && pose.a < 0.01) {
      lineMat.opacity = 0
      return
    }
    const par = s.fB * 0.18
    g.position.x = MathUtils.lerp(
      g.position.x,
      (pose.x - 0.5) * worldH * (vw / vh) + cursor.current.nx * par,
      k
    )
    g.position.y = MathUtils.lerp(
      g.position.y,
      (0.5 - pose.y) * worldH + cursor.current.ny * par * 0.6,
      k
    )
    const fitR = MathUtils.lerp(R, R_CUBE, s.fC)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, (pose.s * worldH) / (2 * fitR), k))
    const px = Math.min(gl.getPixelRatio(), 1.75) * Math.max(0.55, (g.scale.x * vh) / REF_VH)
    material.uniforms.uPx.value = px
    pulseMat.uniforms.uPx.value = px
    pulseMat.uniforms.uOpacity.value = s.a * s.fB * 0.9
    // Tied to GRAIN: the grains used to cover this mesh, so shrinking them
    // alone exposed the edges and the figure flipped to a wireframe.
    lineMat.opacity = s.a * s.fB * 0.13 * GRAIN * GRAIN

    // Rotation: slow tumble as dust, settling by the shortest path into
    // the legible profile as the brain forms; drag and scroll kicks decay.
    const scrollVel = window.scrollY - s.lastScroll
    s.lastScroll = window.scrollY
    s.spin += drag.current.vy + scrollVel * 0.0004
    s.spin *= 0.985
    const formed = Math.max(s.fB, s.fC)
    s.rot += reduced ? 0 : delta * 0.2 * (1 - formed)
    const rest = s.fC > s.fB ? REST_CUBE : REST_BRAIN
    const wrapped = rest + Math.round((s.rot - rest) / (Math.PI * 2)) * Math.PI * 2
    s.rot = MathUtils.lerp(s.rot, wrapped, 0.03 * formed)
    // The cube keeps turning slowly once docked - it is an object to look
    // around, not a portrait to hold still.
    s.rot += reduced ? 0 : delta * 0.16 * s.fC
    g.rotation.y = s.rot + (reduced ? 0 : Math.sin(t * 0.12) * 0.12 * s.fB) + s.spin
    const tiltX = 0.08 + 0.28 * s.fC + MathUtils.clamp(-cursor.current.ny * 0.2, -0.3, 0.3) * s.fB
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
        // The signal cascade starts at the neuron under the cursor.
        let ni = 0
        let nd = Infinity
        for (let i = 0; i < count; i++) {
          const ddx = base[i * 3] - local.x
          const ddy = base[i * 3 + 1] - local.y
          const d2 = ddx * ddx + ddy * ddy
          if (d2 < nd) {
            nd = d2
            ni = i
          }
        }
        pulses.spawnAt(ni, 30)
      }
    }
    const tc = touch.current
    const touchFront = (t - touch.current.start) * TOUCH_WAVE_SPEED
    const cycle = Math.floor(t / AUTO_WAVE_S)
    if (autoWave.current.cycle !== cycle) {
      const o = origins[cycle % origins.length]
      autoWave.current = { cycle, ox: base[o * 3], oy: base[o * 3 + 1], oz: base[o * 3 + 2] }
    }
    const autoFront = ((t % AUTO_WAVE_S) / AUTO_WAVE_S) * 4.6

    // Which cube faces point at the camera this frame - the pass fades
    // the rest so only three faces read, like a real cube.
    if (s.fC > 0.01) {
      for (let f = 0; f < 6; f++) {
        const [nx, ny, nz] = FACE_NORMALS[f]
        normal.set(nx, ny, nz).applyEuler(g.rotation)
        faceVis[f] = MathUtils.clamp(normal.z * 4, 0, 1)
      }
    }
    const pos = geo.attributes.position.array as Float32Array
    const col = geo.attributes.color.array as Float32Array
    const gsz = geo.attributes.aSize.array as Float32Array
    // Neural pulses ride the synapses while the brain is formed.
    pulses.update(delta, reduced ? 0 : s.fB * s.a, pos)
    updateParticles({
      count,
      // Freezing the clock and the wave amplitude is what actually stills the
      // dust. Gating rotation alone left every grain drifting, which is the
      // motion a reduced-motion request is asking us to stop.
      t: reduced ? 0 : t,
      fB: s.fB,
      fC: s.fC,
      waves: reduced ? 0 : s.waves,
      local,
      scratch,
      base,
      scatter,
      stagger,
      phase,
      cubePos: cube.pos,
      dustCol,
      brainCol: baseColors,
      cubeCol: cube.col,
      brainSize: sizes,
      cubeSize: cube.size,
      cubeKind: cube.kind,
      cubeFace: cube.faceOf,
      faceVis,
      pos,
      col,
      size: gsz,
      flash: pulses.flash,
      wave: { ...autoWave.current, front: autoFront },
      touch: { ox: tc.ox, oy: tc.oy, oz: tc.oz, front: touchFront },
    })
    geo.attributes.aSize.needsUpdate = true
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true

    // Synapses render only while the brain is formed enough to read.
    if (lineMat.opacity > 0.02) {
      const lpos = lineGeo.attributes.position.array as Float32Array
      const lcol = lineGeo.attributes.color.array as Float32Array
      edges.forEach(([a2, b2], i2) => {
        const ea = i2 * 6
        // Collapse stretched segments (an endpoint still out in the dust)
        // so no long streaks cross the scene while shapes form.
        const ddx = pos[a2 * 3] - pos[b2 * 3]
        const ddy = pos[a2 * 3 + 1] - pos[b2 * 3 + 1]
        const ddz = pos[a2 * 3 + 2] - pos[b2 * 3 + 2]
        const cut = ddx * ddx + ddy * ddy + ddz * ddz > 0.36
        for (const [off, n] of [
          [0, a2],
          [3, b2],
        ] as const) {
          const m = cut ? a2 : n
          lpos[ea + off] = pos[m * 3]
          lpos[ea + off + 1] = pos[m * 3 + 1]
          lpos[ea + off + 2] = pos[m * 3 + 2]
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
    <group ref={group} rotation={[0.08, REST_BRAIN, 0]}>
      <lineSegments geometry={lineGeo} material={lineMat} />
      <points geometry={pulses.geometry}>
        <primitive object={pulseMat} attach="material" />
      </points>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[grainSizes, 1]} />
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
