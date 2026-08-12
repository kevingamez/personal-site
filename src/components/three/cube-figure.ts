// The cube the journey ends on: not a hollow shell of dots but a solid
// object with visible internals - prism-tinted faces, inked edges that
// draw the silhouette, a regular lattice suspended inside, and a violet
// core at the center wired to the eight corners. Deterministic; sized to
// whatever particle count the shared pool has.

import { Color } from 'three'

export const HALF = 1.32
const FACE_COLORS = ['#7c5cff', '#e9a521', '#3e8e6e', '#d2617a', '#0b0b0c', '#a3a3a9']
const INK = new Color('#0b0b0c')
const PAPER = new Color('#f4f4f2')
const VIOLET = new Color('#7c5cff')

// Shares of the pool, in order: faces, edges, inner lattice, core, and
// the inner cube frame that closes around it.
const FACE_SHARE = 0.36
const EDGE_SHARE = 0.16
const LATTICE_SHARE = 0.26
const CORE_SHARE = 0.09

export const KIND_CORE = 3

export function buildCubeFigure(count: number, rand: () => number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const kind = new Uint8Array(count)
  const c = new Color()
  const faceEnd = FACE_SHARE
  const edgeEnd = faceEnd + EDGE_SHARE
  const latticeEnd = edgeEnd + LATTICE_SHARE
  const coreEnd = latticeEnd + CORE_SHARE

  for (let i = 0; i < count; i++) {
    const j = i * 3
    const pick = rand()
    let x = 0
    let y = 0
    let z = 0

    if (pick < faceEnd) {
      // Faces: a dot on one of the six planes, tinted with its prism hue.
      const face = Math.floor(rand() * 6)
      const u = (rand() * 2 - 1) * HALF
      const v = (rand() * 2 - 1) * HALF
      const s = face % 2 === 0 ? HALF : -HALF
      if (face < 2) {
        x = s
        y = u
        z = v
      } else if (face < 4) {
        x = u
        y = s
        z = v
      } else {
        x = u
        y = v
        z = s
      }
      c.set(FACE_COLORS[face]).lerp(PAPER, 0.42 + rand() * 0.3)
      size[i] = 0.052 + rand() * 0.03
    } else if (pick < edgeEnd) {
      // Edges: the twelve beams, inked and dense - they carry the shape.
      const axis = Math.floor(rand() * 3)
      const a = rand() * 2 - 1
      const sy = rand() < 0.5 ? -HALF : HALF
      const sz = rand() < 0.5 ? -HALF : HALF
      const jit = () => (rand() - 0.5) * 0.035
      if (axis === 0) {
        x = a * HALF
        y = sy + jit()
        z = sz + jit()
      } else if (axis === 1) {
        x = sy + jit()
        y = a * HALF
        z = sz + jit()
      } else {
        x = sy + jit()
        y = sz + jit()
        z = a * HALF
      }
      c.copy(INK).lerp(PAPER, rand() * 0.18)
      size[i] = 0.075 + rand() * 0.035
    } else if (pick < latticeEnd) {
      // Inner lattice: a regular grid floating inside, so the cube reads
      // as a built volume rather than an empty box.
      const N = 6
      const q = (n: number) => (Math.floor(rand() * n) / (n - 1)) * 2 - 1
      x = q(N) * HALF * 0.74 + (rand() - 0.5) * 0.02
      y = q(N) * HALF * 0.74 + (rand() - 0.5) * 0.02
      z = q(N) * HALF * 0.74 + (rand() - 0.5) * 0.02
      c.copy(INK).lerp(PAPER, 0.42 + rand() * 0.2)
      size[i] = 0.045 + rand() * 0.025
    } else if (pick < coreEnd) {
      // Core: a small violet nucleus suspended dead center.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const r = Math.pow(rand(), 0.65) * 0.3
      x = Math.sin(ph) * Math.cos(th) * r
      y = Math.cos(ph) * r
      z = Math.sin(ph) * Math.sin(th) * r
      c.copy(VIOLET).lerp(INK, rand() * 0.25)
      size[i] = 0.06 + rand() * 0.05
      kind[i] = KIND_CORE
    } else if (rand() < 0.55) {
      // Inner cube: a second, smaller frame nested around the core, so
      // there is real structure to see through the faces.
      const h = HALF * 0.46
      const axis = Math.floor(rand() * 3)
      const a = rand() * 2 - 1
      const s1 = rand() < 0.5 ? -h : h
      const s2 = rand() < 0.5 ? -h : h
      const jit = () => (rand() - 0.5) * 0.02
      if (axis === 0) {
        x = a * h
        y = s1 + jit()
        z = s2 + jit()
      } else if (axis === 1) {
        x = s1 + jit()
        y = a * h
        z = s2 + jit()
      } else {
        x = s1 + jit()
        y = s2 + jit()
        z = a * h
      }
      c.copy(VIOLET).lerp(INK, 0.15 + rand() * 0.25)
      size[i] = 0.05 + rand() * 0.025
    } else {
      // Struts: dotted lines from the core out to the eight corners.
      const t = 0.32 + rand() * 0.68
      const sx = rand() < 0.5 ? -1 : 1
      const sy2 = rand() < 0.5 ? -1 : 1
      const sz2 = rand() < 0.5 ? -1 : 1
      x = sx * HALF * 0.94 * t + (rand() - 0.5) * 0.02
      y = sy2 * HALF * 0.94 * t + (rand() - 0.5) * 0.02
      z = sz2 * HALF * 0.94 * t + (rand() - 0.5) * 0.02
      c.copy(VIOLET).lerp(PAPER, 0.4 + rand() * 0.3)
      size[i] = 0.038 + rand() * 0.022
    }

    pos[j] = x
    pos[j + 1] = y
    pos[j + 2] = z
    col[j] = c.r
    col[j + 1] = c.g
    col[j + 2] = c.b
  }

  return { pos, col, size, kind }
}
