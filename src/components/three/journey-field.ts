// The unified particle field for the full-page journey: one pool of NODES
// particles that reads as loose dust or as the brain. Dust colors are the
// brain's hues faded toward paper so the ambient cloud keeps a hint of
// the palette.

import { Color } from 'three'
import { buildVolume, NODES } from './net-geometry'

export function buildField() {
  const brain = buildVolume()

  const dustCol = new Float32Array(NODES * 3)
  const c = new Color()
  const paper = new Color('#f4f4f2')
  for (let i = 0; i < NODES; i++) {
    const j = i * 3
    c.setRGB(brain.baseColors[j], brain.baseColors[j + 1], brain.baseColors[j + 2]).lerp(
      paper,
      0.45
    )
    dustCol[j] = c.r
    dustCol[j + 1] = c.g
    dustCol[j + 2] = c.b
  }

  return { brain, dustCol }
}
