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
const BURST_EVERY_MS = 30_000

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
    const head = document.head
    const staticLinks = Array.from(head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]'))
    if (staticLinks.length === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = GRID * CELL
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dark = matchMedia('(prefers-color-scheme: dark)')
    let animLink: HTMLLinkElement | null = null

    // Chrome scores every rel=icon candidate and often keeps showing a static
    // one, and it repaints the tab far more reliably on link-node swaps than
    // on href mutation. So a burst frame removes the static links and inserts
    // one fresh node (the favico.js technique); restore() puts them back.
    const showFrame = (cells: Set<string>, gen: number) => {
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
      for (const l of staticLinks) l.remove()
      animLink?.remove()
      animLink = document.createElement('link')
      animLink.rel = 'icon'
      animLink.type = 'image/png'
      animLink.href = canvas.toDataURL('image/png')
      head.appendChild(animLink)
    }

    const restore = () => {
      animLink?.remove()
      animLink = null
      for (const l of staticLinks) {
        if (!l.isConnected) head.appendChild(l)
      }
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
        showFrame(cells, gen)
      }, STEP_MS)
    }

    // First burst soon after load so the icon is discoverable, then one
    // evolution every half minute.
    const firstTimer = setTimeout(burst, 3_000)
    const burstTimer = setInterval(burst, BURST_EVERY_MS)
    return () => {
      clearTimeout(firstTimer)
      clearInterval(burstTimer)
      if (stepTimer) clearInterval(stepTimer)
      restore()
    }
  }, [])

  return null
}
