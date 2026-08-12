// The per-frame particle pass for the journey, kept out of the component:
// every grain blends between three destinations (loose dust, the brain,
// the cube) by its own staggered mix, gets pushed around by the cursor,
// and takes the color and grain size of whatever it currently is. Neural
// heat only applies to the brain state.

import { Color, MathUtils, Vector3 } from 'three'
import { INK, VIOLET, WAVE_BAND } from './net-geometry'
import { KIND_CORE } from './cube-figure'

export interface FrameInput {
  count: number
  t: number
  fB: number
  fC: number
  waves: number
  local: Vector3
  scratch: Color
  // destinations
  base: Float32Array
  scatter: Float32Array
  stagger: Float32Array
  phase: Float32Array
  cubePos: Float32Array
  // palettes and grain sizes
  dustCol: Float32Array
  brainCol: Float32Array
  cubeCol: Float32Array
  brainSize: Float32Array
  cubeSize: Float32Array
  cubeKind: Uint8Array
  // live buffers
  pos: Float32Array
  col: Float32Array
  size: Float32Array
  // neural activity
  flash: Float32Array
  wave: { ox: number; oy: number; oz: number; front: number }
  touch: { ox: number; oy: number; oz: number; front: number }
}

export function updateParticles(p: FrameInput): void {
  const { count, t, fB, fC, waves, local, scratch, pos, col, size } = p
  const doWaves = waves > 0.02
  const touchLive = p.touch.front < 5

  for (let i = 0; i < count; i++) {
    const j = i * 3
    // Staggered formation so shapes stream instead of snapping; a few
    // percent never join, staying ambient grains around the scene.
    const amb = p.stagger[i] > 0.94
    const st = p.stagger[i] * 0.35
    const fb = amb ? 0 : MathUtils.clamp((fB - st) / 0.65, 0, 1)
    const fc = amb ? 0 : MathUtils.clamp((fC - st) / 0.65, 0, 1)
    const fd = Math.max(0, 1 - fb - fc)
    const wob = 0.03 + 0.3 * fd

    let tx =
      p.scatter[j] * 0.75 * fd +
      p.base[j] * fb +
      p.cubePos[j] * fc +
      Math.sin(t * 0.5 + p.phase[i]) * wob
    let ty =
      p.scatter[j + 1] * 0.75 * fd +
      p.base[j + 1] * fb +
      p.cubePos[j + 1] * fc +
      Math.cos(t * 0.4 + p.phase[i] * 1.3) * wob
    let tz =
      p.scatter[j + 2] * 0.75 * fd +
      p.base[j + 2] * fb +
      p.cubePos[j + 2] * fc +
      Math.sin(t * 0.6 + p.phase[i] * 0.7) * wob

    // Grains shy away from the cursor - stronger once they belong to a shape.
    const rx = tx - local.x
    const ry = ty - local.y
    const rz = tz - local.z
    const rd2 = rx * rx + ry * ry + rz * rz
    if (rd2 < 0.85) {
      const rd = Math.sqrt(rd2) || 0.001
      const f = ((0.95 - rd) / 0.95) * (0.28 + 0.38 * (fb + fc))
      tx += (rx / rd) * f
      ty += (ry / rd) * f
      tz += (rz / rd) * f
    }
    pos[j] += (tx - pos[j]) * 0.1
    pos[j + 1] += (ty - pos[j + 1]) * 0.1
    pos[j + 2] += (tz - pos[j + 2]) * 0.1

    // Neural heat: the traveling wavefronts, plus pulse arrivals.
    let heat = 0
    if (doWaves && fb > 0.3) {
      const dx = p.base[j] - p.wave.ox
      const dy = p.base[j + 1] - p.wave.oy
      const dz = p.base[j + 2] - p.wave.oz
      const da = Math.sqrt(dx * dx + dy * dy + dz * dz)
      heat = MathUtils.clamp(1 - Math.abs(da - p.wave.front) / WAVE_BAND, 0, 1) * 0.8
      if (touchLive) {
        const ex = p.base[j] - p.touch.ox
        const ey = p.base[j + 1] - p.touch.oy
        const ez = p.base[j + 2] - p.touch.oz
        const dt = Math.sqrt(ex * ex + ey * ey + ez * ez)
        heat = Math.max(heat, MathUtils.clamp(1 - Math.abs(dt - p.touch.front) / WAVE_BAND, 0, 1))
      }
      heat *= waves * fb
    }
    if (p.flash[i] > 0.02) heat = Math.max(heat, p.flash[i] * 0.65 * fb)

    scratch
      .setRGB(
        p.dustCol[j] * fd + p.brainCol[j] * fb + p.cubeCol[j] * fc,
        p.dustCol[j + 1] * fd + p.brainCol[j + 1] * fb + p.cubeCol[j + 1] * fc,
        p.dustCol[j + 2] * fd + p.brainCol[j + 2] * fb + p.cubeCol[j + 2] * fc
      )
      .lerp(INK, Math.min(1, heat * 1.4))
      .lerp(VIOLET, heat * 0.85)
    col[j] = scratch.r
    col[j + 1] = scratch.g
    col[j + 2] = scratch.b

    // Grain size follows the shape the particle currently belongs to;
    // the cube's core breathes so the object feels powered.
    const pulse = p.cubeKind[i] === KIND_CORE ? 1 + Math.sin(t * 2.1 + p.phase[i]) * 0.3 : 1
    const target = p.brainSize[i] * (1 - fc) + p.cubeSize[i] * pulse * fc
    size[i] += (target - size[i]) * 0.12
  }
}
