// "The parts a CV leaves out": a swarm of photographic cards around the viewer.
// Drag to turn the swarm, arrows to bring a card over, click to hold one.
// The scene lives inside a framed box and can go fullscreen.

import { Euler, MathUtils, Quaternion, Raycaster, Vector2, Vector3, WebGLRenderer } from 'three'
import { MOMENTS } from '@/data/moments'
import { build } from './moments-scene'
import { wireInput } from './moments-input'

export function initMoments(): void {
  const box = document.getElementById('moments')
  const host = document.getElementById('moments-stage')
  if (!box || !host) return
  const root: HTMLElement = box

  const lang = document.documentElement.lang === 'es' ? 'es' : 'en'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const size = (): { w: number; h: number } => ({
    w: host.clientWidth || 1,
    h: host.clientHeight || 1,
  })

  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(size().w, size().h)
  host.appendChild(renderer.domElement)
  renderer.domElement.tabIndex = 0

  const { scene, camera, swarm, cards, meshes, heldMats, frontMats, bigFor, dispose } = build(
    size().w,
    size().h
  )

  const panel = document.getElementById('moments-panel')
  const pTitle = document.getElementById('moments-title')
  const pMeta = document.getElementById('moments-meta')
  const pDesc = document.getElementById('moments-desc')

  let picked = -1
  let hovered = -1
  let focusIdx = -1
  let hasHover = false
  let held = -1
  let orbT = 0
  let spread = 1
  let fogD = 0.062
  let pickT = 0
  let navTX = 0
  let navTY = 0
  let seekT = 0
  const nav = { x: 0, y: 0, vx: 0, vy: 0, seeking: false, dragging: false, dt: 1 / 60 }
  const lean = { x: 0, y: 0 }

  const pointer = new Vector2(0, 0)
  const hit = new Vector2()
  const ray = new Raycaster()
  const v = new Vector3()
  const qT = new Quaternion()
  const qF = new Quaternion()
  const qS = new Quaternion()
  const FORWARD = new Vector3(0, 0, -1)
  const navE = new Euler(0, 0, 0, 'YXZ')
  const UP = new Vector3(0, 1, 0)
  const clamp = MathUtils.clamp
  // Where the held card parks. A portrait box has a much narrower horizontal
  // field, so the wide-box values filled the whole frame and the readout ended
  // up written across the photograph. Portrait sends it further back, smaller,
  // and higher, which is what clears room for the text underneath.
  const front = new Vector3()
  const heldPose = (): number => {
    const { w, h } = size()
    if (h > w * 0.95) {
      front.set(0, 0.66, -3.9)
      return 1.15
    }
    front.set(0, 0.05, -2.55)
    return 1.45
  }
  const damp = (k: number, dt: number): number => 1 - Math.pow(1 - k, dt * 60)

  const radPerPx = (): number => {
    const vFov = (camera.fov * Math.PI) / 180
    return (2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)) / (size().w || 1)
  }

  function hitAt(cx: number, cy: number): number {
    const r = renderer.domElement.getBoundingClientRect()
    hit.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(hit, camera)
    const h = ray.intersectObjects(meshes, false)[0]
    return h ? (h.object.userData.i as number) : -1
  }

  // Turn the swarm until card i sits on the camera axis, so the arrow keys are
  // real navigation rather than a cursor moving over things you cannot see.
  function bringToFront(i: number): void {
    if (i < 0) return
    cards[i].mesh.getWorldPosition(v)
    if (v.lengthSq() < 1e-6) return
    qF.setFromUnitVectors(v.normalize(), FORWARD)
    qS.setFromEuler(navE.set(nav.x, nav.y, 0, 'YXZ'))
    navE.setFromQuaternion(qF.multiply(qS), 'YXZ')
    navTX = clamp(navE.x, -0.8, 0.8)
    navTY = navE.y
    nav.seeking = true
    seekT = 0
    nav.vx = nav.vy = 0
  }

  function pick(i: number): void {
    if (i < 0) return
    picked = i
    held = cards[i].photo
    bigFor(held)
    cards[i].mesh.material = [
      heldMats[held],
      ...(cards[i].mesh.material as never[]).slice(1),
    ] as never
    const m = MOMENTS[held]
    if (pTitle) pTitle.textContent = m[lang].title
    if (pMeta) pMeta.textContent = m.place
    if (pDesc) pDesc.textContent = m[lang].desc
    panel?.classList.add('on')
    root.classList.add('is-held')
  }

  function release(): void {
    if (picked < 0) return
    cards[picked].mesh.material = [
      frontMats[held],
      ...(cards[picked].mesh.material as never[]).slice(1),
    ] as never
    cards[picked].scl = 1
    picked = -1
    held = -1
    panel?.classList.remove('on')
    root.classList.remove('is-held')
  }

  let raf = 0
  let last = performance.now()
  function tick(now: number): void {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    nav.dt = dt
    pickT += ((picked >= 0 ? 1 : 0) - pickT) * damp(0.07, dt)

    if (nav.seeking) {
      seekT += dt
      const kn = damp(0.055, dt)
      nav.x += (navTX - nav.x) * kn
      nav.y += (navTY - nav.y) * kn
      if (seekT > 2.2) nav.seeking = false
    } else if (!nav.dragging) {
      nav.x += nav.vx * dt
      nav.y += nav.vy * dt
      const decay = Math.pow(0.12, dt)
      nav.vx *= decay
      nav.vy *= decay
    }
    nav.x = clamp(nav.x, -0.8, 0.8)

    const heldS = heldPose()
    // While a card is held the rest of the room backs off and the fog closes in.
    // That is what stops the readout being written over a neighbour's photo.
    spread += ((picked >= 0 ? 1.35 : 1) - spread) * damp(0.045, dt)
    fogD += ((picked >= 0 ? 0.115 : 0.062) - fogD) * damp(0.045, dt)
    if (scene.fog && 'density' in scene.fog) scene.fog.density = fogD
    const slow = reduced ? 0 : picked >= 0 ? 0.3 : hovered >= 0 ? 0.16 : nav.dragging ? 0.25 : 1
    orbT += dt * slow
    const ks = damp(0.028, dt)
    const lx = picked >= 0 || reduced ? 0 : pointer.x
    const ly = picked >= 0 || reduced ? 0 : pointer.y
    lean.y += (lx * 0.1 - lean.y) * ks
    lean.x += (-ly * 0.07 - lean.x) * ks
    swarm.rotation.y = lean.y + nav.y
    swarm.rotation.x = lean.x + nav.x

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      const m = c.mesh
      v.copy(c.dir)
        .applyAxisAngle(c.axis, orbT * c.speed + c.phase)
        .multiplyScalar(c.radius * (i === picked ? 1 : spread))
      const isHeld = i === picked
      if (isHeld) v.lerp(front, pickT)
      m.position.lerp(v, damp(isHeld ? 0.09 : 0.5, dt))

      c.ang += dt * c.rate * slow
      if (c.revolve) {
        qT.setFromAxisAngle(c.axis, c.ang)
      } else {
        m.lookAt(0, 0, 0)
        qT.copy(m.quaternion).multiply(qS.setFromAxisAngle(UP, Math.sin(c.ang) * c.swing))
      }
      if (isHeld) {
        m.lookAt(0, 0, 0)
        qF.copy(m.quaternion)
        m.quaternion.copy(qT).slerp(qF, pickT)
      } else {
        m.quaternion.copy(qT)
      }
      const want = isHeld ? heldS : i === (hovered >= 0 ? hovered : focusIdx) ? 1.18 : 1
      c.scl += (want - c.scl) * damp(0.1, dt)
      m.scale.setScalar(c.scl)
    }

    if (picked < 0 && hasHover) {
      ray.setFromCamera(pointer, camera)
      const h = ray.intersectObjects(meshes, false)[0]
      hovered = h ? (h.object.userData.i as number) : -1
    } else {
      hovered = -1
    }
    root.classList.toggle('is-over', picked < 0 && hovered >= 0)

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const el = renderer.domElement
  const fit = (): void => {
    const { w, h } = size()
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(w, h)
  }

  wireInput({
    el,
    root,
    pointer,
    nav,
    radPerPx,
    hitAt,
    pick,
    release,
    fit,
    isPicked: () => picked >= 0,
    setHasHover: () => {
      hasHover = true
    },
    step: (dir) => {
      focusIdx = (focusIdx + dir + cards.length) % cards.length
      bringToFront(focusIdx)
    },
    hasFocus: () => focusIdx >= 0,
    pickFocused: () => pick(focusIdx),
  })

  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf)
    dispose()
    renderer.dispose()
  })
}
