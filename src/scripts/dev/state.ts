// Shared state for the shell + explorer + editor + palette modules.
// The original inline IIFE kept all of this in a closure; here we export a
// single `state` object so the split files can talk to each other without
// inventing a globals namespace.

export type FileNode = { type: 'file'; lang: string; body: string }
export type DirNode = { type: 'dir'; children: Record<string, Node> }
export type Node = FileNode | DirNode

export type DevData = {
  user?: string
  overview?: string
  githubRepos?: Array<{ name: string; readme?: string }>
  localProjectName?: string
  localFiles?: Record<string, { lang: string; body: string }>
}

const _f = (lang: string, body: string): FileNode => ({ type: 'file', lang, body })
export const _d = (children: Record<string, Node> = {}): DirNode => ({ type: 'dir', children })

function readDevData(): DevData {
  try {
    const el = document.getElementById('dev-data')
    return JSON.parse((el && el.textContent) || '{}') as DevData
  } catch {
    return {}
  }
}

const __DATA = readDevData()
export const PROJECT_NAME = __DATA.user || 'kevingamez'

function buildFS(): DirNode {
  const root = _d()
  const userDir = _d()
  root.children[PROJECT_NAME] = userDir

  if (typeof __DATA.overview === 'string') {
    userDir.children['README.md'] = _f('md', __DATA.overview)
  }

  if (Array.isArray(__DATA.githubRepos)) {
    for (const r of __DATA.githubRepos) {
      if (!r || !r.name) continue
      userDir.children[r.name] = _d({
        'README.md': _f('md', r.readme || ''),
      })
    }
  }

  const localName = __DATA.localProjectName || 'personal-site'
  const localFiles = __DATA.localFiles || {}
  let localDir = userDir.children[localName]
  if (!localDir || localDir.type !== 'dir') {
    localDir = _d()
    userDir.children[localName] = localDir
  }
  for (const [path, file] of Object.entries(localFiles)) {
    const parts = path.split('/')
    let cur: DirNode = localDir
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i]
      let child = cur.children[seg]
      if (!child || child.type !== 'dir') {
        child = _d()
        cur.children[seg] = child
      }
      cur = child
    }
    cur.children[parts[parts.length - 1]] = _f(file.lang, file.body)
  }
  return root
}

export const FS: DirNode = buildFS()

export type DevState = {
  cwd: string[]
  lineNum: number
  history: string[]
  historyIdx: number
  openTabs: string[]
  activeTab: string | null
  folded: Set<string>
  // Map of saved file bodies (last persisted, used to compute dirty markers).
  savedBodies: Record<string, string>
  // Decorations the original FILE_META / OUTLINE_MAP populated. Empty by
  // default — kept for forward compatibility with the original design.
  fileMeta: Record<string, { dot?: 'normal' | 'warn'; badge?: string }>
  outlineMap: Record<string, Array<{ name: string; children?: string[] }>>
}

// Start with every github-repo subfolder collapsed and everything inside
// `personal-site/src/pages/` collapsed too — vscode-style: only the workspace
// root is expanded by default, the user clicks to drill in.
function initialFolded(): Set<string> {
  const folded = new Set<string>()
  const userDir = FS.children[PROJECT_NAME]
  if (userDir && userDir.type === 'dir') {
    for (const [name, node] of Object.entries(userDir.children)) {
      if (node.type === 'dir') folded.add(`${PROJECT_NAME}/${name}`)
    }
  }
  return folded
}

export const state: DevState = {
  cwd: [PROJECT_NAME],
  lineNum: 0,
  history: [],
  historyIdx: 0,
  openTabs: [],
  activeTab: null,
  folded: initialFolded(),
  savedBodies: Object.create(null),
  fileMeta: {},
  outlineMap: {},
}

// ─── Path utilities ───
export function resolvePath(p: string | undefined): string[] {
  if (p === undefined) return [...state.cwd]
  let parts: string[]
  if (p === '~' || p === '~/') parts = []
  else if (p.startsWith('~/')) parts = p.slice(2).split('/')
  else if (p.startsWith('/')) parts = p.slice(1).split('/')
  else parts = [...state.cwd, ...p.split('/')]
  const out: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') {
      out.pop()
      continue
    }
    out.push(part)
  }
  return out
}

export function getNode(parts: string[]): Node | null {
  let node: Node = FS
  for (const part of parts) {
    if (!node || node.type !== 'dir' || !node.children[part]) return null
    node = node.children[part]
  }
  return node
}

export function pathDisplay(parts: string[]): string {
  return '~/' + parts.join('/')
}
