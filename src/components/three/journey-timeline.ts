// Scroll timeline for the full-page dust journey, in the reference site's
// style: the brain starts FULLY FORMED in the hero's portrait slot, melts
// into traveling dust as you scroll, half-condenses at Experience, and
// docks fully formed into the contact slot. Keyframe positions are
// resolved from the LIVE section rects every frame, never from hardcoded
// page fractions.

import { MathUtils } from 'three'

export interface Pose {
  x: number // viewport-fraction center
  y: number
  s: number // figure height as a fraction of viewport height
  a: number // alpha
  fB: number // 1 = fully formed brain
  waves: number // neural wave intensity
}

interface KF extends Pose {
  sel: string // '' anchors to the top of the page
}

const KFS: KF[] = [
  { sel: '#about', x: 0.6, y: 0.6, s: 0.5, a: 0.45, fB: 0, waves: 0 },
  { sel: '#stack', x: 0.5, y: 0.62, s: 0.5, a: 0.35, fB: 0, waves: 0 },
  { sel: '#experience', x: 0.8, y: 0.55, s: 0.32, a: 0.85, fB: 0.55, waves: 0.25 },
  { sel: '#work', x: 0.84, y: 0.58, s: 0.46, a: 0.4, fB: 0, waves: 0 },
  { sel: '#github', x: 0.5, y: 0.66, s: 0.5, a: 0.4, fB: 0, waves: 0 },
  { sel: '#writing', x: 0.85, y: 0.6, s: 0.5, a: 0.35, fB: 0, waves: 0 },
  { sel: '#console', x: 0.82, y: 0.62, s: 0.42, a: 0.65, fB: 0.3, waves: 0.3 },
]

const lerpKF = (a: KF | Pose, b: KF | Pose, t: number): Pose => ({
  x: MathUtils.lerp(a.x, b.x, t),
  y: MathUtils.lerp(a.y, b.y, t),
  s: MathUtils.lerp(a.s, b.s, t),
  a: MathUtils.lerp(a.a, b.a, t),
  fB: MathUtils.lerp(a.fB, b.fB, t),
  waves: MathUtils.lerp(a.waves, b.waves, t),
})

export function resolvePose(scrollY: number, vw: number, vh: number): Pose | null {
  const ys: number[] = []
  const stops: (KF | Pose)[] = []
  // Figures are sized by viewport HEIGHT, so narrow windows would let
  // them swallow the copy; damp every stop by the aspect ratio, and on
  // portrait-ish screens keep the travel closer to the center.
  const narrow = vw < 900 || vw / vh < 1.05
  const fit = MathUtils.clamp(vw / vh / 1.68, 0.55, 1)
  const slot = document.querySelector('.media-frame')?.getBoundingClientRect()
  if (slot && slot.height > 0) {
    ys.push(scrollY + slot.top + slot.height / 2 - vh * 0.5)
    if (narrow) {
      // Phones and tablets: the figure simply takes the portrait slot,
      // which the layout already places under the copy.
      const w = Math.min(slot.width * 0.92, vw - 48)
      stops.push({
        x: (slot.left + slot.width / 2) / vw,
        y: (slot.top + slot.height / 2) / vh,
        s: w / (vh * 0.97),
        a: 1,
        fB: 1,
        waves: 1,
      })
    } else {
      // Wide screens: dominant like the reference, living in the free
      // zone to the right of the live hero copy edge, never cropped.
      const copy = document.querySelector('.hero-copy')?.getBoundingClientRect()
      const left = copy ? copy.right + 10 : vw * 0.55
      const avail = Math.max(220, vw - left)
      const heroW = Math.min(0.68 * vh * 0.97, avail * 0.88)
      // Keep a real margin at the right edge - the figure should sit in
      // the composition, not bleed off it.
      const heroX = Math.min((left + avail * 0.48) / vw, 1 - (heroW / 2 + vw * 0.045) / vw)
      stops.push({ x: heroX, y: 0.52, s: heroW / (vh * 0.97), a: 1, fB: 1, waves: 1 })
    }
  }
  for (const k of KFS) {
    const el = document.querySelector(k.sel)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.height === 0) continue
    ys.push(scrollY + r.top + Math.min(r.height, vh) * 0.5 - vh * 0.5)
    // On phones the traveling dust passes behind the copy, so it stays
    // fainter there - the text has to win.
    stops.push({
      ...k,
      x: narrow ? 0.5 + (k.x - 0.5) * 0.45 : k.x,
      s: k.s * fit,
      a: narrow ? k.a * 0.45 : k.a,
    })
  }
  // Final stop: the brain docks into the live contact slot.
  const dock = document.querySelector('.cube-stage')?.getBoundingClientRect()
  if (dock && dock.height > 0) {
    ys.push(scrollY + dock.top + dock.height / 2 - vh * 0.55)
    stops.push({
      x: (dock.left + dock.width / 2) / vw,
      y: (dock.top + dock.height / 2) / vh,
      s: (dock.height / vh) * 1.05,
      a: 1,
      fB: 1,
      waves: 1,
    })
  }
  if (stops.length === 0) return null

  let pose: Pose
  if (scrollY <= ys[0]) pose = lerpKF(stops[0], stops[0], 0)
  else if (scrollY >= ys[ys.length - 1])
    pose = lerpKF(stops[stops.length - 1], stops[stops.length - 1], 0)
  else {
    let i = 0
    while (scrollY > ys[i + 1]) i++
    const u = (scrollY - ys[i]) / Math.max(1, ys[i + 1] - ys[i])
    pose = lerpKF(stops[i], stops[i + 1], u * u * (3 - 2 * u))
  }

  // Scrolled past the dock into the footer: melt and fade out.
  if (dock && dock.height > 0) {
    const past = MathUtils.clamp(((vh - dock.height) / 2 - dock.top) / (vh * 0.5), 0, 1)
    if (past > 0) {
      pose.a = MathUtils.lerp(pose.a, 0, past)
      pose.fB = MathUtils.lerp(pose.fB, 0, past)
      pose.waves = MathUtils.lerp(pose.waves, 0, past)
    }
  }
  return pose
}
