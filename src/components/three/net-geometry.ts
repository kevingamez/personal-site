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
  for (let i = 0; i < NODES; i++) {
    const th = rand() * Math.PI * 2
    const ph = Math.acos(rand() * 2 - 1)
    const r = Math.cbrt(rand())
    // Two lobes with a soft central fissure, like the reference figure.
    const side = i % 2 === 0 ? 1 : -1
    base[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.25 + side * 0.68
    base[i * 3 + 1] = Math.cos(ph) * r * 1.35
    base[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r * 1.45
    phase[i] = rand() * Math.PI * 2
  }
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
