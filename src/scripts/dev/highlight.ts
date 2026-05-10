// Lightweight syntax highlighter used by the terminal `cat` command.
// CodeMirror handles the editor itself - this is for inline terminal output only.

const KW_TS =
  /\b(import|export|const|let|var|type|interface|class|extends|implements|return|async|await|function|as|from|if|else|switch|case|break|true|false|null|undefined|new|this|satisfies|typeof|keyof|enum|public|private|protected|readonly|in|of|for|while|do)\b/g
const KW_RS =
  /\b(pub|fn|let|mut|use|mod|struct|impl|match|return|if|else|true|false|as|trait|crate|self|Self|where|move|async|await|loop|while|for|in|ref)\b/g
const TY =
  /\b(string|number|boolean|void|any|unknown|never|object|symbol|bigint|Record|Array|Promise|Map|Set|Date|Response|Request|Tool|Project|u8|u16|u32|u64|i8|i16|i32|i64|f32|f64|bool|str|String|Vec|Option|Result|Box)\b/g

export function esc(s: string | number): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightPlain(text: string, lang: string): string {
  let s = esc(text)
  s = s.replace(lang === 'rs' ? KW_RS : KW_TS, '<span class="kw">$1</span>')
  s = s.replace(TY, '<span class="ty">$1</span>')
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>')
  return s
}

function highlightCode(line: string, lang: string): string {
  const out: string[] = []
  const n = line.length
  let i = 0
  while (i < n) {
    if (line[i] === '/' && line[i + 1] === '/') {
      out.push('<span class="cm">' + esc(line.slice(i)) + '</span>')
      i = n
    } else if (line[i] === '/' && line[i + 1] === '*') {
      out.push('<span class="cm">' + esc(line.slice(i)) + '</span>')
      i = n
    } else if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const q = line[i]
      let j = i + 1
      while (j < n && line[j] !== q) {
        if (line[j] === '\\') j++
        j++
      }
      out.push('<span class="st">' + esc(line.slice(i, Math.min(j + 1, n))) + '</span>')
      i = j + 1
    } else {
      let j = i
      while (j < n && line[j] !== '/' && line[j] !== '"' && line[j] !== "'" && line[j] !== '`') j++
      out.push(highlightPlain(line.slice(i, j), lang))
      i = j
    }
  }
  return out.join('')
}

function highlightJson(line: string): string {
  let s = esc(line)
  s = s.replace(/"([^"]*)"(\s*):/g, '<span class="pn">"$1"</span>$2:')
  s = s.replace(/(:\s*)"([^"]*)"/g, '$1<span class="st">"$2"</span>')
  s = s.replace(/\b(true|false|null)\b/g, '<span class="kw">$1</span>')
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>')
  return s
}

function highlightToml(line: string): string {
  if (/^\s*\[.*\]\s*$/.test(line)) return '<span class="ty">' + esc(line) + '</span>'
  let s = esc(line)
  s = s.replace(/^(\s*)([\w-]+)(\s*=)/, '$1<span class="pn">$2</span>$3')
  s = s.replace(/"([^"]*)"/g, '<span class="st">"$1"</span>')
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>')
  s = s.replace(/^(\s*)#(.*)$/, '$1<span class="cm">#$2</span>')
  return s
}

export function highlight(line: string, lang: string): string {
  if (lang === 'json') return highlightJson(line)
  if (lang === 'toml') return highlightToml(line)
  if (lang === 'ts' || lang === 'rs') return highlightCode(line, lang)
  return esc(line)
}
