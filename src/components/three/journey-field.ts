// The unified particle field for the full-page journey: one pool of NODES
// particles that can read as loose dust, as the brain, or as the prism
// cube. Cube targets are cycled to fill the pool; dust colors are the
// brain's hues faded most of the way to paper so the ambient cloud keeps
// a hint of the palette.

import { Color } from 'three'
import { buildVolume, NODES } from './net-geometry'
import { buildCube, COUNT as CUBE_COUNT } from './cube-geometry'

export function buildField() {
  const brain = buildVolume()
  const cube = buildCube()

  const cubePos = new Float32Array(NODES * 3)
  const cubeCol = new Float32Array(NODES * 3)
  for (let i = 0; i < NODES; i++) {
    const s = (i % CUBE_COUNT) * 3
    const j = i * 3
    cubePos[j] = cube.target[s]
    cubePos[j + 1] = cube.target[s + 1]
    cubePos[j + 2] = cube.target[s + 2]
    cubeCol[j] = cube.colors[s]
    cubeCol[j + 1] = cube.colors[s + 1]
    cubeCol[j + 2] = cube.colors[s + 2]
  }

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

  return { brain, cubePos, cubeCol, dustCol }
}
