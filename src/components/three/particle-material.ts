// Shared particle look, matched to the reference site's field: soft round
// dots with a feathered edge and per-particle sizes (fine dust plus a few
// larger glints), instead of three.js's default hard square points.
// Geometry contract: `position`, `color`, and a float `aSize` attribute.

import { AdditiveBlending, NormalBlending, ShaderMaterial } from 'three'

export function makeParticleMaterial(opts: {
  additive?: boolean
  opacity?: number
  pixelRatio?: number
}): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: opts.additive ? AdditiveBlending : NormalBlending,
    vertexColors: true,
    uniforms: {
      uOpacity: { value: opts.opacity ?? 1 },
      uPx: { value: opts.pixelRatio ?? 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      varying vec3 vColor;
      uniform float uPx;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPx * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c) * 2.0;
        float a = smoothstep(1.0, 0.3, d);
        if (a < 0.02) discard;
        gl_FragColor = vec4(vColor, a * uOpacity);
      }
    `,
  })
}

// Per-particle size mix: mostly fine dust, a sprinkle of larger glints -
// the same size rhythm as the reference figure. `rand` is the caller's
// deterministic generator so the mix is stable across mounts.
export function buildSizes(count: number, rand: () => number, scale = 1): Float32Array {
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const big = rand() < 0.12
    sizes[i] = (big ? 0.075 + rand() * 0.075 : 0.028 + rand() * 0.03) * scale
  }
  return sizes
}
