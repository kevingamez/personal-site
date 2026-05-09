// Tiny markdown→html renderer used for CHANGELOG / README rendering in the
// non-editor workspaces. Supports h1/h2/h3, unordered lists, paragraphs and
// inline `code` spans — that's all the dev page needs.

import { esc } from './highlight'

function inlineMd(s: string): string {
  return s.replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function mdToHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inUl = false
  const closeUl = (): void => {
    if (inUl) {
      out.push('</ul>')
      inUl = false
    }
  }
  for (const ln of lines) {
    if (ln.startsWith('### ')) {
      closeUl()
      out.push('<h3>' + esc(ln.slice(4)) + '</h3>')
    } else if (ln.startsWith('## ')) {
      closeUl()
      out.push('<h2>' + esc(ln.slice(3)) + '</h2>')
    } else if (ln.startsWith('# ')) {
      closeUl()
      out.push('<h1>' + esc(ln.slice(2)) + '</h1>')
    } else if (ln.startsWith('- ') || ln.startsWith('* ')) {
      if (!inUl) {
        out.push('<ul>')
        inUl = true
      }
      out.push('<li>' + inlineMd(esc(ln.slice(2))) + '</li>')
    } else if (ln.trim() === '') {
      closeUl()
    } else {
      closeUl()
      out.push('<p>' + inlineMd(esc(ln)) + '</p>')
    }
  }
  closeUl()
  return out.join('')
}
