// The scene behind the moment cards: geometry, materials, placement and light.
// The card swarm sits AROUND the camera, so you are inside it looking out.

import {
  DirectionalLight,
  ExtrudeGeometry,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three'
import { MOMENTS } from '@/data/moments'
import { backTexture, frontTexture, paperMap } from './moments-textures'

const CW = 0.82
const CH = 1.15
const CT = 0.011
const RAD = 0.05
const TINTS = ['#f7f3e9', '#f4efe3', '#f8f5ec', '#f2ede0', '#f6f1e6']

export interface Card {
  mesh: Mesh
  photo: number
  dir: Vector3
  axis: Vector3
  radius: number
  speed: number
  phase: number
  swing: number
  rate: number
  ang: number
  revolve: boolean
  scl: number
}

// A card is cut with rounded corners; Extrude puts both caps in one group, so
// they are split apart to give the photo and the back their own material.
function cardGeometry(): BufferGeometry {
  const w = CW / 2
  const h = CH / 2
  const s = new Shape()
  s.moveTo(-w + RAD, -h)
  s.lineTo(w - RAD, -h)
  s.quadraticCurveTo(w, -h, w, -h + RAD)
  s.lineTo(w, h - RAD)
  s.quadraticCurveTo(w, h, w - RAD, h)
  s.lineTo(-w + RAD, h)
  s.quadraticCurveTo(-w, h, -w, h - RAD)
  s.lineTo(-w, -h + RAD)
  s.quadraticCurveTo(-w, -h, -w + RAD, -h)

  const g = new ExtrudeGeometry(s, { depth: CT, bevelEnabled: false, curveSegments: 9 })
  g.translate(0, 0, -CT / 2)
  const caps = g.groups[0]
  const rimStart = caps.start + caps.count
  const rimCount = g.groups[1] ? g.groups[1].count : g.attributes.position.count - rimStart
  const half = caps.count / 2
  g.clearGroups()
  // Extrude emits the z=0 cap (normal -Z) first, then the z=depth cap.
  g.addGroup(caps.start, half, 1)
  g.addGroup(caps.start + half, half, 0)
  g.addGroup(rimStart, rimCount, 2)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < caps.count; i++) {
    uv.setXY(i, (pos.getX(i) + w) / CW, (pos.getY(i) + h) / CH)
  }
  uv.needsUpdate = true
  return g
}

export interface Built {
  scene: Scene
  camera: PerspectiveCamera
  swarm: Group
  cards: Card[]
  meshes: Mesh[]
  heldMats: MeshBasicMaterial[]
  frontMats: MeshPhysicalMaterial[]
  bigFor: (i: number) => void
  dispose: () => void
}

