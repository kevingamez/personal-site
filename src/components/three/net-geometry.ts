// Geometry for the neural figure: an anatomical brain built from an authored
// side-profile silhouette (the read comes from the outline, not from noise),
// filled with surface-biased particles, split by a central fissure, with a
// striated cerebellum under the back and a brainstem. Plus nearest-neighbor
// synapse edges, firing origins, and per-neuron sizes/phases. Deterministic.

import { Color } from 'three'
import { buildSizes } from './particle-material'

export const NODES = 7500
const LINKS_PER_NODE = 2
const LINK_MAX_DIST = 0.3
export const AUTO_WAVE_S = 3.4
export const TOUCH_WAVE_SPEED = 2.6 // world units per second
export const WAVE_BAND = 0.5
export const INK = new Color('#0b0b0c')
export const FAINT = new Color('#0b0b0c').lerp(new Color('#f4f4f2'), 0.78)
export const VIOLET = new Color('#7c5cff')

// Side-profile outline of a human brain, authored by hand: (z, y) pairs,
// +z toward the face, y up. Clockwise from the front-bottom.
const PROFILE: [number, number][] = [
  [1.28, -0.12], // frontal underside
  [1.38, 0.22], // frontal pole
  [1.22, 0.62], // frontal slope
  [0.82, 0.94], // toward the crown
  [0.2, 1.1], // crown
  [-0.5, 1.04], // parietal
  [-1.05, 0.78], // occipital slope
  [-1.34, 0.34], // occipital pole
  [-1.3, -0.05], // back notch above cerebellum
  [-0.85, -0.28], // over the cerebellum
  [-0.35, -0.62], // underside dip
  [0.2, -0.7], // temporal underside
  [0.75, -0.72], // temporal lobe bulge
  [1.05, -0.5], // temporal front
]

function inProfile(z: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [zi, yi] = PROFILE[i]
    const [zj, yj] = PROFILE[j]
    if (yi > y !== yj > y && z < ((zj - zi) * (y - yi)) / (yj - yi) + zi) inside = !inside
  }
  return inside
}

function edgeDistance(z: number, y: number): number {
  let min = Infinity
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [zi, yi] = PROFILE[i]
    const [zj, yj] = PROFILE[j]
    const dz = zj - zi
    const dy = yj - yi
    const t = Math.max(0, Math.min(1, ((z - zi) * dz + (y - yi) * dy) / (dz * dz + dy * dy)))
    const pz = zi + t * dz
    const py = yi + t * dy
    const d = Math.sqrt((z - pz) ** 2 + (y - py) ** 2)
    if (d < min) min = d
  }
  return min
}

export function buildVolume() {
  const base = new Float32Array(NODES * 3)
  const phase = new Float32Array(NODES)
  let seed = 424242
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  const place = (i: number) => {
    const pick = rand()
    let x = 0
    let y = 0
    let z = 0
    if (pick < 0.8) {
      // Cerebrum: rejection-sample the authored profile, then give the point
      // lateral width that thins toward the outline (a rounded 3D body).
      let py = 0
      let pz = 0
      do {
        pz = rand() * 2.9 - 1.45
        py = rand() * 1.95 - 0.8
      } while (!inProfile(pz, py))
      const d = edgeDistance(pz, py)
      const w = Math.min(1, Math.sqrt(d) * 1.35) * 0.92
      const side = rand() < 0.5 ? -1 : 1
      const shell = rand() < 0.86
      let lx = shell ? w * (0.8 + 0.2 * rand()) : w * rand() * 0.75
      if (shell) {
        // Gyri: creased ridge bands sweeping around the profile.
        const th = Math.atan2(py - 0.1, pz)
        lx += (1 - Math.abs(Math.sin(th * 6.5 + Math.sin(py * 4.2) * 1.2))) * 0.14
      }
      x = side * Math.max(lx, 0.05) // tight central fissure
      y = py + (rand() - 0.5) * 0.03
      z = pz + (rand() - 0.5) * 0.03
    } else if (pick < 0.95) {
      // Cerebellum: distinct striated mass tucked under the occipital back.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const stria = (1 - Math.abs(Math.sin(Math.cos(ph) * 16))) * 0.05
      const sc = 0.94 + stria
      x = Math.sin(ph) * Math.cos(th) * 0.56 * sc
      y = Math.cos(ph) * 0.32 * sc - 0.52
      z = Math.sin(ph) * Math.sin(th) * 0.44 * sc - 0.82
    } else {
      // Brainstem: a short column angling down from under the center.
      const t = rand()
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * 0.13
      x = Math.cos(a) * r
      y = -0.55 - t * 0.55
      z = -0.35 + t * 0.12 + Math.sin(a) * r
    }
    base[i * 3] = x
    base[i * 3 + 1] = y
    base[i * 3 + 2] = z
    phase[i] = rand() * Math.PI * 2
  }
  for (let i = 0; i < NODES; i++) place(i)

  // Synapses via a coarse spatial hash: nearest few neighbors within reach.
  const cell = LINK_MAX_DIST
  const hash = new Map<string, number[]>()
  const keyOf = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  for (let i = 0; i < NODES; i++) {
    const k = keyOf(base[i * 3], base[i * 3 + 1], base[i * 3 + 2])
    const arr = hash.get(k)
    if (arr) arr.push(i)
    else hash.set(k, [i])
  }
  const edges: [number, number][] = []
  for (let i = 0; i < NODES; i++) {
    const x = base[i * 3]
    const y = base[i * 3 + 1]
    const z = base[i * 3 + 2]
    const near: { j: number; d: number }[] = []
    for (let cx = -1; cx <= 1; cx++)
      for (let cy = -1; cy <= 1; cy++)
        for (let cz = -1; cz <= 1; cz++) {
          const bucket = hash.get(keyOf(x + cx * cell, y + cy * cell, z + cz * cell))
          if (!bucket) continue
          for (const j of bucket) {
            if (j <= i) continue
            // Keep the central fissure crisp: no links across hemispheres.
            if (x * base[j * 3] < 0 && Math.abs(x) > 0.04 && Math.abs(base[j * 3]) > 0.04) continue
            const dx = base[j * 3] - x
            const dy = base[j * 3 + 1] - y
            const dz = base[j * 3 + 2] - z
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            if (d < LINK_MAX_DIST) near.push({ j, d })
          }
        }
    near.sort((a, b) => a.d - b.d)
    for (let n = 0; n < Math.min(LINKS_PER_NODE, near.length); n++) edges.push([i, near[n].j])
  }
  const origins: number[] = []
  for (let o = 0; o < 5; o++) origins.push(Math.floor(rand() * NODES))
  const sizes = buildSizes(NODES, rand, 0.92)
  return { base, phase, edges, origins, sizes }
}
