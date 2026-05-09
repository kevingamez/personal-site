// CodeMirror 6 integration for the /dev page.
// Exposes window.__cm = { mount, destroy, focus } so the inline shell script
// can mount a real editor in any container.

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'
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
import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { rust } from '@codemirror/lang-rust'
import { materialDark } from '@uiw/codemirror-theme-material'

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

function langForFile(name: string, lang?: string): Extension[] {
  const lower = (name || '').toLowerCase()
  if (
    lang === 'ts' ||
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.mts') ||
    lower.endsWith('.cts')
  ) {
    return [javascript({ typescript: true, jsx: lower.endsWith('.tsx') })]
  }
  if (
    lower.endsWith('.js') ||
    lower.endsWith('.mjs') ||
    lower.endsWith('.cjs') ||
    lower.endsWith('.jsx')
  ) {
    return [javascript({ jsx: lower.endsWith('.jsx') })]
  }
  if (lang === 'md' || lower.endsWith('.md') || lower.endsWith('.mdx')) return [markdown()]
  if (lang === 'json' || lower.endsWith('.json')) return [json()]
  if (lang === 'css' || lower.endsWith('.css')) return [css()]
  if (lang === 'html' || lang === 'astro' || lower.endsWith('.html') || lower.endsWith('.astro'))
    return [html()]
  if (lang === 'rs' || lower.endsWith('.rs')) return [rust()]
  return []
}

const coralTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      fontSize: '12.5px',
      backgroundColor: 'var(--bg)',
      color: 'var(--ink-2)',
    },
    '.cm-content': {
      fontFamily: 'inherit',
      caretColor: 'var(--coral)',
      padding: '10px 0',
    },
    '.cm-scroller': { fontFamily: 'inherit', overflow: 'auto' },
    '.cm-gutters': {
      backgroundColor: 'var(--bg)',
      borderRight: '1px solid var(--line)',
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

function basicExtensions(name: string, lang: string | undefined): Extension[] {
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
    materialDark,
    coralTheme,
    ...langForFile(name, lang),
  ]
}

function mount(container: HTMLElement, opts: MountOpts): EditorView {
  if (view) {
    view.destroy()
    view = null
  }
  container.innerHTML = ''
  const exts = basicExtensions(opts.name, opts.lang)
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
  return view
}

function destroy() {
  if (view) {
    view.destroy()
    view = null
  }
}
function focus() {
  if (view) view.focus()
}

window.__cm = { mount, destroy, focus }
window.dispatchEvent(new Event('cm-ready'))
