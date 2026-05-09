// ⌘P command palette — fuzzy file search across the virtual FS.

import { FS, PROJECT_NAME, type DirNode } from './state'
import { fuzzyScore } from './fuzzy'
import { esc } from './highlight'
import { openFile } from './editor'
import { isCenterWorkspace, setWorkspace } from './workspaces'
import { focusInput } from './terminal'
import { track } from '../lib/analytics'

type FileEntry = { path: string; name: string; score?: number }

let paletteEl: HTMLElement | null = null
let paletteInputEl: HTMLInputElement | null = null
let paletteListEl: HTMLElement | null = null
let paletteIdx = 0
let paletteResults: FileEntry[] = []
let paletteOpen = false

function flattenFiles(node: DirNode | { type: 'file' }, parts: string[], out: FileEntry[]): void {
  if (node.type === 'file') {
    out.push({ path: parts.join('/'), name: parts[parts.length - 1] })
  } else {
    for (const [name, child] of Object.entries(node.children)) {
      flattenFiles(child, [...parts, name], out)
    }
  }
}

function renderPalette(): void {
  if (!paletteListEl || !paletteInputEl) return
  const q = paletteInputEl.value.trim()
  const all: FileEntry[] = []
  const root = FS.children[PROJECT_NAME]
  if (root && root.type === 'dir') flattenFiles(root, [PROJECT_NAME], all)
  if (!q) {
    paletteResults = all.slice(0, 50)
  } else {
    paletteResults = all
      .map((f) => ({ ...f, score: fuzzyScore(q, f.path) }))
      .filter((f) => (f.score ?? -1) >= 0)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 50)
  }
  paletteIdx = Math.min(paletteIdx, Math.max(0, paletteResults.length - 1))
  paletteListEl.innerHTML = ''
  if (!paletteResults.length) {
    const div = document.createElement('div')
    div.className = 'palette-empty'
    div.textContent = 'no files match'
    paletteListEl.appendChild(div)
    return
  }
  paletteResults.forEach((r, i) => {
    const div = document.createElement('div')
    div.className = 'palette-item' + (i === paletteIdx ? ' on' : '')
    const dirPath = r.path.slice(0, r.path.length - r.name.length - 1)
    div.innerHTML =
      '<span class="pa-name">' +
      esc(r.name) +
      '</span>' +
      '<span class="pa-path">' +
      esc(dirPath) +
      '</span>'
    div.addEventListener('mousedown', (e) => {
      e.preventDefault()
      selectPalette(i)
    })
    paletteListEl?.appendChild(div)
  })
  const onItem = paletteListEl.children[paletteIdx] as HTMLElement | undefined
  onItem?.scrollIntoView?.({ block: 'nearest' })
}

export function openPalette(): void {
  if (!paletteEl || !paletteInputEl) return
  paletteEl.hidden = false
  paletteOpen = true
  paletteInputEl.value = ''
  paletteIdx = 0
  renderPalette()
  setTimeout(() => paletteInputEl?.focus(), 0)
  track<{ name: 'palette_open' }>('palette_open')
}

export function closePalette(): void {
  if (!paletteEl) return
  paletteEl.hidden = true
  paletteOpen = false
  focusInput()
}

function selectPalette(i: number): void {
  const file = paletteResults[i]
  if (!file) return closePalette()
  track<{ name: 'palette_select'; props: { path: string } }>('palette_select', { path: file.path })
  openFile(file.path.split('/'), 'palette')
  if (!isCenterWorkspace()) setWorkspace('workspace')
  closePalette()
}

export function isPaletteOpen(): boolean {
  return paletteOpen
}

export function initPalette(): void {
  paletteEl = document.getElementById('palette')
  paletteInputEl = document.getElementById('palette-input') as HTMLInputElement | null
  paletteListEl = document.getElementById('palette-list')

  if (paletteInputEl) {
    paletteInputEl.addEventListener('input', () => {
      paletteIdx = 0
      renderPalette()
    })
    paletteInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePalette()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        paletteIdx = Math.min(paletteIdx + 1, paletteResults.length - 1)
        renderPalette()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        paletteIdx = Math.max(paletteIdx - 1, 0)
        renderPalette()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectPalette(paletteIdx)
      }
    })
  }

  if (paletteEl) {
    paletteEl.addEventListener('mousedown', (e) => {
      if (e.target === paletteEl) closePalette()
    })
  }
}
