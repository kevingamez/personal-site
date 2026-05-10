// CodeMirror 6 integration for the /dev page.
// Exposes window.__cm = { mount, destroy, focus } so the inline shell script
// can mount a real editor in any container.
//
// Language packages are dynamically imported per-file via a Compartment, so
// only the lang(s) actually opened end up in the loaded bundle. The base
// editor (~200KB) lands on first paint; each lang chunk is ~10–30KB extra.

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

type MountOpts = {
  name: string
  lang?: string
  body: string
  onChange?: (doc: string) => void
  onCursor?: (line: number, col: number) => void
  readOnly?: boolean
}

declare global {
  interface Window {
    __cm?: {
      mount: (container: HTMLElement, opts: MountOpts) => EditorView
      destroy: () => void
      focus: () => void
    }
  }
}

type LangKey = 'ts' | 'tsx' | 'js' | 'jsx' | 'md' | 'json' | 'css' | 'html' | 'rust'

function detectLang(name: string, lang?: string): LangKey | null {
  const lower = (name || '').toLowerCase()
  if (lang === 'ts' || /\.(ts|mts|cts)$/.test(lower)) return 'ts'
  if (lower.endsWith('.tsx')) return 'tsx'
  if (/\.(mjs|cjs|js)$/.test(lower)) return 'js'
  if (lower.endsWith('.jsx')) return 'jsx'
  if (lang === 'md' || /\.(md|mdx)$/.test(lower)) return 'md'
  if (lang === 'json' || lower.endsWith('.json')) return 'json'
  if (lang === 'css' || lower.endsWith('.css')) return 'css'
  if (lang === 'html' || lang === 'astro' || /\.(html|astro)$/.test(lower)) return 'html'
  if (lang === 'rs' || lower.endsWith('.rs')) return 'rust'
  return null
}

async function loadLang(key: LangKey): Promise<Extension[]> {
  switch (key) {
    case 'ts':
      return [(await import('@codemirror/lang-javascript')).javascript({ typescript: true })]
    case 'tsx':
      return [
        (await import('@codemirror/lang-javascript')).javascript({ typescript: true, jsx: true }),
      ]
    case 'js':
      return [(await import('@codemirror/lang-javascript')).javascript()]
    case 'jsx':
      return [(await import('@codemirror/lang-javascript')).javascript({ jsx: true })]
    case 'md':
      return [(await import('@codemirror/lang-markdown')).markdown()]
    case 'json':
      return [(await import('@codemirror/lang-json')).json()]
    case 'css':
      return [(await import('@codemirror/lang-css')).css()]
    case 'html':
      return [(await import('@codemirror/lang-html')).html()]
    case 'rust':
      return [(await import('@codemirror/lang-rust')).rust()]
  }
}

const coralTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      fontSize: '12.5px',
      backgroundColor: 'transparent',
      color: 'var(--ink-2)',
    },
    '.cm-content': {
      fontFamily: 'inherit',
      caretColor: 'var(--coral)',
      padding: '10px 0',
    },
    '.cm-scroller': { fontFamily: 'inherit', overflow: 'auto', backgroundColor: 'transparent' },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      color: '#3a3a44',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(217, 105, 68, 0.05)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--coral)' },
    '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--coral)' },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(217, 105, 68, 0.25)',
    },
    '.cm-selectionBackground': { backgroundColor: 'rgba(217, 105, 68, 0.18)' },
    '.cm-tooltip': {
      backgroundColor: 'var(--panel-2)',
      border: '1px solid var(--line-2)',
      color: 'var(--ink-2)',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'rgba(217, 105, 68, 0.2)',
      color: '#fff',
    },
    '.cm-searchMatch': { backgroundColor: 'rgba(217, 105, 68, 0.3)' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'var(--coral)' },
    '.cm-panels': {
      backgroundColor: 'var(--panel)',
      color: 'var(--ink-2)',
      borderTop: '1px solid var(--line)',
    },
    '.cm-panel.cm-search input': {
      backgroundColor: 'var(--bg)',
      color: 'var(--ink)',
      border: '1px solid var(--line-2)',
      padding: '4px 8px',
      borderRadius: '4px',
    },
    '.cm-panel.cm-search button': {
      backgroundColor: 'transparent',
      color: 'var(--ink-2)',
      border: '1px solid var(--line-2)',
      padding: '3px 8px',
      borderRadius: '4px',
      margin: '0 2px',
    },
  },
  { dark: true }
)

let view: EditorView | null = null
const langCompartment = new Compartment()
const langCache = new Map<LangKey, Extension[]>()

function baseExtensions(name: string): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    foldGutter(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    vscodeDark,
    coralTheme,
    EditorView.contentAttributes.of({ 'aria-label': `Code editor - ${name}` }),
  ]
}

function applyLangAsync(name: string, lang: string | undefined): void {
  const key = detectLang(name, lang)
  if (!key) {
    view?.dispatch({ effects: langCompartment.reconfigure([]) })
    return
  }
  const cached = langCache.get(key)
  if (cached) {
    view?.dispatch({ effects: langCompartment.reconfigure(cached) })
    return
  }
  loadLang(key).then((ext) => {
    langCache.set(key, ext)
    if (view) view.dispatch({ effects: langCompartment.reconfigure(ext) })
  })
}

function mount(container: HTMLElement, opts: MountOpts): EditorView {
  if (view) {
    view.destroy()
    view = null
  }
  container.innerHTML = ''
  const exts: Extension[] = [...baseExtensions(opts.name), langCompartment.of([])]
  if (opts.readOnly) exts.push(EditorState.readOnly.of(true))
  exts.push(
    EditorView.updateListener.of((u) => {
      if (u.docChanged && opts.onChange) opts.onChange(u.state.doc.toString())
      if ((u.selectionSet || u.docChanged) && opts.onCursor) {
        const head = u.state.selection.main.head
        const line = u.state.doc.lineAt(head)
        opts.onCursor(line.number, head - line.from + 1)
      }
    })
  )
  const state = EditorState.create({ doc: opts.body || '', extensions: exts })
  view = new EditorView({ state, parent: container })
  applyLangAsync(opts.name, opts.lang)
  return view
}

function destroy(): void {
  if (view) {
    view.destroy()
    view = null
  }
}

function focus(): void {
  if (view) view.focus()
}

window.__cm = { mount, destroy, focus }
window.dispatchEvent(new Event('cm-ready'))
