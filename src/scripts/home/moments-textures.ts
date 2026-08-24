// Canvas textures for the moment cards: the paper the stock is printed on, the
// two-way back, and the photographic print itself. All procedural, so they stay
// crisp at any size and cost no network requests.

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

export const TW = 512
export const TH = 716

const STOCK = '#f6f2e7'
const INK = '#9d2129'

// Laid lines plus tooth, used as bump and roughness. Without it the cards are
// perfect planes and read as plastic rather than card stock.
export function paperMap(): CanvasTexture {
  // 256, not 512. This loop is per-pixel with four trig calls, so at 512 it
  // cost 39ms of the deck's 77ms build on a 4x-throttled machine - the single
  // most expensive thing in it. The frequencies below are doubled to match, so
  // the laid lines land at the same spacing across the card and only the tooth
  // samples coarser, which is invisible on a bump and roughness map.
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const x = c.getContext('2d')!
  const im = x.createImageData(S, S)
  for (let i = 0; i < S * S; i++) {
    const px = i % S
    const py = (i / S) | 0
    let v = 132
    v += (Math.random() - 0.5) * 30
    v += Math.sin(py * 1.24 + Math.sin(px * 0.18) * 3.1) * 6
    v += Math.sin(px * 1.66 + Math.sin(py * 0.22) * 2.6) * 4
    const k = i * 4
    im.data[k] = im.data[k + 1] = im.data[k + 2] = v < 0 ? 0 : v > 255 ? 255 : v
    im.data[k + 3] = 255
  }
  x.putImageData(im, 0, 0)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(2, 2.8)
  return t
}

function roundRect(
  x: CanvasRenderingContext2D,
  px: number,
  py: number,
  pw: number,
  ph: number,
  r: number
): void {
  x.beginPath()
  x.moveTo(px + r, py)
  x.arcTo(px + pw, py, px + pw, py + ph, r)
  x.arcTo(px + pw, py + ph, px, py + ph, r)
  x.arcTo(px, py + ph, px, py, r)
  x.arcTo(px, py, px + pw, py, r)
  x.closePath()
}

// A real playing card is ONE ink on white with a white border, and the ornament
// is the stock showing through the ink, not white drawn on top. Two-way
// symmetric so it reads the same whichever end is up.
export function backTexture(): CanvasTexture {
  const W = 768
  const H = 1072
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!

  x.fillStyle = STOCK
  x.fillRect(0, 0, W, H)

  const bx = 52
  const by = 62
  const bw = W - bx * 2
  const bh = H - by * 2
  x.fillStyle = INK
  roundRect(x, bx, by, bw, bh, 26)
  x.fill()

  x.save()
  roundRect(x, bx + 9, by + 9, bw - 18, bh - 18, 18)
  x.clip()

  x.strokeStyle = STOCK
  x.lineWidth = 3.2
  const S = 46
  for (let d = -H; d < W + H; d += S) {
    x.beginPath()
    x.moveTo(d, by)
    x.lineTo(d + bh, by + bh)
    x.stroke()
    x.beginPath()
    x.moveTo(d, by + bh)
    x.lineTo(d + bh, by)
    x.stroke()
  }

  const petal = (px: number, py: number, rr: number): void => {
    x.beginPath()
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2
      x.moveTo(px, py)
      x.quadraticCurveTo(
        px + Math.cos(a - 0.5) * rr * 1.5,
        py + Math.sin(a - 0.5) * rr * 1.5,
        px + Math.cos(a) * rr,
        py + Math.sin(a) * rr
      )
      x.quadraticCurveTo(
        px + Math.cos(a + 0.5) * rr * 1.5,
        py + Math.sin(a + 0.5) * rr * 1.5,
        px,
        py
      )
    }
    x.fill()
  }
  x.fillStyle = STOCK
  for (let py = by - S; py < by + bh + S; py += S) {
    for (let px = bx - S; px < bx + bw + S; px += S) petal(px, py, 11)
  }
  // knock the ink back in, which is what makes the lattice read as woven
  x.fillStyle = INK
  for (let py = by - S; py < by + bh + S; py += S) {
    for (let px = bx - S; px < bx + bw + S; px += S) petal(px + S / 2, py + S / 2, 7)
  }
  x.restore()

  x.strokeStyle = STOCK
  x.lineWidth = 5
  roundRect(x, bx + 13, by + 13, bw - 26, bh - 26, 16)
  x.stroke()
  x.lineWidth = 1.6
  roundRect(x, bx + 23, by + 23, bw - 46, bh - 46, 10)
  x.stroke()

  const cx = W / 2
  const cy = H / 2
  x.fillStyle = STOCK
  x.beginPath()
  x.ellipse(cx, cy, 104, 146, 0, 0, Math.PI * 2)
  x.fill()
  x.strokeStyle = INK
  x.lineWidth = 4
  x.stroke()
  x.lineWidth = 1.4
  x.beginPath()
  x.ellipse(cx, cy, 93, 134, 0, 0, Math.PI * 2)
  x.stroke()
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  for (const flip of [0, Math.PI]) {
    x.save()
    x.translate(cx, cy)
    x.rotate(flip)
    x.fillStyle = INK
    x.font = '400 54px "Iowan Old Style", Palatino, Georgia, serif'
    x.fillText('KG', 0, -52)
    x.strokeStyle = INK
    x.lineWidth = 1.4
    x.beginPath()
    x.moveTo(-32, -22)
    x.lineTo(32, -22)
    x.stroke()
    x.restore()
  }

  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 8
  return t
}

