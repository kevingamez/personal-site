// Runs the AI Ad Studio surface: brief typed in, plan, then five ads rendering.
//
// The three tile states mirror the product (adgen.css): a shimmering skeleton,
// then `forming` where an intermediate render shows through blurred, then the
// resolved ad. Ads land out of order because the real pipeline returns them
// that way. Loops only while on screen, and settles instantly under
// prefers-reduced-motion.

const BRIEF =
  'Only use health-based outcome headlines. Focus on how the customer feels after using the product, not what the product does.'

// Compositions, not copy: a render reads as its layout (text mass, segmented
// object, CTA). Inventing headlines would be filler.
const ADS = [
  { bg: 'linear-gradient(160deg,#1f4d3f,#0e2a22)', obj: '#c6f24e', w: [72, 46] },
  { bg: '#14213d', obj: '#f0b429', w: [60, 80] },
  { bg: 'linear-gradient(160deg,#3a2a5e,#191029)', obj: '#e8e3ff', w: [84, 38] },
  { bg: '#242427', obj: '#6ede9a', w: [54, 68] },
  { bg: 'linear-gradient(160deg,#5a2e2e,#241111)', obj: '#f2f2f7', w: [76, 52] },
]

const art = (a: (typeof ADS)[number]): string => `
  <div class="as-art">
    <div class="as-bg" style="background:${a.bg}"></div>
    <div class="as-h"><i style="width:${a.w[0]}%"></i><i style="width:${a.w[1]}%"></i></div>
    <div class="as-obj" style="background:${a.obj}"></div>
    <div class="as-cta"></div>
  </div>
  <div class="as-lay">
    <div class="as-lbox" style="left:7%;top:6%;right:7%;height:17%"><span>headline</span></div>
    <div class="as-lbox" style="left:25%;top:31%;width:50%;height:42%"><span>object, SAM 3</span></div>
    <div class="as-lbox" style="left:7%;bottom:6%;width:36%;height:12%"><span>cta, OCR</span></div>
  </div>`

