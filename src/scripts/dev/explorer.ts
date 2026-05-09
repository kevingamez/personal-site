// Sidebar file explorer + outline pane.

import { FS, PROJECT_NAME, getNode, state, type DirNode } from './state'
import { isDirty } from './persistence'
import { makeIcon } from './icons'
import { openFile } from './editor'

let treeEl: HTMLElement | null = null
let outlineHdEl: HTMLElement | null = null
let outlineListEl: HTMLElement | null = null

export function initExplorer(): void {
  treeEl = document.getElementById('file-tree')
  outlineHdEl = document.getElementById('outline-hd')
  outlineListEl = document.getElementById('outline-list')
}

function makeFolderItem(name: string, key: string, depth: number): HTMLElement {
  const div = document.createElement('div')
  let cls = 'it fold'
  if (depth > 0) cls += ' indent'
  if (depth > 1) cls += ' deep'
  const isOpen = !state.folded.has(key)
  if (!isOpen) cls += ' closed'
  div.className = cls
  div.appendChild(makeIcon(name, true, isOpen))
  const lbl = document.createElement('span')
  lbl.className = 'lbl'
  lbl.textContent = name
  div.appendChild(lbl)
  div.addEventListener('click', () => {
    if (state.folded.has(key)) state.folded.delete(key)
    else state.folded.add(key)
    renderExplorer()
  })
  return div
}

function makeFileItem(name: string, pathParts: string[], depth: number): HTMLElement {
  const div = document.createElement('div')
  const ext = (name.split('.').pop() || '').toLowerCase()
  const extMap: Record<string, string> = {
    ts: 'ts',
    tsx: 'tsx',
    rs: 'rs',
    md: 'md',
    json: 'json',
    toml: 'toml',
    lock: 'lock',
    css: 'css',
  }
  const extCls = extMap[ext] || 'ts'
  let cls = 'it file ' + extCls
  if (depth > 0) cls += ' indent'
  if (depth > 1) cls += ' deep'
  const rel = pathParts.slice(1).join('/')
  if (rel === state.activeTab) cls += ' active'
  if (isDirty(rel)) cls += ' dirty'
  div.className = cls
  div.dataset.path = rel
  div.appendChild(makeIcon(name, false))
  const lbl = document.createElement('span')
  lbl.className = 'lbl'
  lbl.textContent = name
  div.appendChild(lbl)
  const meta = state.fileMeta[rel]
  if (meta) {
    if (meta.dot === 'normal') {
      const d = document.createElement('span')
      d.className = 'dot'
      div.appendChild(d)
    }
    if (meta.dot === 'warn') {
      const d = document.createElement('span')
      d.className = 'dot warn'
      div.appendChild(d)
    }
    if (meta.badge) {
      const b = document.createElement('span')
      b.className = 'badge'
      b.textContent = meta.badge
      div.appendChild(b)
    }
  }
  div.addEventListener('click', () => openFile(pathParts))
  return div
}

function walkDir(node: DirNode, pathParts: string[], depth: number, container: HTMLElement): void {
  // Preserve declaration order — the FS is hand-authored to match the design.
  const entries = Object.entries(node.children)
  for (const [name, child] of entries) {
    const childPath = [...pathParts, name]
    const key = childPath.join('/')
    if (child.type === 'dir') {
      container.appendChild(makeFolderItem(name, key, depth))
      if (!state.folded.has(key)) walkDir(child, childPath, depth + 1, container)
    } else {
      container.appendChild(makeFileItem(name, childPath, depth))
    }
  }
}

export function renderExplorer(): void {
  if (!treeEl) return
  treeEl.innerHTML = ''
  const root = FS.children[PROJECT_NAME]
  if (!root || root.type !== 'dir') return
  const rootKey = PROJECT_NAME
  treeEl.appendChild(makeFolderItem(PROJECT_NAME, rootKey, 0))
  if (!state.folded.has(rootKey)) walkDir(root, [rootKey], 1, treeEl)
}

export function renderOutline(): void {
  if (!outlineHdEl || !outlineListEl) return
  if (!state.activeTab) {
    outlineHdEl.textContent = 'Outline'
    outlineListEl.innerHTML = ''
    return
  }
  const name = state.activeTab.split('/').pop() || ''
  outlineHdEl.textContent = 'Outline · ' + name
  outlineListEl.innerHTML = ''
  if (state.outlineMap[state.activeTab]) {
    for (const sym of state.outlineMap[state.activeTab]) {
      const top = document.createElement('div')
      top.className = 'it indent'
      top.textContent = '▸ ' + sym.name
      outlineListEl.appendChild(top)
      if (sym.children) {
        for (const c of sym.children) {
          const cd = document.createElement('div')
          cd.className = 'it indent deep'
          cd.textContent = '▸ ' + c
          outlineListEl.appendChild(cd)
        }
      }
    }
    return
  }
  const node = getNode([PROJECT_NAME, ...state.activeTab.split('/')])
  if (!node || node.type !== 'file') return
  const ext = (name.split('.').pop() || '').toLowerCase()
  const symbols: Array<{ kind: string; name: string }> = []
  if (ext === 'ts' || ext === 'tsx' || ext === 'js') {
    const re = /\bexport\s+(?:default\s+)?(const|function|class|type|interface|enum)\s+([\w$_]+)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(node.body))) symbols.push({ kind: m[1], name: m[2] })
  } else if (ext === 'rs') {
    const re = /\b(pub\s+(?:fn|struct|enum|trait|mod|const)|fn|struct|enum|trait|mod)\s+([\w_]+)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(node.body))) symbols.push({ kind: m[1].replace(/^pub\s+/, ''), name: m[2] })
  } else if (ext === 'md') {
    const lines = node.body.split('\n')
    for (const ln of lines) {
      const m = ln.match(/^(#{1,3})\s+(.+)$/)
      if (m) symbols.push({ kind: 'h' + m[1].length, name: m[2] })
    }
  } else if (ext === 'json') {
    const lines = node.body.split('\n')
    for (const ln of lines) {
      const m = ln.match(/^\s+"([\w-]+)"\s*:/)
      if (m) symbols.push({ kind: 'key', name: m[1] })
    }
  } else if (ext === 'toml') {
    const lines = node.body.split('\n')
    for (const ln of lines) {
      const m = ln.match(/^\s*\[(.+)\]\s*$/)
      if (m) symbols.push({ kind: 'section', name: m[1] })
    }
  }
  if (!symbols.length) {
    const div = document.createElement('div')
    div.className = 'it indent'
    div.style.color = 'var(--mute-2)'
    div.textContent = '(no symbols)'
    outlineListEl.appendChild(div)
    return
  }
  for (const s of symbols) {
    const div = document.createElement('div')
    div.className = 'it indent'
    div.textContent = '▸ ' + s.name + (s.kind === 'function' || s.kind === 'fn' ? '()' : '')
    outlineListEl.appendChild(div)
  }
}
