// Geometry for the neural figure: an anatomical brain built from an authored
// side-profile silhouette (the read comes from the outline, not from noise),
// filled with surface-biased particles, split by a central fissure, with a
// striated cerebellum under the back and a brainstem. Plus nearest-neighbor
// synapse edges, firing origins, and per-neuron sizes/phases. Deterministic.

import { Color } from 'three'
import { buildSizes } from './particle-material'

export const NODES = 13000
const LINKS_PER_NODE = 2
const LINK_MAX_DIST = 0.3
export const AUTO_WAVE_S = 3.4
export const TOUCH_WAVE_SPEED = 2.6 // world units per second
export const WAVE_BAND = 0.5
export const INK = new Color('#0b0b0c')
export const FAINT = new Color('#0b0b0c').lerp(new Color('#f4f4f2'), 0.5)
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
  const region = new Uint8Array(NODES) // 0 cerebrum, 1 cerebellum, 2 stem
  const rim = new Float32Array(NODES) // 1 = at the silhouette outline
  const crease = new Float32Array(NODES) // 1 = inside a fold furrow
  let seed = 424242
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  // Perimeter table so the contour band can sample the outline directly.
  const segLen: number[] = []
  let perim = 0
  for (let i = 0; i < PROFILE.length; i++) {
    const [z1, y1] = PROFILE[i]
    const [z2, y2] = PROFILE[(i + 1) % PROFILE.length]
    segLen.push(Math.hypot(z2 - z1, y2 - y1))
    perim += segLen[i]
  }

  const place = (i: number) => {
    const pick = rand()
    let x = 0
    let y = 0
    let z = 0
    if (pick < 0.78) {
      // Cerebrum: mostly rejection-sampled from the authored profile; a
      // dense contour band rides the outline itself so the silhouette
      // reads as a drawn stroke, not a fading dust edge.
      let py = 0
      let pz = 0
      if (rand() < 0.16) {
        let along = rand() * perim
        let si = 0
        while (along > segLen[si]) {
          along -= segLen[si]
          si++
        }
        const [z1, y1] = PROFILE[si]
        const [z2, y2] = PROFILE[(si + 1) % PROFILE.length]
        const tt = along / segLen[si]
        const u = (0.02 + rand() * 0.08) * 0.5
        pz = z1 + (z2 - z1) * tt
        py = y1 + (y2 - y1) * tt
        pz += (0 - pz) * u
        py += (0.18 - py) * u
      } else {
        do {
          pz = rand() * 2.9 - 1.45
          py = rand() * 1.95 - 0.8
        } while (!inProfile(pz, py))
      }
      const d = edgeDistance(pz, py)
      const w = Math.min(1, Math.sqrt(d) * 1.55) * 0.92
      const side = rand() < 0.5 ? -1 : 1
      const shell = rand() < 0.86
      let lx = shell ? w * (0.8 + 0.2 * rand()) : w * rand() * 0.75
      rim[i] = Math.max(0, 1 - d / 0.3)
      if (shell) {
        // Gyri: creased ridge bands sweeping around the profile.
        const th = Math.atan2(py - 0.1, pz)
        const furrow = Math.abs(Math.sin(th * 6.5 + Math.sin(py * 4.2) * 1.2))
        crease[i] = furrow
        lx += (1 - furrow) * 0.14
      }
      x = side * Math.max(lx, 0.05) // tight central fissure
      y = py + (rand() - 0.5) * 0.03
      z = pz + (rand() - 0.5) * 0.03
    } else if (pick < 0.94) {
      region[i] = 1
      // Cerebellum: distinct striated mass tucked under the occipital back.
      const th = rand() * Math.PI * 2
      const ph = Math.acos(rand() * 2 - 1)
      crease[i] = Math.abs(Math.sin(Math.cos(ph) * 16))
      const stria = (1 - crease[i]) * 0.09
      const sc = 0.94 + stria
      x = Math.sin(ph) * Math.cos(th) * 0.6 * sc
      y = Math.cos(ph) * 0.32 * sc - 0.52
      z = Math.sin(ph) * Math.sin(th) * 0.48 * sc - 0.84
    } else {
      // Brainstem: a short column angling down from under the center.
      region[i] = 2
      const t = rand()
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * 0.17 * (1 - t * 0.45)
      x = Math.cos(a) * r
      y = -0.5 - t * 0.5
      z = -0.35 + t * 0.1 + Math.sin(a) * r
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
  // Base colors: the reference brain's pointillist full-color mix, mapped
  // onto anatomy - frontal violet flowing through rose to occipital amber,
  // an emerald cerebellum, an ink brainstem. Per-neuron jitter plus darker
  // and lighter stipple make it read as colored dust, not flat paint.
  const baseColors = new Float32Array(NODES * 3)
  const accented = new Uint8Array(NODES)
  {
    const c = new Color()
    const mixc = new Color()
    const paper = new Color('#f4f4f2')
    const amber = new Color('#e9a521')
    const rose = new Color('#d2617a')
    const violet = new Color('#7c5cff')
    const emerald = new Color('#3e8e6e')
    for (let i = 0; i < NODES; i++) {
      if (region[i] === 1) {
        c.copy(emerald).lerp(violet, rand() * 0.35)
      } else if (region[i] === 2) {
        c.copy(INK).lerp(paper, 0.25 + rand() * 0.15)
      } else {
        const tt = Math.min(1, Math.max(0, (base[i * 3 + 2] + 1.45) / 2.9 + (rand() - 0.5) * 0.22))
        if (tt < 0.5) c.copy(amber).lerp(rose, tt * 2)
        else c.copy(rose).lerp(violet, (tt - 0.5) * 2)
      }
      // The anatomy is drawn with darkness: an inked contour right at the
      // silhouette, a dark ring fading inward, and shaded fold furrows.
      if (region[i] === 0 && rim[i] > 0.78) {
        c.copy(INK).lerp(mixc.copy(paper), 0.15)
      } else {
        c.lerp(mixc.copy(INK), 0.15)
        c.lerp(
          mixc.copy(INK),
          region[i] === 1
            ? 0.12 + crease[i] * 0.5
            : Math.min(0.75, rim[i] * 0.55 + crease[i] * 0.34)
        )
      }
      // Stipple: some neurons sink toward ink, a few lift toward paper.
      const v = rand()
      if (v < 0.16) c.lerp(mixc.copy(INK), 0.5)
      else if (v < 0.24) c.lerp(mixc.copy(paper), 0.3)
      accented[i] = rand() < 0.1 ? 1 : 0
      baseColors[i * 3] = c.r
      baseColors[i * 3 + 1] = c.g
      baseColors[i * 3 + 2] = c.b
    }
  }
  const sizes = buildSizes(NODES, rand, 1.0)
  // Colored neurons double as the reference brain's bright glints.
  for (let i = 0; i < NODES; i++) if (accented[i]) sizes[i] *= 1.4
  // Journey extras: a loose dust cloud to assemble from, and a per-neuron
  // stagger so formation sweeps from the frontal pole toward the back.
  const scatter = new Float32Array(NODES * 3)
  const stagger = new Float32Array(NODES)
  for (let i = 0; i < NODES; i++) {
    const th = rand() * Math.PI * 2
    const ph = Math.acos(rand() * 2 - 1)
    const r = 2.2 + Math.pow(rand(), 0.6) * 3.4
    scatter[i * 3] = Math.sin(ph) * Math.cos(th) * r
    scatter[i * 3 + 1] = Math.cos(ph) * r * 0.7
    scatter[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r
    stagger[i] = (1 - (base[i * 3 + 2] + 1.45) / 2.9) * 0.6 + rand() * 0.4
  }
  return { base, phase, edges, origins, sizes, baseColors, scatter, stagger }
}
