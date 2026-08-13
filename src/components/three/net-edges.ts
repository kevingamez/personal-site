// Synapse edges for the neural figure: for each node, the nearest few
// neighbours within reach. Split out of net-geometry.ts to keep both files
// under the repo's 300-line cap.

const LINKS_PER_NODE = 2
const LINK_MAX_DIST = 0.3

export function buildEdges(base: Float32Array, count: number): [number, number][] {
  // Synapses via a coarse spatial hash: nearest few neighbors within reach.
  //
  // The key is a packed integer, not a `${x},${y},${z}` template string. The
  // query loop visits 27 cells per node, so at 13000 nodes the string version
  // built 351,000 throwaway strings and hashed every one of them: 184ms of the
  // 200ms this function used to cost. Coordinates are normalized well inside
  // +-1 and the cell is LINK_MAX_DIST, so the per-axis cell index fits far
  // inside the +-512 that a 10-bit field allows.
  const cell = LINK_MAX_DIST
  const keyOf = (x: number, y: number, z: number): number =>
    ((Math.floor(x / cell) + 512) << 20) |
    ((Math.floor(y / cell) + 512) << 10) |
    (Math.floor(z / cell) + 512)
  const hash = new Map<number, number[]>()
  for (let i = 0; i < count; i++) {
    const k = keyOf(base[i * 3], base[i * 3 + 1], base[i * 3 + 2])
    const arr = hash.get(k)
    if (arr) arr.push(i)
    else hash.set(k, [i])
  }
  const edges: [number, number][] = []
  // Only the closest LINKS_PER_NODE neighbours survive, so the candidates are
  // tracked as a running top-2 instead of being collected into an array of
  // objects and sorted. Same output, no per-node allocation, no sort.
  const bestJ = new Int32Array(LINKS_PER_NODE)
  const bestD = new Float64Array(LINKS_PER_NODE)
  for (let i = 0; i < count; i++) {
    const x = base[i * 3]
    const y = base[i * 3 + 1]
    const z = base[i * 3 + 2]
    let found = 0
    for (let n = 0; n < LINKS_PER_NODE; n++) bestD[n] = Infinity
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
            if (d >= LINK_MAX_DIST) continue
            // Insertion into the sorted top-N, shifting the tail down.
            let slot = found < LINKS_PER_NODE ? found : LINKS_PER_NODE - 1
            if (d >= bestD[slot]) continue
            while (slot > 0 && bestD[slot - 1] > d) {
              bestD[slot] = bestD[slot - 1]
              bestJ[slot] = bestJ[slot - 1]
              slot--
            }
            bestD[slot] = d
            bestJ[slot] = j
            if (found < LINKS_PER_NODE) found++
          }
        }
    for (let n = 0; n < found; n++) edges.push([i, bestJ[n]])
  }
  return edges
}
