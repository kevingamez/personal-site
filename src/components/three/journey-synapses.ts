// Per-frame rewrite of the synapse line buffers: two endpoints per edge,
// positions and colours. Split out of BrainJourney.tsx to keep it under the
// repo's 300-line cap.

export function updateSynapses(
  edges: [number, number][],
  pos: Float32Array,
  col: Float32Array,
  lpos: Float32Array,
  lcol: Float32Array
): void {
  // Written as an indexed loop with the two endpoints unrolled. The `for
  // (const [off, n] of [[0, a2], [3, b2]] as const)` this replaces looked
  // free because of `as const`, but that is a type-level assertion only:
  // it allocated three arrays plus an iterator per edge per frame, and
  // there are 25773 edges, so ~77k allocations every frame at 60fps.
  for (let i2 = 0; i2 < edges.length; i2++) {
    const a2 = edges[i2][0]
    const b2 = edges[i2][1]
    const ea = i2 * 6
    // Collapse stretched segments (an endpoint still out in the dust)
    // so no long streaks cross the scene while shapes form.
    const ddx = pos[a2 * 3] - pos[b2 * 3]
    const ddy = pos[a2 * 3 + 1] - pos[b2 * 3 + 1]
    const ddz = pos[a2 * 3 + 2] - pos[b2 * 3 + 2]
    const cut = ddx * ddx + ddy * ddy + ddz * ddz > 0.36
    // endpoint A (offset 0): `m` is a2 either way
    lpos[ea] = pos[a2 * 3]
    lpos[ea + 1] = pos[a2 * 3 + 1]
    lpos[ea + 2] = pos[a2 * 3 + 2]
    lcol[ea] = col[a2 * 3]
    lcol[ea + 1] = col[a2 * 3 + 1]
    lcol[ea + 2] = col[a2 * 3 + 2]
    // endpoint B (offset 3): collapses onto a2 when the segment is cut,
    // but keeps its own colour, exactly as before.
    const m = cut ? a2 : b2
    lpos[ea + 3] = pos[m * 3]
    lpos[ea + 4] = pos[m * 3 + 1]
    lpos[ea + 5] = pos[m * 3 + 2]
    lcol[ea + 3] = col[b2 * 3]
    lcol[ea + 4] = col[b2 * 3 + 1]
    lcol[ea + 5] = col[b2 * 3 + 2]
  }
}
