// Conway's Game of Life — hero canvas on the home page.
// Identical behaviour to the original inline IIFE; just typed and module-scoped.
// Stamp patterns (glider/lwss/pulsar/gun) live in `./stamps`.

import { STAMPS, type Stamp } from './stamps'

export function initConway(): void {
  const c = document.getElementById('gol') as HTMLCanvasElement | null
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const COLS = 64
  const ROWS = 64
  let grid = new Uint8Array(COLS * ROWS)
  let next = new Uint8Array(COLS * ROWS)
  const trail = new Float32Array(COLS * ROWS)
  let gen = 0
  let paused = false
  let lastFrame = performance.now()
  let frameCount = 0
  let fpsTimer = 0

  const css = getComputedStyle(document.documentElement)
  const BG = (css.getPropertyValue('--cream-2') || '#f3ede2').trim()
  const FG = (css.getPropertyValue('--ink') || '#1f1d1a').trim()
  const TR = (css.getPropertyValue('--coral') || '#d96944').trim()

  function seed(): void {
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.18 ? 1 : 0
    trail.fill(0)
    gen = 0
  }

  function resize(): void {
    if (!c) return
    const r = c.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.max(1, Math.floor(r.width * dpr))
    c.height = Math.max(1, Math.floor(r.height * dpr))
  }

  function step(): void {
    let alive = 0
    for (let y = 0; y < ROWS; y++) {
      const ym = (y - 1 + ROWS) % ROWS
      const yp = (y + 1) % ROWS
      for (let x = 0; x < COLS; x++) {
        const xm = (x - 1 + COLS) % COLS
        const xp = (x + 1) % COLS
        const n =
          grid[ym * COLS + xm] +
          grid[ym * COLS + x] +
          grid[ym * COLS + xp] +
          grid[y * COLS + xm] +
          grid[y * COLS + xp] +
          grid[yp * COLS + xm] +
          grid[yp * COLS + x] +
          grid[yp * COLS + xp]
        const cur = grid[y * COLS + x]
        const nv = (cur && (n === 2 || n === 3)) || (!cur && n === 3) ? 1 : 0
        if (cur && !nv) trail[y * COLS + x] = 1
        next[y * COLS + x] = nv
        if (nv) alive++
      }
    }
    ;[grid, next] = [next, grid]
    for (let i = 0; i < trail.length; i++) trail[i] *= 0.88
    gen++
    const genEl = document.getElementById('gol-gen')
    const aliveEl = document.getElementById('gol-alive')
    if (genEl) genEl.textContent = String(gen)
    if (aliveEl) aliveEl.textContent = String(alive)
  }

  function draw(): void {
    if (!ctx || !c) return
    const W = c.width
    const H = c.height
    const cw = W / COLS
    const ch = H / ROWS
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const t = trail[y * COLS + x]
        if (t > 0.08) {
          ctx.globalAlpha = t * 0.55
          ctx.fillStyle = TR
          ctx.fillRect(x * cw, y * ch, cw, ch)
        }
      }
    ctx.globalAlpha = 1
    ctx.fillStyle = FG
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if (grid[y * COLS + x]) ctx.fillRect(x * cw + 0.5, y * ch + 0.5, cw - 1, ch - 1)
      }
  }

  // prefers-reduced-motion: don't drive the simulation, render a single frame.
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  let rafId: number | null = null
  let acc = 0

  function loop(t: number): void {
    const dt = t - lastFrame
    lastFrame = t
    fpsTimer += dt
    frameCount++
    if (fpsTimer > 500) {
      const fps = Math.round((1000 * frameCount) / fpsTimer)
      const fpsEl = document.getElementById('gol-fps')
      if (fpsEl) fpsEl.textContent = String(fps)
      fpsTimer = 0
      frameCount = 0
    }
    if (!paused) {
      acc += dt
      if (acc >= 130) {
        step()
        acc = 0
      }
    }
    draw()
    rafId = requestAnimationFrame(loop)
  }

  function start(): void {
    if (rafId !== null) return
    lastFrame = performance.now()
    rafId = requestAnimationFrame(loop)
  }
  function stop(): void {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = null
  }

  let curStamp = 'glider'
  document.querySelectorAll<HTMLElement>('.gol-stamp').forEach((b) => {
    b.addEventListener('click', () => {
      curStamp = b.dataset.stamp || 'glider'
      document.querySelectorAll('.gol-stamp').forEach((x) => x.classList.remove('on'))
      b.classList.add('on')
      if (curStamp === 'clear') {
        grid.fill(0)
        trail.fill(0)
        gen = 0
        if (mq.matches) draw()
      }
    })
  })

  c.addEventListener('click', (e) => {
    const r = c.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * COLS)
    const y = Math.floor(((e.clientY - r.top) / r.height) * ROWS)
    if (curStamp === 'clear') {
      grid.fill(0)
      trail.fill(0)
      gen = 0
      if (mq.matches) draw()
      return
    }
    const pat = STAMPS[curStamp]
    const stamp = pat && pat !== 'clear' ? pat : (STAMPS.glider as Stamp)
    for (const [dx, dy] of stamp) {
      const xx = (x + dx) % COLS
      const yy = (y + dy + ROWS) % ROWS
      grid[(((yy % ROWS) + ROWS) % ROWS) * COLS + (((xx % COLS) + COLS) % COLS)] = 1
    }
    if (mq.matches) draw()
  })

  const pauseBtn = document.getElementById('gol-pause')
  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      paused = !paused
      const target = e.currentTarget as HTMLElement
      target.textContent = paused ? '▶' : '⏸'
    })
  }
  const resetBtn = document.getElementById('gol-reset')
  if (resetBtn) resetBtn.addEventListener('click', seed)

  resize()
  window.addEventListener('resize', resize)
  seed()
  if (!mq.matches) start()
  else draw()

  mq.addEventListener('change', () => {
    if (mq.matches) {
      stop()
      draw()
    } else {
      start()
    }
  })
}
