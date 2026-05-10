// File / folder icon mapping for the explorer.
// Uses the PKief Material Icon Theme assets served from jsDelivr - the same
// set VS Code ships with.

export const ICON_BASE = 'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/'

const FILE_EXT_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'react_ts',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'react',
  rs: 'rust',
  css: 'css',
  scss: 'sass',
  html: 'html',
  astro: 'astro',
  json: 'json',
  jsonc: 'json',
  toml: 'settings',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  mdx: 'markdown',
  svg: 'svg',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  lock: 'lock',
  sh: 'console',
  bash: 'console',
  zsh: 'console',
  py: 'python',
  go: 'go',
  rb: 'ruby',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  sql: 'database',
  txt: 'document',
}

const FOLDER_NAME_MAP: Record<string, string> = {
  src: 'folder-src',
  api: 'folder-api',
  tests: 'folder-test',
  test: 'folder-test',
  __tests__: 'folder-test',
  public: 'folder-public',
  docs: 'folder-docs',
  scripts: 'folder-scripts',
  components: 'folder-components',
  pages: 'folder-views',
  views: 'folder-views',
  assets: 'folder-assets',
  styles: 'folder-css',
  css: 'folder-css',
  images: 'folder-images',
  img: 'folder-images',
  lib: 'folder-lib',
  utils: 'folder-utils',
  config: 'folder-config',
  '.github': 'folder-github',
  '.vscode': 'folder-vscode',
  node_modules: 'folder-node',
}

export function fileIconName(name: string): string {
  const lower = name.toLowerCase()
  if (lower === 'package.json') return 'nodejs'
  if (lower === 'tsconfig.json') return 'tsconfig'
  if (lower === 'cargo.toml' || lower === 'cargo.lock') return 'rust'
  if (lower === 'bun.lock' || lower === 'bun.lockb') return 'bun'
  if (lower.startsWith('readme')) return 'readme'
  if (lower.startsWith('changelog')) return 'changelog'
  if (lower === 'license' || lower.startsWith('license')) return 'certificate'
  const ext = (name.split('.').pop() || '').toLowerCase()
  return FILE_EXT_MAP[ext] || 'document'
}

export function folderIconName(name: string, isOpen: boolean): string {
  const lower = name.toLowerCase()
  const base = FOLDER_NAME_MAP[lower] || 'folder-base'
  return isOpen ? base + '-open' : base
}

export function iconUrl(name: string, isDir: boolean, isOpen = false): string {
  const baseName = isDir ? folderIconName(name, isOpen) : fileIconName(name)
  return ICON_BASE + baseName + '.svg'
}

export function makeIcon(name: string, isDir: boolean, isOpen = false): HTMLImageElement {
  const ico = document.createElement('img')
  ico.className = 'ico'
  ico.alt = ''
  ico.loading = 'lazy'
  ico.src = iconUrl(name, isDir, isOpen)
  ico.onerror = (): void => {
    ico.onerror = null
    ico.src = ICON_BASE + (isDir ? 'folder-base.svg' : 'document.svg')
  }
  return ico
}
