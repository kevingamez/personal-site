// Signal pulses for the brain: discrete impulses race along synapse
// edges, flash the neuron they arrive at, and hop onward through its
// connections - the classic neural-activity presentation. A fixed pool
// of pulse slots is recycled; deterministic LCG randomness.

import { BufferAttribute, BufferGeometry } from 'three'
import { VIOLET } from './net-geometry'

const MAX = 120

export class PulseLayer {
  geometry = new BufferGeometry()
  flash: Float32Array
  private count: number
  private edges: [number, number][]
  private adj: number[][]
  private edgeIdx = new Int32Array(MAX)
  private dir = new Int8Array(MAX)
  private t01 = new Float32Array(MAX)
  private speed = new Float32Array(MAX)
  private live = new Uint8Array(MAX)
  private seed = 7777

  constructor(edges: [number, number][], count: number) {
    this.edges = edges
    this.count = count
    this.flash = new Float32Array(count)
    this.adj = Array.from({ length: count }, () => [])
    edges.forEach(([a, b], i) => {
      this.adj[a].push(i)
      this.adj[b].push(i)
    })
    const pos = new Float32Array(MAX * 3).fill(9e3)
    const sizes = new Float32Array(MAX)
    const col = new Float32Array(MAX * 3)
    for (let i = 0; i < MAX; i++) {
      sizes[i] = 0.1 + this.rand() * 0.05
      col[i * 3] = VIOLET.r
      col[i * 3 + 1] = VIOLET.g
      col[i * 3 + 2] = VIOLET.b
    }
    this.geometry.setAttribute('position', new BufferAttribute(pos, 3))
    this.geometry.setAttribute('color', new BufferAttribute(col, 3))
    this.geometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
  }

  private rand(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296
    return this.seed / 4294967296
  }

  // A burst of impulses radiating out of one neuron - fired when the
  // visitor touches the body, so the cascade starts under their cursor.
  spawnAt(node: number, count: number): void {
    const es = this.adj[node]
    if (es.length === 0) return
    let spawned = 0
    for (let i = 0; i < MAX && spawned < count; i++) {
      if (this.live[i]) continue
      this.live[i] = 1
      this.edgeIdx[i] = es[Math.floor(this.rand() * es.length)]
      this.dir[i] = this.edges[this.edgeIdx[i]][0] === node ? 1 : -1
      this.t01[i] = 0
      this.speed[i] = 3.5 + this.rand() * 3
      spawned++
    }
  }

  // intensity 0..1 scales how many pulses stay alive; pos is the live
  // (displaced) particle position buffer so pulses ride the breathing body.
  update(dt: number, intensity: number, pos: Float32Array): void {
    const p = this.geometry.attributes.position.array as Float32Array
    const dec = Math.max(0, 1 - dt * 2.2)
    for (let i = 0; i < this.count; i++) this.flash[i] *= dec
    const want = Math.round(MAX * intensity)
    let alive = 0
    for (let i = 0; i < MAX; i++) alive += this.live[i]
    for (let i = 0; i < MAX && alive < want; i++) {
      if (this.live[i]) continue
      const es = this.adj[Math.floor(this.rand() * this.count)]
      if (es.length === 0) continue
      this.live[i] = 1
      this.edgeIdx[i] = es[Math.floor(this.rand() * es.length)]
      this.dir[i] = this.rand() < 0.5 ? 1 : -1
      this.t01[i] = 0
      this.speed[i] = 2.5 + this.rand() * 3
      alive++
    }
    for (let i = 0; i < MAX; i++) {
      const j = i * 3
      if (!this.live[i]) {
        p[j] = 9e3
        p[j + 1] = 9e3
        p[j + 2] = 9e3
        continue
      }
      this.t01[i] += dt * this.speed[i]
      let [a, b] = this.edges[this.edgeIdx[i]]
      if (this.dir[i] < 0) [a, b] = [b, a]
      if (this.t01[i] >= 1) {
        // Arrival: flash the neuron, then hop onward or die out.
        this.flash[b] = 1
        const es = this.adj[b]
        if (this.rand() < 0.78 && es.length > 0) {
          this.edgeIdx[i] = es[Math.floor(this.rand() * es.length)]
          this.dir[i] = this.edges[this.edgeIdx[i]][0] === b ? 1 : -1
          this.t01[i] = 0
          ;[a, b] = this.edges[this.edgeIdx[i]]
          if (this.dir[i] < 0) [a, b] = [b, a]
        } else {
          this.live[i] = 0
          continue
        }
      }
      const u = this.t01[i]
      p[j] = pos[a * 3] + (pos[b * 3] - pos[a * 3]) * u
      p[j + 1] = pos[a * 3 + 1] + (pos[b * 3 + 1] - pos[a * 3 + 1]) * u
      p[j + 2] = pos[a * 3 + 2] + (pos[b * 3 + 2] - pos[a * 3 + 2]) * u
    }
    this.geometry.attributes.position.needsUpdate = true
  }
}