// Card draws wait their turn: one per animation frame, so nine photographs
// arriving at once cannot stack nine canvas passes and nine texture uploads
// into a single frame.
const drawQueue: (() => void)[] = []
let draining = false

function queueDraw(job: () => void): void {
  drawQueue.push(job)
  if (draining) return
  draining = true
  const step = (): void => {
    drawQueue.shift()?.()
    if (drawQueue.length) requestAnimationFrame(step)
    else draining = false
  }
  requestAnimationFrame(step)
}

// An archival print: image high in a wide mat, place and date letterpressed
// into the foot. `scale` draws the same layout at print resolution for the card
// the visitor is holding, which is the only one big enough to show the seams.
export function frontTexture(src: string, meta: string, tint: string, scale = 1): CanvasTexture {
  const w = Math.round(TW * scale)
  const h = Math.round(TH * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.fillStyle = tint
  x.fillRect(0, 0, w, h)
  x.scale(scale, scale)

  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8

  const padX = 30
  const padTop = 30
  const padBot = 86
  const bw = TW - padX * 2
  const bh = TH - padTop - padBot

  const img = new Image()
  // Nine of these resolve together, and each one draws a 512x716 canvas and
  // then hands the GPU a fresh texture. Landing them in one task froze a scroll
  // frame for 406ms, so they take a frame each. `decoding` keeps the JPEG
  // decode itself off the main thread.
  img.decoding = 'async'
  img.onload = () =>
    queueDraw(() => {
      const r = Math.max(bw / img.width, bh / img.height)
      const dw = img.width * r
      const dh = img.height * r
      x.save()
      x.beginPath()
      x.rect(padX, padTop, bw, bh)
      x.clip()
      x.drawImage(img, padX + (bw - dw) / 2, padTop + (bh - dh) / 2, dw, dh)
      x.restore()
      // the impression a press leaves around a plate
      x.strokeStyle = 'rgba(11,11,12,0.55)'
      x.lineWidth = 1
      x.strokeRect(padX + 0.5, padTop + 0.5, bw - 1, bh - 1)
      x.strokeStyle = 'rgba(11,11,12,0.10)'
      x.lineWidth = 3
      x.strokeRect(padX - 3.5, padTop - 3.5, bw + 7, bh + 7)

      x.fillStyle = 'rgba(40,36,30,0.78)'
      x.textAlign = 'center'
      x.font = '500 15px ui-monospace, Menlo, monospace'
      x.fillText(meta.toUpperCase(), TW / 2, TH - padBot + 40)
      x.strokeStyle = 'rgba(40,36,30,0.22)'
      x.lineWidth = 1
      x.beginPath()
      x.moveTo(TW / 2 - 46, TH - padBot + 56)
      x.lineTo(TW / 2 + 46, TH - padBot + 56)
      x.stroke()
      tex.needsUpdate = true
    })
  img.src = src
  return tex
}
