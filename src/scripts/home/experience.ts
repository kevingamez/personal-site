// Experience section behaviour: click-to-open rows + scroll progress on the
// top rule. Markup comes from src/components/home/Experience.tsx.
//
// Progressive enhancement: the collapsing is gated on the `exp-on` class this
// script adds, so with no JS every panel stays open and readable.

function openRow(row: HTMLElement, panel: HTMLElement, open: boolean): void {
  panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px'
  panel.style.opacity = open ? '1' : '0'
  if (open) row.setAttribute('data-exp-open', '')
  else row.removeAttribute('data-exp-open')
  row.querySelector('[data-exp-toggle]')?.setAttribute('aria-expanded', String(open))
}

function initRows(rail: HTMLElement): void {
  const rows = Array.from(rail.querySelectorAll<HTMLElement>('[data-exp-row]'))

  for (const row of rows) {
    const panel = row.querySelector<HTMLElement>('[data-exp-panel]')
    const toggle = row.querySelector<HTMLElement>('[data-exp-toggle]')
    if (!panel || !toggle) continue

    openRow(row, panel, row.hasAttribute('data-exp-open'))
    toggle.addEventListener('click', () => {
      openRow(row, panel, !row.hasAttribute('data-exp-open'))
    })
  }

  // Keep an open panel's height correct when the text reflows.
  if (typeof ResizeObserver === 'undefined') return
  const ro = new ResizeObserver(() => {
    for (const row of rows) {
      const panel = row.querySelector<HTMLElement>('[data-exp-panel]')
      if (panel && row.hasAttribute('data-exp-open')) {
        panel.style.maxHeight = `${panel.scrollHeight}px`
      }
    }
  })
  ro.observe(rail)
}

function initProgress(rail: HTMLElement): void {
  const fill = rail.querySelector<HTMLElement>('[data-exp-fill]')
  if (!fill) return

  let queued = false
  // The rail is off screen for most of the page, where `p` clamps to the same
  // 0 or 1 every frame. Writing the identical width anyway dirtied style on
  // every scroll frame, which is what turns a later rect read in the same
  // frame into a forced synchronous layout.
  let lastWidth = ''
  const paint = () => {
    queued = false
    const r = rail.getBoundingClientRect()
    const mark = window.innerHeight * 0.62
    const p = Math.min(1, Math.max(0, (mark - r.top) / Math.max(r.height, 1)))
    const width = `${(p * 100).toFixed(2)}%`
    if (width === lastWidth) return
    lastWidth = width
    fill.style.width = width
  }
  const onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(paint)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  paint()
}

export function initExperience(): void {
  const section = document.querySelector<HTMLElement>('[data-exp-section]')
  const rail = section?.querySelector<HTMLElement>('[data-exp-rail]')
  if (!section || !rail) return

  section.classList.add('exp-on')
  initRows(rail)
  initProgress(rail)
}
