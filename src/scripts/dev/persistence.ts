// LocalStorage persistence for edited files. Each path keeps a separate entry
// so reloading the page brings back unsaved edits. Entries store the *build*
// body the edit was based on alongside the edited body, so a stale edit can't
// resurrect itself on top of freshly-built content (the FS is rebuilt from live
// GitHub data on every load and READMEs change between deploys).

import { PROJECT_NAME, getNode, state } from './state'

const lsKey = (rel: string): string => 'dev-edit:' + rel

// The build body each saved edit was based on, captured the first time a file
// is hydrated. Lets persistActive record an accurate fingerprint.
const pristineBodies: Record<string, string> = Object.create(null)

type StoredEdit = { p: string; b: string }

function parseStored(raw: string | null): StoredEdit | null {
  if (raw === null) return null
  try {
    const o = JSON.parse(raw) as Partial<StoredEdit>
    if (o && typeof o.p === 'string' && typeof o.b === 'string') return { p: o.p, b: o.b }
  } catch {
    /* legacy plain-string value or corrupt JSON: treat as absent */
  }
  return null
}

export function hydrateSaved(rel: string): string | null {
  if (rel in state.savedBodies) return state.savedBodies[rel]
  const node = getNode([PROJECT_NAME, ...rel.split('/')])
  if (!node || node.type !== 'file') return null
  const pristine = node.body
  pristineBodies[rel] = pristine
  let stored: StoredEdit | null = null
  try {
    stored = parseStored(localStorage.getItem(lsKey(rel)))
  } catch {
    // localStorage may be blocked; fall back to pristine
  }
  if (stored && stored.p === pristine) {
    // Edit was based on the current build → restore it.
    node.body = stored.b
    state.savedBodies[rel] = stored.b
  } else {
    // No edit, or it was based on an older build whose content has since
    // changed. Treat the freshly-built content as the source of truth and drop
    // the stale edit so it can't shadow new content.
    if (stored) {
      try {
        localStorage.removeItem(lsKey(rel))
      } catch {
        /* ignore */
      }
    }
    state.savedBodies[rel] = pristine
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
  const pristine = activeTab in pristineBodies ? pristineBodies[activeTab] : node.body
  try {
    localStorage.setItem(lsKey(activeTab), JSON.stringify({ p: pristine, b: node.body }))
    state.savedBodies[activeTab] = node.body
    return { ok: true, path: activeTab }
  } catch {
    return { ok: false, path: activeTab }
  }
}

// Drop the saved edit for `rel` and everything beneath it (so removing a folder
// clears its files' edits too). Called by rm / rmdir.
export function forgetSaved(rel: string): void {
  const exact = lsKey(rel)
  const dirPrefix = exact + '/'
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k === exact || k.startsWith(dirPrefix))) toRemove.push(k)
    }
    for (const k of toRemove) localStorage.removeItem(k)
  } catch {
    /* ignore */
  }
  forgetMaps(rel)
}

// Migrate a saved edit (and any beneath it) from `oldRel` to `newRel`. Called
// by mv so a moved file keeps its edits instead of orphaning them.
export function renameSaved(oldRel: string, newRel: string): void {
  const from = lsKey(oldRel)
  const fromDir = from + '/'
  try {
    const moves: Array<[string, string]> = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if (k === from) moves.push([k, lsKey(newRel)])
      else if (k.startsWith(fromDir)) moves.push([k, lsKey(newRel) + k.slice(from.length)])
    }
    for (const [src, dst] of moves) {
      const v = localStorage.getItem(src)
      if (v !== null) localStorage.setItem(dst, v)
      localStorage.removeItem(src)
    }
  } catch {
    /* ignore */
  }
  remapMaps(oldRel, newRel)
}

function forgetMaps(rel: string): void {
  for (const map of [state.savedBodies, pristineBodies]) {
    for (const key of Object.keys(map)) {
      if (key === rel || key.startsWith(rel + '/')) delete map[key]
    }
  }
}

function remapMaps(oldRel: string, newRel: string): void {
  for (const map of [state.savedBodies, pristineBodies]) {
    for (const key of Object.keys(map)) {
      if (key === oldRel) {
        map[newRel] = map[key]
        delete map[key]
      } else if (key.startsWith(oldRel + '/')) {
        map[newRel + key.slice(oldRel.length)] = map[key]
        delete map[key]
      }
    }
  }
}
