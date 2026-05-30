// Low-level DOM helpers + shared types for the home-page console modules.
// Kept dependency-free so every other console module can import from here
// without creating import cycles.

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Refs {
  stream: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  suggest: HTMLElement
  cmdHistory: string[]
  bootTime: number
}

export type CommandFn = (
  args: string[],
  refs: Refs,
  history: ChatMessage[],
  raw: string
) => void | Promise<void>

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// Escapes every character that is significant in HTML text *and attribute*
// contexts. Quotes are included so escaped values are safe inside the
// double-quoted attributes mdLite builds (see console-chat.ts).
export function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPES[c] || c)
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}

export function appendCmdLine(stream: HTMLElement, command: string): void {
  const cmdLine = el('div', 'cs-line cs-cmd')
  const host = el('span', 'ci-host', 'kevin@gamez')
  const sep = el('span', 'ci-sep', '~')
  const prompt = el('span', 'ci-prompt', '$')
  const text = el('span', 'cs-cmd-text', command)
  cmdLine.appendChild(host)
  cmdLine.appendChild(sep)
  cmdLine.appendChild(prompt)
  cmdLine.appendChild(text)
  stream.appendChild(cmdLine)
  stream.scrollTop = stream.scrollHeight
}

export function printOut(
  stream: HTMLElement,
  html: string,
  kind: 'out' | 'err' = 'out'
): HTMLElement {
  const line = el('div', 'cs-line cs-' + kind)
  line.innerHTML = html
  stream.appendChild(line)
  stream.scrollTop = stream.scrollHeight
  return line
}

export function printLines(stream: HTMLElement, lines: string[]): void {
  for (const l of lines) printOut(stream, l)
}

export function tokenize(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quote: '"' | "'" | null = null
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null
      else cur += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (/\s/.test(ch)) {
      if (cur) (out.push(cur), (cur = ''))
    } else {
      cur += ch
    }
  }
  if (cur) out.push(cur)
  return out
}
