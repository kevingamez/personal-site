// Vite build/tail "loops" rendered into the secondary terminal tabs.
// They simulate `vite dev` and JSON access logs respectively. Both pause when
// the user prefers reduced motion (the captured lines stay visible).

const VITE_FILES = [
  'src/pages/index.astro',
  'src/pages/dev.astro',
  'src/pages/es/index.astro',
  'src/middleware.ts',
]

function nowTs(): string {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
}

const VITE_CYCLES: Array<(file: string) => Array<{ delay: number; html: string }>> = [
  (file) => [
    {
      delay: 0,
      html:
        '<span class="vite">[vite]</span> <span class="ts">' +
        nowTs() +
        '</span> file change detected: <span class="arrow">' +
        file +
        '</span>',
    },
    {
      delay: 220,
      html: '<span class="vite">[vite]</span> hmr update <span class="arrow">' + file + '</span>',
    },
    {
      delay: 480,
      html:
        '<span class="vite">[vite]</span> <span class="lvl-info">✓</span> updated <span class="num">' +
        (1 + Math.floor(Math.random() * 5)) +
        '</span> modules in <span class="ts">' +
        (8 + Math.floor(Math.random() * 30)) +
        'ms</span>',
    },
  ],
  (file) => [
    {
      delay: 0,
      html:
        '<span class="vite">[vite]</span> <span class="ts">' +
        nowTs() +
        '</span> page reload <span class="arrow">' +
        file +
        '</span>',
    },
    { delay: 280, html: '<span class="vite">[vite]</span> transforming…' },
    {
      delay: 540,
      html:
        '<span class="vite">[vite]</span> <span class="lvl-info">✓</span> ready in <span class="ts">' +
        (60 + Math.floor(Math.random() * 80)) +
        'ms</span>',
    },
  ],
  () => [
    {
      delay: 0,
      html: '<span class="lvl-warn">[warn]</span> slow type-check on <span class="arrow">src/pages/dev.astro</span> · <span class="ts">820ms</span>',
    },
    {
      delay: 320,
      html: '<span class="vite">[vite]</span> <span class="lvl-info">✓</span> diagnostics clean',
    },
  ],
]

const TAIL_PATHS = [
  '/',
  '/dev',
  '/es/',
  '/api/now',
  '/api/repos',
  '/api/eval',
  '/sitemap.xml',
  '/favicon.svg',
  '/robots.txt',
]

function tailLine(): string {
  const path = TAIL_PATHS[Math.floor(Math.random() * TAIL_PATHS.length)]
  const ms = 18 + Math.floor(Math.random() * 240)
  const r = Math.random()
  let lvl: 'err' | 'warn' | 'info'
  let status: number
  if (r > 0.97) {
    lvl = 'err'
    status = 500
  } else if (r > 0.92) {
    lvl = 'warn'
    status = 404
  } else {
    lvl = 'info'
    status = 200
  }
  const ts = new Date().toISOString()
  return (
    '<span class="key">{</span>' +
    '"<span class="key">t</span>":"<span class="ts">' +
    ts +
    '</span>",' +
    '"<span class="key">lvl</span>":"<span class="lvl-' +
    lvl +
    '">' +
    lvl +
    '</span>",' +
    '"<span class="key">path</span>":"<span class="arrow">' +
    path +
    '</span>",' +
    '"<span class="key">ms</span>":<span class="num">' +
    ms +
    '</span>,' +
    '"<span class="key">status</span>":<span class="num">' +
    status +
    '</span>' +
    '<span class="key">}</span>'
  )
}

function streamAdd(el: HTMLElement, html: string, lineNum: number): void {
  const div = document.createElement('div')
  div.className = 'ln'
  div.innerHTML = '<span class="gut">' + lineNum + '</span><span class="txt">' + html + '</span>'
  el.appendChild(div)
  while (el.children.length > 200 && el.firstChild) el.removeChild(el.firstChild)
  el.scrollTop = el.scrollHeight
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

export function makeBuildLoop(termBuildEl: HTMLElement): { start(): void; stop(): void } {
  let timer: ReturnType<typeof setInterval> | null = null
  let buildLineNum = 0
  // Each cycle schedules a few delayed appends; track them so stop() can cancel
  // any still in flight (otherwise they fire into a hidden/stopped pane).
  let timeouts: Array<ReturnType<typeof setTimeout>> = []
  function cycle(): void {
    // Prior cycle's timeouts have all fired (max delay << the 2400ms interval).
    timeouts = []
    const file = VITE_FILES[Math.floor(Math.random() * VITE_FILES.length)]
    const steps = VITE_CYCLES[Math.floor(Math.random() * VITE_CYCLES.length)](file)
    steps.forEach((s) =>
      timeouts.push(setTimeout(() => streamAdd(termBuildEl, s.html, ++buildLineNum), s.delay))
    )
  }
  function stop(): void {
    if (timer) clearInterval(timer)
    timer = null
    for (const id of timeouts) clearTimeout(id)
    timeouts = []
  }
  function start(): void {
    if (timer) return
    if (!termBuildEl.children.length) {
      streamAdd(
        termBuildEl,
        '<span class="vite">[vite]</span> dev server running at <span class="arrow">http://localhost:4321</span>',
        ++buildLineNum
      )
      streamAdd(
        termBuildEl,
        '<span class="vite">[vite]</span> <span class="lvl-info">✓</span> ready in <span class="ts">218ms</span>',
        ++buildLineNum
      )
      streamAdd(
        termBuildEl,
        '<span class="lvl-info">watching</span> ./src for changes…',
        ++buildLineNum
      )
    }
    if (reduce.matches) return
    cycle()
    timer = setInterval(cycle, 2400)
  }
  // Stop immediately if the user opts into reduced motion mid-session.
  reduce.addEventListener('change', () => {
    if (reduce.matches) stop()
  })
  return { start, stop }
}

export function makeTailLoop(termTailEl: HTMLElement): { start(): void; stop(): void } {
  let timer: ReturnType<typeof setInterval> | null = null
  let tailLineNum = 0
  function stop(): void {
    if (timer) clearInterval(timer)
    timer = null
  }
  function start(): void {
    if (timer) return
    if (!termTailEl.children.length) {
      for (let i = 0; i < 6; i++) streamAdd(termTailEl, tailLine(), ++tailLineNum)
    }
    if (reduce.matches) return
    timer = setInterval(
      () => streamAdd(termTailEl, tailLine(), ++tailLineNum),
      1100 + Math.random() * 900
    )
  }
  reduce.addEventListener('change', () => {
    if (reduce.matches) stop()
  })
  return { start, stop }
}
