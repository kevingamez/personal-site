// Live request log in the dev page sidebar. Stops streaming when the user
// prefers reduced motion (the existing entries remain visible).

export function initRequestLog(): void {
  const reqs = document.getElementById('reqs')
  if (!reqs) return

  const paths = [
    'GET /api/now',
    'GET /api/repos',
    'GET /',
    'GET /life/state',
    'POST /api/eval',
    'GET /work',
    'GET /about',
    'GET /sitemap.xml',
  ]

  function tick(): void {
    if (!reqs) return
    const p = paths[Math.floor(Math.random() * paths.length)]
    const ms = 20 + Math.floor(Math.random() * 180)
    const status = Math.random() > 0.95 ? '4xx' : '200'
    const cls = status === '200' ? 'm200' : 'm4xx'
    const r = document.createElement('div')
    r.className = 'r'
    r.innerHTML =
      '<span class="' +
      cls +
      '">' +
      (status === '200' ? '200' : '404') +
      '</span><span class="ms">' +
      ms +
      'ms</span><span class="pa">' +
      p +
      '</span>'
    reqs.insertBefore(r, reqs.firstChild)
    while (reqs.children.length > 7 && reqs.lastChild) reqs.removeChild(reqs.lastChild)
  }

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  let timer: ReturnType<typeof setInterval> | null = null
  function start(): void {
    if (timer !== null) return
    timer = setInterval(tick, 2200)
  }
  function stop(): void {
    if (timer !== null) clearInterval(timer)
    timer = null
  }

  if (!mq.matches) start()
  mq.addEventListener('change', () => {
    if (mq.matches) stop()
    else start()
  })
}
