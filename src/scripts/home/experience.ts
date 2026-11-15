// Experience section behaviour: click-to-open rows + scroll progress on the
// top rule. Markup comes from src/components/home/Experience.tsx.
//
// Progressive enhancement: the collapsing is gated on the `exp-on` class this
// script adds, so with no JS every panel stays open and readable.

// The height itself is animated in CSS, through a grid row that goes from 0fr
// to 1fr. The script used to measure each panel and write a max-height in
// pixels, which meant re-measuring on every resize and a panel that could clip
// if its text reflowed mid-transition. Now it only says which row is open.
function openRow(row: HTMLElement, open: boolean): void {
  if (open) row.setAttribute('data-exp-open', '')
  else row.removeAttribute('data-exp-open')
  row.querySelector('[data-exp-toggle]')?.setAttribute('aria-expanded', String(open))
}

function initRows(rail: HTMLElement): void {
  for (const row of rail.querySelectorAll<HTMLElement>('[data-exp-row]')) {
    const toggle = row.querySelector<HTMLElement>('[data-exp-toggle]')
    if (!toggle) continue
    toggle.addEventListener('click', () => openRow(row, !row.hasAttribute('data-exp-open')))
  }
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
