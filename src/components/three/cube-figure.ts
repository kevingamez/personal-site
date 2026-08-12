// The figure the journey ends on: a Rubik's cube built from particles.
// Each face is a 3x3 grid of colored stickers separated by inked grooves,
// the twelve outer edges are inked so the silhouette reads, and a dim
// interior fills the body so it feels solid rather than hollow, with a
// violet core standing in for the mechanism. Deterministic.

import { Color } from 'three'

export const HALF = 1.3
const GAP = 0.24 // empty gutter between stickers, in cell units
// Rubik colors, deepened just enough to read on the paper ground.
// The site's violet takes the white face's place: on paper a white
// sticker would vanish, and every visible face has to carry color.
const STICKERS = ['#6b4ae0', '#d99f08', '#c02a29', '#d6660c', '#1f57d0', '#17864b']
const INK = new Color('#0b0b0c')
const PAPER = new Color('#f4f4f2')
const VIOLET = new Color('#7c5cff')

const STICKER_SHARE = 0.76
const GROOVE_SHARE = 0.11
const EDGE_SHARE = 0.1
const CORE_SHARE = 0

export const KIND_CORE = 3
// Outward normal per face index, used to hide the faces turned away.
export const FACE_NORMALS: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// Maps a face index to its two in-plane axes and the fixed one.
function place(face: number, u: number, v: number, out: number[]): void {
  const s = face % 2 === 0 ? HALF : -HALF
  if (face < 2) {
    out[0] = s
    out[1] = u
    out[2] = v
  } else if (face < 4) {
    out[0] = u
    out[1] = s
    out[2] = v
  } else {
    out[0] = u
    out[1] = v
    out[2] = s
  }
}

export function buildCubeFigure(count: number, rand: () => number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const kind = new Uint8Array(count)
  // Which face a grain belongs to (-1 = not on the surface).
  const faceOf = new Int8Array(count).fill(-1)
  const c = new Color()
  const p = [0, 0, 0]
  const stickerEnd = STICKER_SHARE
  const grooveEnd = stickerEnd + GROOVE_SHARE
  const edgeEnd = grooveEnd + EDGE_SHARE
  const coreEnd = edgeEnd + CORE_SHARE
  const cell = (2 * HALF) / 3

  for (let i = 0; i < count; i++) {
    const j = i * 3
    const pick = rand()
    const face = Math.floor(rand() * 6)

    if (pick < stickerEnd) {
      // Stickers: a dot inside one of the nine cells, inset by the groove.
      // Each sticker is a filled square patch; the gutter around it stays
      // EMPTY, which is what makes the nine tiles read.
      const cu = Math.floor(rand() * 3)
      const cv = Math.floor(rand() * 3)
      const inset = cell * (0.5 - GAP)
      const u = -HALF + cell * (cu + 0.5) + (rand() * 2 - 1) * inset
      const v = -HALF + cell * (cv + 0.5) + (rand() * 2 - 1) * inset
      place(face, u, v, p)
      c.set(STICKERS[face]).lerp(PAPER, rand() * 0.08)
      size[i] = 0.082 + rand() * 0.032
      faceOf[i] = face
    } else if (pick < grooveEnd) {
      // Grooves: the two horizontal and two vertical channels per face.
      // Grooves: hairlines exactly on the thirds, not bands - a crisp
      // dark line between tiles instead of a smear.
      const alongU = rand() < 0.5
      const line = (rand() < 0.5 ? 1 : 2) * cell - HALF
      const t = (rand() * 2 - 1) * HALF
      const jit = (rand() - 0.5) * 0.012
      const u = alongU ? t : line + jit
      const v = alongU ? line + jit : t
      place(face, u, v, p)
      c.copy(INK).lerp(PAPER, rand() * 0.05)
      size[i] = 0.055 + rand() * 0.02
      faceOf[i] = face
    } else if (pick < edgeEnd) {
      // The twelve outer beams: dense ink, this is what draws the cube.
      const axis = Math.floor(rand() * 3)
      const a = rand() * 2 - 1
      const s1 = rand() < 0.5 ? -HALF : HALF
      const s2 = rand() < 0.5 ? -HALF : HALF
      const jit = () => (rand() - 0.5) * 0.03
      if (axis === 0) {
        p[0] = a * HALF
        p[1] = s1 + jit()
        p[2] = s2 + jit()
      } else if (axis === 1) {
        p[0] = s1 + jit()
        p[1] = a * HALF
        p[2] = s2 + jit()
      } else {
        p[0] = s1 + jit()
        p[1] = s2 + jit()
        p[2] = a * HALF
      }
      c.copy(INK).lerp(PAPER, rand() * 0.12)
      size[i] = 0.08 + rand() * 0.035
    } else if (pick < coreEnd) {
      // Core: the mechanism, a violet nucleus that pulses inside.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      const r = Math.pow(rand(), 0.6) * 0.17
      p[0] = Math.sin(ph) * Math.cos(th) * r
      p[1] = Math.cos(ph) * r
      p[2] = Math.sin(ph) * Math.sin(th) * r
      c.copy(VIOLET).lerp(PAPER, 0.25 + rand() * 0.2)
      size[i] = 0.04 + rand() * 0.03
      kind[i] = KIND_CORE
    } else {
      // Interior: a whisper of fill so the body is not hollow, kept
      // light enough that it never muddies the faces in front of it.
      p[0] = (rand() * 2 - 1) * HALF * 0.8
      p[1] = (rand() * 2 - 1) * HALF * 0.8
      p[2] = (rand() * 2 - 1) * HALF * 0.8
      c.copy(INK).lerp(PAPER, 0.78 + rand() * 0.16)
      size[i] = 0.026 + rand() * 0.016
    }

    pos[j] = p[0]
    pos[j + 1] = p[1]
    pos[j + 2] = p[2]
    col[j] = c.r
    col[j + 1] = c.g
    col[j + 2] = c.b
  }

  return { pos, col, size, kind, faceOf }
}
