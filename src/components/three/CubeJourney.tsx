'use client'

// The reference site's integration, adapted: ONE fixed canvas behind the
// page (z-index -1, so white cards occlude it) where the particle cube lives
// for the whole scroll. It starts as loose dust near the hero copy, travels
// across the margins while assembling as you scroll, docks precisely into
// the contact section's .cube-stage slot, and disperses past it. Cursor
// repulsion works everywhere; grabbing it inside its own bounds spins it.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type Group, type Points } from 'three'
import { buildCube, COUNT, HALF } from './cube-geometry'
import { makeParticleMaterial } from './particle-material'

const CAM_Z = 10
const FOV = 40
// Journey keyframes before the dock: [progress, xFrac, yFrac, viewportScale, assemble, alpha]
// The path crosses the page LOW (empty paper) and then climbs the right
// margin toward the dock, which also sits right - so the figure never
// travels across text at reading height.
const KEYS: [number, number, number, number, number, number][] = [
  [0.0, 0.1, 0.84, 0.24, 0.15, 0.7],
  [0.22, 0.94, 0.78, 0.18, 0.35, 0.75],
  [0.6, 0.95, 0.42, 0.2, 0.7, 0.85],
  [1.0, 0.5, 0.5, 0.5, 1.0, 1.0], // placeholder: replaced by the dock rect
]

function lerpKeys(p: number): [number, number, number, number, number] {
  const t = MathUtils.clamp(p, 0, 1)
  let a = KEYS[0]
  let b = KEYS[KEYS.length - 1]
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (t >= KEYS[i][0] && t <= KEYS[i + 1][0]) {
      a = KEYS[i]
      b = KEYS[i + 1]
      break
    }
  }
  const f = a[0] === b[0] ? 0 : (t - a[0]) / (b[0] - a[0])
  return [
    MathUtils.lerp(a[1], b[1], f),
    MathUtils.lerp(a[2], b[2], f),
    MathUtils.lerp(a[3], b[3], f),
    MathUtils.lerp(a[4], b[4], f),
    MathUtils.lerp(a[5], b[5], f),
  ]
}

function Scene() {
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

    // Scroll progress toward the dock: p=1 exactly when the contact slot is
    // centered in the viewport; robust to dynamic layout because the slot's
    // live rect feeds the equation every frame.
    const slot = document.querySelector('.cube-stage')
    const rect = slot?.getBoundingClientRect()
    let p = 0
    let dockTarget: [number, number, number, number, number] | null = null
    if (rect && rect.height > 0) {
      const dockScroll = scrollY + rect.top - (vh - rect.height) / 2
      p = dockScroll > 1 ? scrollY / dockScroll : 1
      dockTarget = [
        (rect.left + rect.width / 2) / vw,
        (rect.top + rect.height / 2) / vh,
        (rect.height / vh) * 0.86,
        1,
        1,
      ]
    }

    let [xf, yf, sf, assemble, alpha] = lerpKeys(p)
    if (dockTarget && p > 0.9) {
      // Blend the final approach into the live dock rect.
      const f = MathUtils.clamp((p - 0.9) / 0.1, 0, 1)
      xf = MathUtils.lerp(xf, dockTarget[0], f)
      yf = MathUtils.lerp(yf, dockTarget[1], f)
      sf = MathUtils.lerp(sf, dockTarget[2], f)
      assemble = MathUtils.lerp(assemble, 1, f)
      alpha = MathUtils.lerp(alpha, 1, f)
    }
    // Past the dock: drift up with the page and disperse into dust.
    if (p > 1.001) {
      const o = MathUtils.clamp((p - 1) * (vh / 220) * 0.5, 0, 1)
      assemble = MathUtils.lerp(assemble, 0.05, o)
      alpha = MathUtils.lerp(alpha, 0, o)
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
    g.rotation.y += drag.current.vy + delta * 0.14 + scrollVel * 0.0005
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
