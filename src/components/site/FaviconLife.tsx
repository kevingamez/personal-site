'use client'

import { useEffect } from 'react'

// Living favicon: /favicon.svg draws the K as a Game of Life seed (same B3/S23
// rules as the home hero). Once a minute the tab icon evolves a few
// generations, then reseeds back to the K. Progressive enhancement only:
// reduced-motion users, hidden tabs, and browsers that ignore dynamic favicons
// (Safari) simply keep the static K.

const GRID = 9
const CELL = 4
const GENS = 6
const STEP_MS = 600
const BURST_EVERY_MS = 60_000

const SEED: string[] = []
for (let r = 1; r <= 7; r++) SEED.push(`1,${r}`, `2,${r}`)
SEED.push('6,1', '5,2', '4,3', '3,4', '4,5', '5,6', '6,7')
const ACCENT = '6,7'

function step(prev: Set<string>): Set<string> {
  const counts = new Map<string, number>()
  for (const key of prev) {
    const [x, y] = key.split(',').map(Number)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue
        const nk = `${nx},${ny}`
        counts.set(nk, (counts.get(nk) ?? 0) + 1)
      }
    }
  }
  const next = new Set<string>()
  for (const [key, n] of counts) {
    if (n === 3 || (n === 2 && prev.has(key))) next.add(key)
  }
  return next
}

export function FaviconLife() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    if (!link) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = GRID * CELL
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const staticHref = link.href
    const dark = matchMedia('(prefers-color-scheme: dark)')

    const draw = (cells: Set<string>, gen: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const key of cells) {
        const [x, y] = key.split(',').map(Number)
        ctx.fillStyle =
          gen === 0 && key === ACCENT
            ? dark.matches
              ? '#3d5afe'
              : '#0500ff'
            : dark.matches
              ? '#ecebe6'
              : '#161616'
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
      }
      link.type = 'image/png'
      link.href = canvas.toDataURL('image/png')
    }

    const restore = () => {
      link.type = 'image/svg+xml'
      link.href = staticHref
    }

    let cells = new Set(SEED)
    let gen = 0
    let stepTimer: ReturnType<typeof setInterval> | undefined

    const burst = () => {
      if (document.hidden || stepTimer) return
      stepTimer = setInterval(() => {
        if (gen >= GENS || cells.size === 0) {
          clearInterval(stepTimer)
          stepTimer = undefined
          cells = new Set(SEED)
          gen = 0
          restore()
          return
        }
        cells = step(cells)
        gen++
        draw(cells, gen)
      }, STEP_MS)
    }

    const burstTimer = setInterval(burst, BURST_EVERY_MS)
    return () => {
      clearInterval(burstTimer)
      if (stepTimer) clearInterval(stepTimer)
      restore()
    }
  }, [])

  return null
}