export function initAdStudio(): void {
  const root = document.querySelector<HTMLElement>('.as')
  if (!root) return
  const grid = root.querySelector<HTMLElement>('[data-as-grid]')
  const status = root.querySelector<HTMLElement>('[data-as-status]')
  const brief = root.querySelector<HTMLElement>('[data-as-brief]')
  const create = root.querySelector<HTMLElement>('[data-as-create]')
  const tiles = [...root.querySelectorAll<HTMLElement>('[data-as-tile]')]
  if (!grid || !status || !brief || !create) return

  // The surface keeps the real site's pixel dimensions and is scaled to fit,
  // so proportions never drift from what enttor.ai actually looked like.
  const stage = root.querySelector<HTMLElement>('[data-as-stage]')
  const composer = root.querySelector<HTMLElement>('.as-composer')

  // Three limits decide the zoom: never show more than 1053px of canvas across
  // (the real app's width), never more than 620px down (past that a tall column
  // is just empty canvas), and never shrink below 0.6 or the composer text stops
  // being readable on a phone. Whichever binds wins, and the surface then gets
  // exactly that much design space, so the layout reflows instead of shrinking.
  const DESIGN_W = 1053
  const DESIGN_H = 620
  const MIN_SCALE = 0.6
  const fit = (): void => {
    if (!stage) return
    const s = Math.max(MIN_SCALE, root.clientWidth / DESIGN_W, root.clientHeight / DESIGN_H)
    root.style.setProperty('--as-scale', String(s))
    const dw = root.clientWidth / s
    root.style.setProperty('--as-dw', `${dw}px`)
    root.style.setProperty('--as-dh', `${root.clientHeight / s}px`)
    // The corner chrome sits in the gutter beside the 720px composer, so it
    // only clears once the canvas is wide enough to leave one. Measured against
    // the real geometry rather than a breakpoint, since the design width here
    // is a computed value and not a viewport.
    const gutter = (dw - Math.min(720, dw - 48)) / 2
    root.classList.toggle('is-tight', gutter < 148)
    // Narrower still and the centred status pill runs into the auth buttons.
    root.classList.toggle('is-narrow', dw < 560)
  }
  fit()
  new ResizeObserver(fit).observe(root)

  // The brief wraps to more lines as the surface narrows, so the board has to
  // clear whatever height the composer actually ends up with.
  if (composer) {
    new ResizeObserver(() => {
      root.style.setProperty('--as-cb', `${composer.offsetHeight}px`)
    }).observe(composer)
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, reduced ? 0 : ms))

  const setStatus = (t: string): void => {
    if (!t) {
      status.classList.remove('is-on')
      return
    }
    status.textContent = t
    status.classList.add('is-on')
  }

  let timers: ReturnType<typeof setTimeout>[] = []
  const later = (fn: () => void, ms: number): void => {
    timers.push(setTimeout(fn, ms))
  }

  function type(text: string, ms: number): Promise<void> {
    return new Promise((done) => {
      brief!.classList.remove('is-ph')
      const speed = Math.max(16, (ms * 0.8) / text.length)
      let i = 0
      const id = setInterval(
        () => {
          i += 1
          brief!.innerHTML = `${text.slice(0, i)}<span class="as-caret"></span>`
          if (i >= text.length) {
            clearInterval(id)
            done()
          }
        },
        reduced ? 1 : speed
      )
      timers.push(id as unknown as ReturnType<typeof setTimeout>)
    })
  }

  async function cycle(): Promise<void> {
    grid!.innerHTML = ''
    setStatus('')
    create!.className = 'as-create is-off'
    create!.textContent = 'Create 5 ads'
    brief!.className = 'as-brief is-ph'
    brief!.textContent = BRIEF
    tiles.forEach((t) => t.classList.remove('is-filled'))
    await wait(900)

    for (const t of tiles) {
      await wait(520)
      t.classList.add('is-filled')
    }
    await type(BRIEF, 3000)
    await wait(400)
    create!.className = 'as-create'
    await wait(900)

    // The plan is drafted before anything renders, so a concept can be dropped.
    setStatus('Planning concepts')
    create!.className = 'as-create is-off'
    create!.textContent = 'Creating'
    await wait(1800)

    grid!.innerHTML = ADS.map(
      (
        a,
        i
      ) => `<div class="as-card"><div class="as-shot">${art(a)}<div class="as-skel"></div></div>
        <div class="as-foot"><span>0${i + 1}</span><span class="as-j"></span></div></div>`
    ).join('')
    const cards = [...grid!.querySelectorAll<HTMLElement>('.as-card')]
    for (const c of cards) {
      await wait(110)
      c.classList.add('is-in')
    }

    let secs = 148
    const eta = setInterval(
      () => {
        secs -= 2
        setStatus(secs > 12 ? `about ${Math.floor(secs / 60)}m ${secs % 60}s left` : 'almost done')
      },
      reduced ? 1e6 : 260
    )
    timers.push(eta as unknown as ReturnType<typeof setTimeout>)
    setStatus(`about ${Math.floor(secs / 60)}m ${secs % 60}s left`)

    const shots = [...grid!.querySelectorAll<HTMLElement>('.as-shot')].sort(
      () => Math.random() - 0.5
    )
    for (const s of shots) {
      await wait(520)
      s.classList.add('is-forming')
      later(() => s.classList.add('is-landed'), reduced ? 0 : 900)
    }
    await wait(1300)
    clearInterval(eta)

    setStatus('Vision pass judging')
    const kept: HTMLElement[] = []
    for (const c of cards) {
      await wait(340)
      const j = c.querySelector<HTMLElement>('.as-j')
      if (!j) continue
      const keep = Math.random() < 0.75
      j.textContent = keep ? 'kept' : 'reroll'
      j.className = `as-j is-in ${keep ? 'is-keep' : 'is-drop'}`
      if (keep) kept.push(c)
    }
    await wait(600)

    setStatus('Layerized, ready to edit')
    create!.className = 'as-create'
    create!.textContent = 'Create 5 ads'
    ;(kept[0] || cards[0])?.querySelector('.as-shot')?.classList.add('is-layered')
    await wait(4200)
  }

  // A generation token, so leaving and re-entering the viewport can never leave
  // two loops running at once (one resetting while the other renders).
  let gen = 0
  let running = false

  const io = new IntersectionObserver(
    async (entries) => {
      const on = entries.some((e) => e.isIntersecting)
      if (!on) {
        gen += 1
        running = false
        timers.forEach((t) => clearTimeout(t as unknown as number))
        timers = []
        return
      }
      if (running) return
      running = true
      const mine = gen
      // Under reduced motion every step resolves at once, so looping would just
      // churn the DOM forever: run the cycle once and leave the finished board.
      do {
        await cycle()
      } while (!reduced && mine === gen)
      running = false
    },
    { threshold: 0.25 }
  )
  io.observe(root)
}
