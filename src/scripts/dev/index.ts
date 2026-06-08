// Entry point for the /dev page. Wires all the modules together and runs the
// init sequence the original inline IIFE used to do at the bottom of the file.

import './dev-editor-loader'
import { bootstrapClient } from '../lib/init'
import { track } from '../lib/analytics'
import { initBogotaClock } from '../clock'
import { PROJECT_NAME, state } from './state'
import { persistActive } from './persistence'
import { initHeatmap } from './heatmap'
import { initRequestLog } from './request-log'
import { initEditor, openFile, renderEditor, setExplorerHooks, updateStatusPos } from './editor'
import { initExplorer, renderExplorer, renderOutline } from './explorer'
import { addLine, initTerminal, resetTerminal, setTerminal, updatePrompt } from './terminal'
import { initWorkspaces, setWorkspace } from './workspaces'
import { closePalette, initPalette, isPaletteOpen, openPalette } from './palette'
import { initActivityBar } from './activity-bar'
import { initProfileSettings } from './profile-settings'
import { initToast, showToast } from './toast'
import { esc } from './highlight'

function saveActive(): void {
  const r = persistActive(state.activeTab)
  if (!r.path) return
  track<{ name: 'file_save'; props: { path: string; ok: boolean } }>('file_save', {
    path: r.path,
    ok: r.ok,
  })
  if (r.ok) showToast('✓ saved · ' + r.path)
  else showToast('⚠ couldn’t save (storage blocked)')
  renderEditor()
  renderExplorer()
}

function init(): void {
  bootstrapClient()
  // Independent widgets first (no shared state).
  initBogotaClock()
  initHeatmap()
  initRequestLog()
  initToast()

  // Shell + editor + explorer (heavy shared-state cluster).
  initEditor()
  initExplorer()
  setExplorerHooks(renderExplorer, renderOutline)
  initTerminal()
  initWorkspaces()
  initPalette()
  initActivityBar()
  initProfileSettings()

  // Global ⌘P / ⌘S shortcuts.
  document.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey
    if (!meta) return
    const k = e.key.toLowerCase()
    if (k === 'p') {
      e.preventDefault()
      if (isPaletteOpen()) closePalette()
      else openPalette()
    } else if (k === 's') {
      e.preventDefault()
      saveActive()
    }
  })

  // Initial render + welcome lines.
  resetTerminal()
  updatePrompt()
  renderExplorer()
  setWorkspace('workspace')
  setTerminal('zsh')
  updateStatusPos(6, 24)
  addLine(
    '<span class="gr">welcome to ~/' +
      esc(PROJECT_NAME) +
      ' · type</span> <span class="ac">help</span> <span class="gr">to see what works.</span>'
  )
  addLine(
    '<span class="gr">try:</span> <span class="ac">ls</span> · <span class="ac">cat README.md</span> · <span class="ac">tree</span>'
  )
  // No trailing $-with-cursor line: the live input bar below already plays
  // that role. Two visual prompts read like duplicate terminals.
  openFile([PROJECT_NAME, 'README.md'], 'init')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}
