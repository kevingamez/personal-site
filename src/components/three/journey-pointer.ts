// Window-level pointer handling for the dust journey: keeps the cursor in
// world and normalized coordinates, and turns pointer drags into figure
// spin when the grab starts over the figure.

import { useEffect } from 'react'
import type { Group } from 'three'

export interface DragState {
  on: boolean
  vx: number
  vy: number
  px: number
  py: number
}

export interface CursorState {
  x: number
  y: number
  nx: number
  ny: number
}

export function useJourneyPointer(
  worldH: number,
  figureR: number,
  group: { current: Group | null },
  drag: { current: DragState },
  cursor: { current: CursorState }
) {
  useEffect(() => {
    const toWorld = (sx: number, sy: number): [number, number] => {
      const aspect = window.innerWidth / window.innerHeight
      return [
        (sx / window.innerWidth - 0.5) * worldH * aspect,
        (0.5 - sy / window.innerHeight) * worldH,
      ]
    }
    const overFigure = (sx: number, sy: number): boolean => {
      const g = group.current
      if (!g) return false
      const [wx, wy] = toWorld(sx, sy)
      const r = g.scale.x * figureR * 1.8
      return Math.abs(wx - g.position.x) < r && Math.abs(wy - g.position.y) < r
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !overFigure(e.clientX, e.clientY)) return
      drag.current.on = true
      drag.current.px = e.clientX
      drag.current.py = e.clientY
      document.documentElement.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      const [wx, wy] = toWorld(e.clientX, e.clientY)
      cursor.current.x = wx
      cursor.current.y = wy
      cursor.current.nx = (e.clientX / window.innerWidth) * 2 - 1
      cursor.current.ny = -(e.clientY / window.innerHeight) * 2 + 1
      if (!drag.current.on) return
      drag.current.vy = (e.clientX - drag.current.px) * 0.005
      drag.current.vx = (e.clientY - drag.current.py) * 0.005
      drag.current.px = e.clientX
      drag.current.py = e.clientY
    }
    const up = () => {
      if (!drag.current.on) return
      drag.current.on = false
      document.documentElement.style.cursor = ''
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [worldH, figureR, group, drag, cursor])
}
