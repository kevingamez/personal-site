// Input for the moments window: drag to turn the swarm, arrows to bring a card
// over, click or tap to hold one, and the fullscreen toggle. Split out of
// moments.ts to keep both files under the repo's 300-line cap.

import { MathUtils, type Vector2 } from 'three'

export interface NavState {
  x: number
  y: number
  vx: number
  vy: number
  seeking: boolean
  dragging: boolean
  dt: number
}

export interface InputHooks {
  el: HTMLCanvasElement
  root: HTMLElement
  pointer: Vector2
  nav: NavState
  radPerPx: () => number
  hitAt: (x: number, y: number) => number
  pick: (i: number) => void
  release: () => void
  fit: () => void
  isPicked: () => boolean
  setHasHover: () => void
  step: (dir: number) => void
  hasFocus: () => boolean
  pickFocused: () => void
}

export function wireInput(h: InputHooks): void {
  const { el, root, pointer, nav } = h
  let moved = 0
  let lastX = 0
  let lastY = 0

  el.addEventListener('pointerdown', (e) => {
    nav.dragging = true
    nav.seeking = false
    nav.vx = nav.vy = 0
    moved = 0
    lastX = e.clientX
    lastY = e.clientY
  })

  addEventListener('pointerup', () => {
    nav.dragging = false
  })

  el.addEventListener('pointermove', (e) => {
    // A finger drag must not fake a hover, or the swarm slows and a phantom
    // card stays scaled up on a device that cannot hover at all.
    if (e.pointerType !== 'touch') {
      h.setHasHover()
      const r = el.getBoundingClientRect()
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
    }
    if (!nav.dragging) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    moved += Math.abs(dx) + Math.abs(dy)
    // radians per pixel, so the card under the cursor stays under the cursor
    const k = h.radPerPx()
    nav.y += dx * k
    nav.x = MathUtils.clamp(nav.x + dy * k, -0.8, 0.8)
    // remember the throw, so letting go coasts instead of stopping dead
    nav.vy = (dx * k) / Math.max(nav.dt, 0.008)
    nav.vx = (dy * k) / Math.max(nav.dt, 0.008)
  })

  el.addEventListener('click', (e) => {
    if (moved > 6) return // that was a drag, not a pick
    if (h.isPicked()) return h.release()
    // hit-test the click's OWN coordinates: reusing the last hovered index made
    // a tap pick nothing on touch, and let a click on empty space open whatever
    // the cursor had passed over last
    h.pick(h.hitAt(e.clientX, e.clientY))
  })

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return h.release()
    if (h.isPicked()) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        h.release()
      }
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      h.step(1)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      h.step(-1)
      e.preventDefault()
    } else if ((e.key === 'Enter' || e.key === ' ') && h.hasFocus()) {
      e.preventDefault()
      h.pickFocused()
    }
  })

  addEventListener('resize', h.fit)

  document.addEventListener('fullscreenchange', () => {
    root.classList.toggle('is-full', document.fullscreenElement === root)
    requestAnimationFrame(h.fit)
  })

  document.getElementById('moments-full')?.addEventListener('click', () => {
    if (document.fullscreenElement === root) void document.exitFullscreen()
    else void root.requestFullscreen?.()
  })
}
