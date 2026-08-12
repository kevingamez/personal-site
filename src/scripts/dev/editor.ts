// Tab strip + CodeMirror mount. Shares state with the explorer/shell via
// `state`. The actual editor implementation lives in `dev-editor.ts` (mounted
// onto `window.__cm` by that module).

import { LOCAL_PROJECT, PROJECT_NAME, getNode, state } from './state'
import { hydrateSaved, isDirty } from './persistence'
import { esc } from './highlight'
import { iconUrl } from './icons'
import { track } from '../lib/analytics'

type OpenSource = 'palette' | 'tree' | 'init' | 'terminal'

let edTabsEl: HTMLElement | null = null
let edBodyEl: HTMLElement | null = null

// Forward refs filled in by index.ts to avoid a circular import with explorer.ts
let renderExplorerFn: () => void = () => {}
let renderOutlineFn: () => void = () => {}

export function setExplorerHooks(renderExplorer: () => void, renderOutline: () => void): void {
  renderExplorerFn = renderExplorer
  renderOutlineFn = renderOutline
}

export function initEditor(): void {
  edTabsEl = document.querySelector('.ed-tabs')
  edBodyEl = document.querySelector('.ed-body')
}

// Paths already requested from /api/repo, so a second open of the same file
// does not re-fetch and a failed fetch is not retried on every click.
const fetched = new Set<string>()

// The tree ships with empty bodies (see data/dev-files.ts), so the body is
// pulled on first open. Deliberately fire-and-forget rather than making
// openFile async: five call sites depend on its synchronous boolean, and the
// tab should appear immediately with the editor filling in a moment later,
// the way a real editor opens a file off a slow disk.
function ensureBody(rel: string, node: { body: string }): void {
  if (node.body || fetched.has(rel)) return
  // Only this repository is served lazily. Other repos in the tree carry just
  // a README, which the build already inlined, so they have a body and never
  // reach here anyway.
  const prefix = LOCAL_PROJECT + '/'
  if (!rel.startsWith(prefix)) return
  fetched.add(rel)
  // Trailing slash on purpose: the project sets `trailingSlash`, so the
  // unslashed form costs an extra 308 round trip before the body arrives.
  void fetch('/api/repo/?path=' + encodeURIComponent(rel.slice(prefix.length)))
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { body?: string } | null) => {
      if (!data || typeof data.body !== 'string') return
      node.body = data.body
      // Only repaint if this file is still the one on screen; the visitor may
      // have moved on while the request was in flight.
      if (state.activeTab === rel) renderEditor()
      renderOutlineFn()
    })
    .catch(() => {
      // Progressive enhancement: the tab stays open and empty rather than
      // throwing. A reload retries.
    })
}

export function openFile(parts: string[], via: OpenSource = 'tree'): boolean {
  const node = getNode(parts)
  if (!node || node.type !== 'file') return false
  if (parts[0] !== PROJECT_NAME) return false
  const rel = parts.slice(1).join('/')
  ensureBody(rel, node)
  hydrateSaved(rel)
  if (!state.openTabs.includes(rel)) state.openTabs.push(rel)
  state.activeTab = rel
  track<{ name: 'file_open'; props: { path: string; via: OpenSource } }>('file_open', {
    path: rel,
    via,
  })
  renderEditor()
  renderExplorerFn()
  renderOutlineFn()
  return true
}

export function closeTab(rel: string): void {
  state.openTabs = state.openTabs.filter((t) => t !== rel)
  if (state.activeTab === rel) state.activeTab = state.openTabs[state.openTabs.length - 1] || null
  renderEditor()
  renderExplorerFn()
  renderOutlineFn()
}

export function renderEditor(): void {
  if (!edTabsEl || !edBodyEl) return
  edTabsEl.innerHTML = ''
  for (const t of state.openTabs) {
    const name = t.split('/').pop() || ''
    const div = document.createElement('div')
    const dirty = isDirty(t)
    div.className = 'et' + (t === state.activeTab ? ' on' : '') + (dirty ? ' dirty' : '')
    const closer = dirty ? '●' : '×'
    // VS Code-style: file icon + name + close/dirty marker
    div.innerHTML =
      '<img class="et-ico" src="' +
      iconUrl(name, false) +
      '" alt="" />' +
      '<span class="et-name">' +
      esc(name) +
      '</span>' +
      ' <span class="x">' +
      closer +
      '</span>'
    div.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.classList && target.classList.contains('x')) {
        closeTab(t)
      } else {
        state.activeTab = t
        renderEditor()
      }
    })
    edTabsEl.appendChild(div)
  }
  const grow = document.createElement('div')
  grow.className = 'grow'
  edTabsEl.appendChild(grow)
  const bc = document.createElement('div')
  bc.className = 'breadcrumb'
  if (state.activeTab) {
    const pp = state.activeTab.split('/')
    const dir = pp.slice(0, -1).join(' › ')
    const fileName = pp[pp.length - 1]
    bc.innerHTML =
      (dir ? esc(dir) + ' › ' : '') +
      '<img class="bc-ico" src="' +
      iconUrl(fileName, false) +
      '" alt="" />' +
      '<b>' +
      esc(fileName) +
      '</b>'
  }
  edTabsEl.appendChild(bc)

  edBodyEl.innerHTML = ''
  if (!state.activeTab) {
    if (window.__cm) window.__cm.destroy()
    edBodyEl.innerHTML =
      '<div class="ed-empty">no file open. try <span class="ac">cat README.md</span></div>'
    return
  }
  const node = getNode([PROJECT_NAME, ...state.activeTab.split('/')])
  if (!node || node.type !== 'file') return

  const mountWhenReady = (): void => {
    if (!window.__cm) {
      window.addEventListener('cm-ready', mountWhenReady, { once: true })
      return
    }
    if (!edBodyEl) return
    const mountedPath = state.activeTab as string
    const mountedNode = node
    let lastDirty = isDirty(mountedPath)
    window.__cm.mount(edBodyEl, {
      name: mountedPath,
      lang: mountedNode.lang,
      body: mountedNode.body,
      onChange: (newDoc: string) => {
        mountedNode.body = newDoc
        const nowDirty = newDoc !== state.savedBodies[mountedPath]
        if (nowDirty !== lastDirty) {
          lastDirty = nowDirty
          refreshTabsDirty()
          refreshExplorerDirty()
        }
      },
      onCursor: (line: number, col: number) => updateStatusPos(line, col),
    })
  }
  mountWhenReady()
}

export function updateStatusPos(line: number, col: number): void {
  const el = document.getElementById('status-pos')
  if (el) el.textContent = 'UTF-8, LF, Ln ' + line + ', Col ' + (col || 1)
}

export function refreshTabsDirty(): void {
  if (!edTabsEl) return
  const tabs = edTabsEl.querySelectorAll<HTMLElement>('.et')
  tabs.forEach((tab, i) => {
    const path = state.openTabs[i]
    if (!path) return
    const dirty = isDirty(path)
    tab.classList.toggle('dirty', dirty)
    const x = tab.querySelector<HTMLElement>('.x')
    if (x) x.textContent = dirty ? '●' : '×'
  })
}

export function refreshExplorerDirty(): void {
  const treeEl = document.getElementById('file-tree')
  if (!treeEl) return
  treeEl.querySelectorAll<HTMLElement>('.it.file').forEach((el) => {
    const path = el.dataset.path
    if (!path) return
    el.classList.toggle('dirty', isDirty(path))
  })
}
