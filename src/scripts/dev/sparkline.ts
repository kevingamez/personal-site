// Live sparkline animation in the dev page status strip. Pauses entirely
// when the user prefers reduced motion (the static last frame stays visible).

export function initSparkline(): void {
  const s = document.getElementById('spark')
  if (!s) return
  const N = 30
  const arr = Array.from({ length: N }, () => 30 + Math.random() * 60)

  function render(): void {
    if (!s) return
    s.innerHTML = ''
    for (const v of arr) {
      const sp = document.createElement('span')
      sp.style.height = v + '%'
      s.appendChild(sp)
    }
  }
  render()

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  let timer: ReturnType<typeof setInterval> | null = null

  function tick(): void {
    arr.shift()
    arr.push(40 + Math.random() * 55)
    render()
  }
  function start(): void {
    if (timer !== null) return
    timer = setInterval(tick, 1800)
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
