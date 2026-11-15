// The phone's bottom navigation: a toggle that opens a sheet of section links,
// and a label on that toggle naming the section currently on screen.

const READ_LINE = 0.45 // fraction of the viewport a section must cross to count as current

export function initMobileNav(): void {
  const bar = document.querySelector<HTMLElement>('[data-mobile-cta]')
  const toggle = bar?.querySelector<HTMLButtonElement>('[data-mnav-toggle]')
  const sheet = bar?.querySelector<HTMLElement>('[data-mnav-sheet]')
  const label = bar?.querySelector<HTMLElement>('[data-mnav-label]')
  if (!bar || !toggle || !sheet || !label) return

  // Without this class the bar stays off screen, so a visitor with JS disabled
  // never gets a menu button that cannot open anything.
  document.documentElement.classList.add('mcta-on')

  let open = false
  const set = (next: boolean): void => {
    if (next === open) return
    open = next
    bar.classList.toggle('mnav-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    sheet.inert = !open
  }

  toggle.addEventListener('click', (e) => {
    set(!open)
    // detail is 0 for a keyboard activation: only then move focus into the
    // sheet, so a tap does not throw a focus ring onto the first link.
    if (open && e.detail === 0) sheet.querySelector<HTMLElement>('a')?.focus()
  })

  sheet.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false)
  })

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !open) return
    set(false)
    toggle.focus()
  })

  document.addEventListener('pointerdown', (e) => {
    if (open && !bar.contains(e.target as Node)) set(false)
  })

  // Where you are. The toggle reads "Menu" on the hero and the section's own
  // name after that, so the bar answers "where am I" without being opened.
  const links = [...sheet.querySelectorAll<HTMLAnchorElement>('[data-mnav-link]')]
  const fallback = toggle.dataset.mnavDefault || label.textContent || ''
  let current = ''
  let queued = false

  const update = (): void => {
    queued = false
    const line = window.innerHeight * READ_LINE
    let next = ''
    for (const link of links) {
      const id = link.dataset.mnavLink!
      const el = document.getElementById(id)
      // A hidden section (Strava before its data lands) reports a top of 0,
      // which would read as "scrolled past": only laid-out sections count.
      if (el && el.getClientRects().length && el.getBoundingClientRect().top <= line) next = id
    }
    if (next === current) return
    current = next
    for (const link of links) {
      if (link.dataset.mnavLink === current) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    }
    label.textContent = links.find((l) => l.dataset.mnavLink === current)?.textContent || fallback
  }

  const schedule = (): void => {
    if (queued) return
    queued = true
    requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}
