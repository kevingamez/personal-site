// Geometry for the neural figure: a two-lobed volumetric body of neuron
// positions, nearest-neighbor synapse edges (via a coarse spatial hash),
// firing origins, and per-neuron sizes/phases. Deterministic.

import { Color } from 'three'
import { buildSizes } from './particle-material'

export const NODES = 2800
const LINKS_PER_NODE = 2
const LINK_MAX_DIST = 0.42
export const AUTO_WAVE_S = 3.4
export const TOUCH_WAVE_SPEED = 2.6 // world units per second
export const WAVE_BAND = 0.5
export const INK = new Color('#0b0b0c')
export const FAINT = new Color('#0b0b0c').lerp(new Color('#f4f4f2'), 0.78)
export const VIOLET = new Color('#7c5cff')

export function buildVolume() {
  const base = new Float32Array(NODES * 3)
  const phase = new Float32Array(NODES)
  let seed = 424242
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  // Anatomical brain, sampled on the surface so the form reads instantly:
  // two cerebral hemispheres split by a central fissure, gyri as wavy fold
  // ridges, a finely striated cerebellum tucked low at the back, and a
  // short brainstem. x = left/right, y = up/down, z = back(-)/front(+).
  const place = (i: number) => {
    const pick = rand()
    let x = 0
    let y = 0
    let z = 0
    if (pick < 0.82) {
      // Cerebrum hemisphere.
      const side = rand() < 0.5 ? -1 : 1
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const dx = Math.sin(ph) * Math.cos(th)
      let dy = Math.cos(ph)
      const dz = Math.sin(ph) * Math.sin(th)
      if (dy < 0) dy *= 0.72 // flatter underside
      // Gyri: creased ridge bands over the surface.
      const fold =
        (1 - Math.abs(Math.sin(th * 5.5 + Math.sin(ph * 3.2) * 1.4))) * 0.12 +
        (1 - Math.abs(Math.sin(ph * 7 + th * 1.3))) * 0.06
      const sc = 0.96 + fold
      // Tight central fissure: the inner wall sits just off the midline.
      x = side * (0.36 + Math.max(dx * side, -0.46) * 0.66 * sc)
      y = dy * 1.0 * sc + 0.06
      z = dz * 1.42 * sc
      if (Math.abs(x) < 0.05) x = side * 0.05
    } else if (pick < 0.95) {
      // Cerebellum: small, low, at the back, with fine horizontal striations.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const stria = (1 - Math.abs(Math.sin(ph * 14))) * 0.05
      const sc = 0.97 + stria
      x = Math.sin(ph) * Math.cos(th) * 0.66 * sc
      y = Math.cos(ph) * 0.38 * sc - 0.72
      z = Math.sin(ph) * Math.sin(th) * 0.5 * sc - 0.78
    } else {
      // Brainstem: short angled column under the center-back.
      const t = rand()
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * 0.15
      x = Math.cos(a) * r
      y = -0.5 - t * 0.62
      z = -0.3 - t * 0.18 + Math.sin(a) * r
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
            const dx = base[j * 3] - x
            const dy = base[j * 3 + 1] - y
            const dz = base[j * 3 + 2] - z
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            // Keep the central fissure crisp: no links across hemispheres.
            if (x * base[j * 3] < 0 && Math.abs(x) > 0.05 && Math.abs(base[j * 3]) > 0.05) continue
            if (d < LINK_MAX_DIST) near.push({ j, d })
          }
        }
    near.sort((a, b) => a.d - b.d)
    for (let n = 0; n < Math.min(LINKS_PER_NODE, near.length); n++) edges.push([i, near[n].j])
  }
  const origins: number[] = []
  for (let o = 0; o < 5; o++) origins.push(Math.floor(rand() * NODES))
  const sizes = buildSizes(NODES, rand, 1.5)
  return { base, phase, edges, origins, sizes }
}
