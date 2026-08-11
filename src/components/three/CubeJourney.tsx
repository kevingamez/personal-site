'use client'

// The reference site's integration, adapted: ONE fixed canvas behind the
// page where the particle cube lives. Its existence is anchored to the
// CONTACT SECTION's position - it cannot appear during earlier sections,
// no matter the page length: fully transparent until the contact slot is
// within ~1.4 viewports, then it rides in from the right margin, assembles,
// docks into the slot, and disperses once you scroll past.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type Group, type Points } from 'three'
import { buildCube, COUNT, HALF } from './cube-geometry'
import { makeParticleMaterial } from './particle-material'

const CAM_Z = 10
const FOV = 40
function Scene() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const group = useRef<Group>(null)
  const points = useRef<Points>(null)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const { target, scatter, colors, stagger, sizes } = useMemo(buildCube, [])
  const material = useMemo(
    () => makeParticleMaterial({ opacity: 0.95, pixelRatio: Math.min(gl.getPixelRatio(), 1.75) }),
    [gl]
  )
  const positions = useMemo(() => scatter.slice(), [scatter])
  const state = useRef({ assemble: 0.15, alpha: 0.8, scrollVel: 0, lastScroll: 0 })
  const drag = useRef({ on: false, vx: 0, vy: 0, px: 0, py: 0 })
  const cursor = useRef({ x: 9e9, y: 9e9 })
  const local = useMemo(() => new Vector3(), [])

  // World size of one viewport at the z=0 plane.
  const worldH = 2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)

  useEffect(() => {
    const toWorld = (sx: number, sy: number): [number, number] => {
      const aspect = window.innerWidth / window.innerHeight
      return [
        (sx / window.innerWidth - 0.5) * worldH * aspect,
        (0.5 - sy / window.innerHeight) * worldH,
      ]
    }
    const overCube = (sx: number, sy: number): boolean => {
      const g = group.current
      if (!g) return false
      const [wx, wy] = toWorld(sx, sy)
      const r = g.scale.x * HALF * 1.8
      return Math.abs(wx - g.position.x) < r && Math.abs(wy - g.position.y) < r
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !overCube(e.clientX, e.clientY)) return
      drag.current.on = true
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      document.documentElement.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      const [wx, wy] = toWorld(e.clientX, e.clientY)
      cursor.current.x = wx
      cursor.current.y = wy
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

  useFrame((_, delta) => {
    const g = group.current
    const geo = points.current?.geometry
    if (!g || !geo) return
    const vw = size.width
    const vh = size.height
    const aspect = vw / vh
    const scrollY = window.scrollY

    // Section-anchored visibility: everything derives from the live position
    // of the contact slot. approach: 0 (far below) -> 1 (slot centered).
    const slot = document.querySelector('.cube-stage')
    const rect = slot?.getBoundingClientRect()
    if (!rect || rect.height === 0) return
    const approach = MathUtils.clamp((vh * 1.4 - rect.top) / (vh * 0.9), 0, 1)
    const e = approach * approach * (3 - 2 * approach)
    const dockX = (rect.left + rect.width / 2) / vw
    const dockY = (rect.top + rect.height / 2) / vh
    const dockS = (rect.height / vh) * 0.86
    const xf = MathUtils.lerp(0.95, dockX, e)
    const yf = MathUtils.lerp(0.88, dockY, e)
    const sf = MathUtils.lerp(0.14, dockS, e)
    let assemble = MathUtils.lerp(0.25, 1, e)
    let alpha = e
    // Scrolled past the dock: disperse into dust and fade out.
    const past = MathUtils.clamp(((vh - rect.height) / 2 - rect.top) / (vh * 0.5), 0, 1)
    if (past > 0) {
      assemble = MathUtils.lerp(assemble, 0.05, past)
      alpha = MathUtils.lerp(alpha, 0, past)
    }

    // Nothing on screen: park the material at zero and skip the heavy loop.
    if (alpha < 0.01 && state.current.alpha < 0.01) {
      material.uniforms.uOpacity.value = 0
      return
    }

    // Damped follow so travel feels cinematic rather than glued to the wheel.
    const k = 1 - Math.exp(-6 * delta)
    g.position.x = MathUtils.lerp(g.position.x, (xf - 0.5) * worldH * aspect, k)
    g.position.y = MathUtils.lerp(g.position.y, (0.5 - yf) * worldH, k)
    const targetScale = (sf * worldH) / (2 * HALF * 1.15)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, targetScale, k))
    state.current.assemble = MathUtils.lerp(state.current.assemble, assemble, k)
    state.current.alpha = MathUtils.lerp(state.current.alpha, alpha, k)
    material.uniforms.uOpacity.value = state.current.alpha * 0.95

    // Spin: idle + a kick from scroll velocity + drag with inertia.
    const scrollVel = scrollY - state.current.lastScroll
    state.current.lastScroll = scrollY
    // Idle spin only when motion is allowed; drag and scroll kicks are
    // user-driven and always apply.
    g.rotation.y += drag.current.vy + (reduced ? 0 : delta * 0.14) + scrollVel * 0.0005
    g.rotation.x = MathUtils.clamp(g.rotation.x + drag.current.vx, -1.1, 1.1)
    drag.current.vx *= 0.93
    drag.current.vy *= 0.93

    // Assemble + cursor repulsion, in the figure's local space.
    local.set(cursor.current.x, cursor.current.y, 0)
    g.worldToLocal(local)
    const pos = geo.attributes.position.array as Float32Array
    const a = state.current.assemble
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3
      const t = MathUtils.clamp((a - stagger[i] * 0.45) / 0.55, 0, 1)
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

export default function CubeJourney() {
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
