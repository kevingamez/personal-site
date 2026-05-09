// Terminal command map — `ls`, `cd`, `cat`, `vim`, etc. The map closure is
// built once with injected output helpers so commands can write back to the
// terminal without depending on the DOM directly.

import { _d, getNode, pathDisplay, resolvePath, state, PROJECT_NAME } from './state'
import type { DirNode, FileNode } from './state'
import { esc, highlight } from './highlight'
import { openFile } from './editor'

type AddLine = (html: string) => void
type Err = (msg: string) => void
type Clear = () => void

export type CommandRunner = (args: string[]) => void
export type CommandMap = Record<string, CommandRunner>

export function buildCommands(addLine: AddLine, errFn: Err, clearFn: Clear): CommandMap {
  const commands: CommandMap = {
    pwd: () => addLine(esc(pathDisplay(state.cwd))),
    whoami: () =>
      addLine('kevin · founding engineer @ enttor · <span class="ac">bogotá / utc-5</span>'),
    date: () => addLine(esc(new Date().toString())),
    uname: () => addLine('Darwin ' + PROJECT_NAME + ' 25.4.0 arm64'),
    ls: (args) => {
      const target = args[0] ? resolvePath(args[0]) : state.cwd
      const node = getNode(target)
      if (!node) return errFn('ls: ' + (args[0] || '.') + ': no such file or directory')
      if (node.type === 'file') return addLine(esc(target[target.length - 1]))
      const entries = Object.entries(node.children)
      entries.sort((a, b) => {
        if (a[1].type !== b[1].type) return a[1].type === 'dir' ? -1 : 1
        return a[0].localeCompare(b[0])
      })
      if (!entries.length) return addLine('<span class="gr">(empty)</span>')
      const html = entries
        .map(([name, n]) => {
          if (n.type === 'dir')
            return '<span class="ls-dir" data-cd="' + esc(name) + '">' + esc(name) + '/</span>'
          return '<span class="ls-file" data-cat="' + esc(name) + '">' + esc(name) + '</span>'
        })
        .join('  ')
      addLine(html)
    },
    cd: (args) => {
      const target = args[0] === undefined || args[0] === '~' ? [] : resolvePath(args[0])
      const node = getNode(target)
      if (!node) return errFn('cd: ' + args[0] + ': no such file or directory')
      if (node.type !== 'dir') return errFn('cd: ' + args[0] + ': not a directory')
      state.cwd = target
      const promptEl = document.getElementById('prompt')
      if (promptEl) promptEl.textContent = pathDisplay(state.cwd) + ' $'
    },
    cat: (args) => {
      if (!args[0]) return errFn('cat: missing operand')
      const target = resolvePath(args[0])
      const node = getNode(target)
      if (!node) return errFn('cat: ' + args[0] + ': no such file or directory')
      if (node.type !== 'file') return errFn('cat: ' + args[0] + ': is a directory')
      const file = node as FileNode
      const lines = file.body.split('\n')
      if (lines.length && lines[lines.length - 1] === '') lines.pop()
      for (const ln of lines) addLine(highlight(ln, file.lang) || '&nbsp;')
      if (target[0] === PROJECT_NAME) openFile(target)
    },
    vim: (args) => {
      if (!args[0]) {
        addLine(
          '<span class="ye">E437:</span> terminal capability "cm" required (try <span class="ac">vim &lt;file&gt;</span>)'
        )
        return
      }
      const target = resolvePath(args[0])
      const node = getNode(target)
      if (!node) return errFn('vim: ' + args[0] + ': no such file or directory')
      if (node.type !== 'file') return errFn('vim: ' + args[0] + ': is a directory')
      if (target[0] !== PROJECT_NAME)
        return errFn('vim: cannot open files outside ~/' + PROJECT_NAME + '')
      openFile(target)
      addLine('<span class="gr">↗ opened ' + esc(args[0]) + ' in editor</span>')
    },
    mkdir: (args) => {
      if (!args[0]) return errFn('mkdir: missing operand')
      const target = resolvePath(args[0])
      if (!target.length) return errFn('mkdir: invalid path')
      const parent = getNode(target.slice(0, -1))
      const name = target[target.length - 1]
      if (!parent || parent.type !== 'dir')
        return errFn('mkdir: ' + args[0] + ': no such directory')
      if ((parent as DirNode).children[name]) return errFn('mkdir: ' + args[0] + ': file exists')
      ;(parent as DirNode).children[name] = _d()
    },
    touch: (args) => {
      if (!args[0]) return errFn('touch: missing operand')
      const target = resolvePath(args[0])
      const parent = getNode(target.slice(0, -1))
      const name = target[target.length - 1]
      if (!parent || parent.type !== 'dir') return errFn('touch: ' + args[0] + ': cannot create')
      if ((parent as DirNode).children[name]) return
      const ext = (name.split('.').pop() || '').toLowerCase()
      const langMap: Record<string, string> = {
        ts: 'ts',
        tsx: 'ts',
        js: 'ts',
        mjs: 'ts',
        rs: 'rs',
        md: 'md',
        json: 'json',
        toml: 'toml',
      }
      ;(parent as DirNode).children[name] = {
        type: 'file',
        lang: langMap[ext] || 'plain',
        body: '',
      }
    },
    rm: (args) => {
      const flags = args.filter((a) => a.startsWith('-'))
      const targets = args.filter((a) => !a.startsWith('-'))
      if (!targets.length) return errFn('rm: missing operand')
      const recursive = flags.some((f) => /r/.test(f))
      for (const t of targets) {
        const tp = resolvePath(t)
        const parent = getNode(tp.slice(0, -1))
        const name = tp[tp.length - 1]
        if (!parent || parent.type !== 'dir' || !(parent as DirNode).children[name]) {
          errFn('rm: ' + t + ': no such file or directory')
          continue
        }
        const target = (parent as DirNode).children[name]
        if (target.type === 'dir' && !recursive) {
          errFn('rm: ' + t + ': is a directory')
          continue
        }
        delete (parent as DirNode).children[name]
      }
    },
    rmdir: (args) => {
      if (!args[0]) return errFn('rmdir: missing operand')
      const tp = resolvePath(args[0])
      const parent = getNode(tp.slice(0, -1))
      const name = tp[tp.length - 1]
      if (!parent || parent.type !== 'dir') return errFn('rmdir: ' + args[0] + ': not a directory')
      const node = (parent as DirNode).children[name]
      if (!node || node.type !== 'dir') return errFn('rmdir: ' + args[0] + ': not a directory')
      if (Object.keys(node.children).length)
        return errFn('rmdir: ' + args[0] + ': directory not empty')
      delete (parent as DirNode).children[name]
    },
    mv: (args) => {
      if (args.length < 2) return errFn('mv: missing operand')
      const src = resolvePath(args[0])
      const dst = resolvePath(args[1])
      const sParent = getNode(src.slice(0, -1))
      const sName = src[src.length - 1]
      if (!sParent || sParent.type !== 'dir' || !(sParent as DirNode).children[sName])
        return errFn('mv: ' + args[0] + ': no such file or directory')
      const dParent = getNode(dst.slice(0, -1))
      const dName = dst[dst.length - 1]
      if (!dParent || dParent.type !== 'dir') return errFn('mv: ' + args[1] + ': no such directory')
      ;(dParent as DirNode).children[dName] = (sParent as DirNode).children[sName]
      delete (sParent as DirNode).children[sName]
    },
    echo: (args) => addLine(esc(args.join(' '))),
    tree: () => {
      const node = getNode(state.cwd)
      if (!node || node.type !== 'dir') return
      addLine('<span class="ac">' + esc(pathDisplay(state.cwd)) + '</span>')
      const walk = (n: DirNode, prefix: string, depth: number): void => {
        if (depth > 3) return
        const entries = Object.entries(n.children).sort((a, b) => {
          if (a[1].type !== b[1].type) return a[1].type === 'dir' ? -1 : 1
          return a[0].localeCompare(b[0])
        })
        entries.forEach(([name, c], i) => {
          const last = i === entries.length - 1
          const branch = last ? '└── ' : '├── '
          addLine(
            '<span class="gr">' +
              esc(prefix + branch) +
              '</span>' +
              (c.type === 'dir' ? '<span class="ac">' + esc(name) + '/</span>' : esc(name))
          )
          if (c.type === 'dir') walk(c, prefix + (last ? '    ' : '│   '), depth + 1)
        })
      }
      walk(node, '', 0)
    },
    history: () => {
      state.history.forEach((h, i) =>
        addLine('  <span class="gr">' + (i + 1) + '</span>  ' + esc(h))
      )
    },
    clear: clearFn,
    help: () => {
      addLine(
        '<span class="gr">filesystem:</span> <span class="ac">ls</span> <span class="ac">cd</span> <span class="ac">pwd</span> <span class="ac">cat</span> <span class="ac">tree</span> <span class="ac">mkdir</span> <span class="ac">touch</span> <span class="ac">rm</span> <span class="ac">rmdir</span> <span class="ac">mv</span> <span class="ac">echo</span>'
      )
      addLine(
        '<span class="gr">editor:</span>     <span class="ac">vim</span>  → opens a file in the panel above'
      )
      addLine(
        '<span class="gr">about me:</span>   <span class="ac">whoami</span> <span class="ac">about</span> <span class="ac">work</span> <span class="ac">stack</span> <span class="ac">repos</span> <span class="ac">contact</span> <span class="ac">life</span>'
      )
      addLine(
        '<span class="gr">utility:</span>    <span class="ac">date</span> <span class="ac">uname</span> <span class="ac">history</span> <span class="ac">clear</span>  ·  <span class="gr">↑/↓</span> history  <span class="gr">⌃L</span> clear'
      )
    },
    about: () => {
      addLine('kevin gámez · founding engineer @ enttor · bogotá')
      addLine('b.sc. systems & computing + m.sc. info eng (deep learning) @ uniandes')
    },
    work: () => {
      addLine(
        '<span class="ac">enttor</span>          → ai outbound · browser automation · openai pipelines'
      )
      addLine(
        '<span class="ac">samsam</span>          → e-commerce · ts/react native/next/prisma/postgres'
      )
      addLine('<span class="ac">personal-site</span>   → astro · this page')
    },
    stack: () => {
      addLine('<span class="di">frontend</span>  next.js · react · react native · astro · tailwind')
      addLine('<span class="di">backend</span>   nestjs · postgres · prisma · supabase · inngest')
      addLine('<span class="di">ai/ml</span>     openai · pytorch · opencv · browser automation')
    },
    repos: () => {
      addLine('kevingamez/<span class="ac">personal-site</span>           typescript')
      addLine('kevingamez/<span class="ac">AD_ASTRA2023-SpaceInvaders</span>  python')
      addLine('kevingamez/<span class="ac">Palladium_Chat</span>          typescript')
      addLine('kevingamez/<span class="ac">budget-app</span>              swift')
      addLine('kevingamez/<span class="ac">GCP-CloudRun</span>            dockerfile')
    },
    contact: () => {
      addLine('<span class="em">email</span>     kevingamez.kg@gmail.com')
      addLine('<span class="em">github</span>    github.com/kevingamez')
      addLine('<span class="em">linkedin</span>  linkedin.com/in/kevin-gamez')
    },
    life: () => addLine('↗ opening conway\'s game of life… see hero on <span class="ac">/</span>'),
  }

  // Aliases
  ;(['ll', 'dir'] as const).forEach((a) => (commands[a] = commands.ls))
  ;(['nvim', 'open', 'edit'] as const).forEach((a) => (commands[a] = commands.vim))
  commands['cls'] = commands.clear
  commands['man'] = (args) => {
    if (!args[0]) return errFn('what manual page do you want?')
    if (commands[args[0]])
      addLine(
        '<span class="gr">no man page — try just running</span> <span class="ac">' +
          esc(args[0]) +
          '</span>'
      )
    else errFn('No manual entry for ' + args[0])
  }

  return commands
}

export function tokenize(line: string): string[] {
  return (line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []).map((t) => {
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
      return t.slice(1, -1)
    return t
  })
}