export function build(width: number, height: number): Built {
  const scene = new Scene()
  scene.fog = new FogExp2(0x090808, 0.062)
  const swarm = new Group()
  scene.add(swarm)

  const camera = new PerspectiveCamera(42, width / height, 0.08, 100)
  camera.position.set(0, 0, 0.001)

  const paper = paperMap()
  const back = backTexture()
  const frontTex = MOMENTS.map((m, i) => frontTexture(m.src, m.place, TINTS[i % TINTS.length]))

  const backMat = new MeshPhysicalMaterial({
    map: back,
    bumpMap: paper,
    bumpScale: 0.5,
    roughnessMap: paper,
    roughness: 0.78,
    metalness: 0,
    envMapIntensity: 0.2,
  })
  const edgeMat = new MeshPhysicalMaterial({
    color: 0xded4bd,
    bumpMap: paper,
    bumpScale: 0.7,
    roughness: 0.95,
    metalness: 0,
  })
  const frontMats = frontTex.map(
    (map) =>
      new MeshPhysicalMaterial({
        map,
        bumpMap: paper,
        bumpScale: 0.22,
        roughnessMap: paper,
        roughness: 0.95,
        metalness: 0,
        envMapIntensity: 0.2,
      })
  )
  // The held card is unlit and untone-mapped: a photograph is the image itself,
  // not a surface to light. Lighting it is what washed the colour out.
  const heldMats = frontTex.map((map) => new MeshBasicMaterial({ map, toneMapped: false }))
  const bigDone = new Set<number>()
  const bigFor = (i: number): void => {
    if (bigDone.has(i)) return
    bigDone.add(i)
    const m = MOMENTS[i]
    heldMats[i].map = frontTexture(m.src, m.place, TINTS[i % TINTS.length], 2)
    heldMats[i].needsUpdate = true
  }

  const geo = cardGeometry()
  const N = 58
  let seed = 20260813
  const rnd = (): number => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296

  // Placement with a guaranteed gap. A card is bounded by a sphere of its half
  // diagonal times the largest scale it ever takes, which is orientation-blind,
  // so tilt and spin are free. Candidates that would come closer than two of
  // those spheres are rejected outright: banded radii alone do NOT prevent this,
  // because two cards in the same band can sit a hair apart in depth and still
  // cross once they tilt.
  const HALF_DIAG = Math.hypot(CW / 2, CH / 2)
  const CLEAR = 2 * HALF_DIAG * 1.2 + 0.12
  const taken: Vector3[] = []
  const cards: Card[] = []
  const p = new Vector3()

  for (let i = 0; i < N && cards.length < N; i++) {
    let dir: Vector3 | null = null
    let radius = 0
    for (let tries = 0; tries < 90; tries++) {
      const az = rnd() * Math.PI * 2
      const th = 0.66 * Math.sqrt(rnd())
      const cand = new Vector3(
        Math.cos(az) * Math.sin(th),
        Math.sin(az) * Math.sin(th),
        -Math.cos(th)
      )
      const r = 5.7 + rnd() * 7.9
      p.copy(cand).multiplyScalar(r)
      let ok = true
      for (const q of taken) {
        if (p.distanceTo(q) < CLEAR) {
          ok = false
          break
        }
      }
      if (ok) {
        dir = cand
        radius = r
        break
      }
    }
    if (!dir) continue
    taken.push(p.clone())

    const pi = cards.length % MOMENTS.length
    const mesh = new Mesh(geo, [frontMats[pi], backMat, edgeMat])
    cards.push({
      mesh,
      photo: pi,
      dir,
      // The orbit axis is the card's own direction, so it SPINS IN PLACE rather
      // than sweeping through where its neighbours live. That is what keeps the
      // guarantee true over time and not just at the first frame.
      axis: dir.clone(),
      radius,
      speed: (0.05 + 0.11 * rnd()) * (rnd() < 0.5 ? 1 : -1),
      phase: rnd() * Math.PI * 2,
      swing: 0.75 + 0.6 * rnd(),
      rate: (0.078 + 0.2 * rnd()) * (rnd() < 0.5 ? 1 : -1),
      ang: rnd() * 6.283,
      revolve: rnd() < 0.28,
      scl: 1,
    })
    mesh.userData.i = cards.length - 1
    swarm.add(mesh)
  }

  // Flat, even light. The environment map is what makes a surface shine, so it
  // stays low; brightness comes from the hemisphere, which has no highlight.
  scene.add(new HemisphereLight(0xdfe4f2, 0x191920, 0.9))
  const key = new DirectionalLight(0xfff6ea, 0.42)
  key.position.set(2, 3.5, 4)
  scene.add(key)
  const fill = new DirectionalLight(0xa8b4dc, 0.22)
  fill.position.set(-3, -1.5, -2)
  scene.add(fill)

  const dispose = (): void => {
    geo.dispose()
    back.dispose()
    paper.dispose()
    frontTex.forEach((t) => t.dispose())
    ;[backMat, edgeMat, ...frontMats, ...heldMats].forEach((m: Material) => m.dispose())
  }

  return {
    scene,
    camera,
    swarm,
    cards,
    meshes: cards.map((c) => c.mesh),
    heldMats,
    frontMats,
    bigFor,
    dispose,
  }
}

export const FRONT = new Vector3(0, 0.05, -2.55)
