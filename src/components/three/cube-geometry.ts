// Shared particle-cube geometry: ~7200 dots on a cube surface, six prism
// faces, plus the scattered sphere they assemble from. Deterministic so
// every mount renders the same figure.

import { Color } from 'three'
import { buildSizes } from './particle-material'

export const PER_FACE = 1200
export const COUNT = PER_FACE * 6
export const HALF = 1.35 // cube half-size
// One prism hue per face; dark-leaning so the figure reads on paper.
const FACE_COLORS = ['#7c5cff', '#e9a521', '#3e8e6e', '#d2617a', '#0b0b0c', '#a3a3a9']
const FACES: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

export interface CubeGeometry {
  target: Float32Array
  scatter: Float32Array
  colors: Float32Array
  stagger: Float32Array
  sizes: Float32Array
}

export function buildCube(): CubeGeometry {
  const target = new Float32Array(COUNT * 3)
  const scatter = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const stagger = new Float32Array(COUNT)
  const color = new Color()
  let seed = 99
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let f = 0; f < 6; f++) {
    const [nx, ny, nz] = FACES[f]
    color.set(FACE_COLORS[f])
    for (let k = 0; k < PER_FACE; k++) {
      const i = f * PER_FACE + k
      const u = (rand() * 2 - 1) * HALF
      const w = (rand() * 2 - 1) * HALF
      const jitter = (rand() - 0.5) * 0.03
      const j = i * 3
      target[j] = nx ? nx * (HALF + jitter) : u
      target[j + 1] = ny ? ny * (HALF + jitter) : nx ? u : w
      target[j + 2] = nz ? nz * (HALF + jitter) : w
      // Scatter start: a wide loose sphere the particles fly in from.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const rr = 3.4 + rand() * 2.2
      scatter[j] = Math.sin(ph) * Math.cos(th) * rr
      scatter[j + 1] = Math.cos(ph) * rr
      scatter[j + 2] = Math.sin(ph) * Math.sin(th) * rr
      stagger[i] = rand() * 0.45
      colors[j] = color.r
      colors[j + 1] = color.g
      colors[j + 2] = color.b
    }
  }
  const sizes = buildSizes(COUNT, rand, 1.15)
  return { target, scatter, colors, stagger, sizes }
}
