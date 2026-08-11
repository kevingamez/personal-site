// Theme palettes and the DOM appliers (theme, font size, cursor, motion) for the settings panel.

export type Theme = 'cream' | 'midnight' | 'sepia' | 'solar'
export type Cursor = 'block' | 'bar' | 'underline'

const THEME_VARS: Record<Theme, Record<string, string>> = {
  cream: {
    // Default - the cream/coral editorial palette.
    '--bg': '#0a0a0d',
    '--panel': '#10101a',
    '--panel-2': '#16161e',
    '--line': '#22222c',
    '--line-2': '#2a2a36',
    '--ink': '#e8e8ec',
    '--ink-2': '#c9c9d1',
    '--mute': '#7d7d88',
    '--mute-2': '#555560',
    '--coral': '#d96944',
    '--coral-soft': '#3a201a',
    '--green': '#3fb950',
    '--yellow': '#d29922',
    '--red': '#f85149',
    '--blue': '#7a98c4',
    '--purple': '#c47ad9',
    '--string': '#a5d6ff',
  },
  midnight: {
    '--bg': '#05060f',
    '--panel': '#0a0d1f',
    '--panel-2': '#101430',
    '--line': '#1a2148',
    '--line-2': '#243064',
    '--ink': '#e6ecff',
    '--ink-2': '#c2cff5',
    '--mute': '#7a86b8',
    '--mute-2': '#525c80',
    '--coral': '#6b8eff',
    '--coral-soft': '#1a2148',
    '--green': '#5be59f',
    '--yellow': '#ffd166',
    '--red': '#ff5d6c',
    '--blue': '#7a98c4',
    '--purple': '#b675ff',
    '--string': '#a5d6ff',
  },
  sepia: {
    '--bg': '#1a140e',
    '--panel': '#221a12',
    '--panel-2': '#2c2218',
    '--line': '#3a2c1f',
    '--line-2': '#4a3a2a',
    '--ink': '#f3e4cb',
    '--ink-2': '#d8c4a4',
    '--mute': '#a08770',
    '--mute-2': '#6e5a44',
    '--coral': '#d99454',
    '--coral-soft': '#3a2418',
    '--green': '#a8c068',
    '--yellow': '#e3b34a',
    '--red': '#d96b48',
    '--blue': '#8aa8a0',
    '--purple': '#b89380',
    '--string': '#d8b888',
  },
  solar: {
    '--bg': '#0c0a05',
    '--panel': '#171108',
    '--panel-2': '#1f180a',
    '--line': '#2e2310',
    '--line-2': '#473518',
    '--ink': '#fff4d9',
    '--ink-2': '#f0d8a0',
    '--mute': '#b89060',
    '--mute-2': '#6e5530',
    '--coral': '#ffb066',
    '--coral-soft': '#3a2418',
    '--green': '#7dc068',
    '--yellow': '#ffd54f',
    '--red': '#d9483a',
    '--blue': '#88b8d4',
    '--purple': '#d97a93',
    '--string': '#f0e29a',
  },
}

export function applyTheme(name: Theme): void {
  const vars = THEME_VARS[name]
  if (!vars) return
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.dataset.theme = name
}

export function applyFontSize(px: number): void {
  document.documentElement.style.setProperty('--editor-font-size', `${px}px`)
  // CodeMirror sets its own font-size inline via the theme, so we also push
  // a sized style on the .cm-editor + .cm-content + gutters to override it.
  const sel = '.cm-editor, .cm-editor .cm-scroller, .cm-content, .cm-gutters'
  document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.style.fontSize = `${px}px`
  })
}

export function applyCursor(style: Cursor): void {
  document.documentElement.dataset.cursor = style
}

export function applyMotion(reduce: boolean): void {
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
}
