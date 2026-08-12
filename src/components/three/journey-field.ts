// The unified particle field for the full-page journey: one pool of
// particles that reads as loose dust, as the brain, or as the cube the
// page ends on. Dust colors are the brain's hues faded toward paper so
// the ambient cloud keeps a hint of the palette.

import { Color } from 'three'
import { buildVolume, NODES } from './net-geometry'
import { buildCubeFigure } from './cube-figure'

export function buildField(count?: number) {
  const brain = buildVolume(count)

  const dustCol = new Float32Array(brain.count * 3)
  const c = new Color()
  const paper = new Color('#f4f4f2')
  for (let i = 0; i < brain.count; i++) {
    const j = i * 3
    c.setRGB(brain.baseColors[j], brain.baseColors[j + 1], brain.baseColors[j + 2])
      .lerp(paper, 0.45)
      .toArray(dustCol, j)
  }

  // Lighter figures get proportionally bigger grains so the body reads
  // as solid as the full-density one.
  if (brain.count < NODES) {
    const boost = Math.min(1.32, Math.sqrt(NODES / brain.count))
    for (let i = 0; i < brain.count; i++) brain.sizes[i] *= boost
  }

  // The cube shares the pool: same particles, second destination.
  let seed = 20260811
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const cube = buildCubeFigure(brain.count, rand)
  if (brain.count < NODES) {
    const boost = Math.min(1.32, Math.sqrt(NODES / brain.count))
    for (let i = 0; i < brain.count; i++) cube.size[i] *= boost
  }

  return { brain, dustCol, cube }
}
