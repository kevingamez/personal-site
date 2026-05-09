// LocalStorage persistence for edited files. Each path keeps a separate entry
// so reloading the page brings back unsaved edits.

import { PROJECT_NAME, getNode, state } from './state'

const lsKey = (rel: string): string => 'dev-edit:' + rel

export function hydrateSaved(rel: string): string | null {
  if (rel in state.savedBodies) return state.savedBodies[rel]
  const node = getNode([PROJECT_NAME, ...rel.split('/')])
  if (!node || node.type !== 'file') return null
  let stored: string | null = null
  try {
    stored = localStorage.getItem(lsKey(rel))
  } catch {
    // localStorage may be blocked; fall back to pristine
  }
  if (stored !== null) {
    node.body = stored
    state.savedBodies[rel] = stored
  } else {
    state.savedBodies[rel] = node.body
  }
  return state.savedBodies[rel]
}

export function isDirty(rel: string): boolean {
  const node = getNode([PROJECT_NAME, ...rel.split('/')])
  if (!node || node.type !== 'file') return false
  if (!(rel in state.savedBodies)) hydrateSaved(rel)
  return node.body !== state.savedBodies[rel]
}

export function persistActive(activeTab: string | null): { ok: boolean; path: string | null } {
  if (!activeTab) return { ok: false, path: null }
  const node = getNode([PROJECT_NAME, ...activeTab.split('/')])
  if (!node || node.type !== 'file') return { ok: false, path: activeTab }
  try {
    localStorage.setItem(lsKey(activeTab), node.body)
    state.savedBodies[activeTab] = node.body
    return { ok: true, path: activeTab }
  } catch {
    return { ok: false, path: activeTab }
  }
}
