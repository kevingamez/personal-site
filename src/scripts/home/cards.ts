// "Pick a card" deck: a tablist of five fanned cards. Clicking (or arrowing
// between) cards swaps the panel below. The deal-in animation only runs when
// motion is allowed; without JS the fan renders in its final state and the
// first panel is visible.

export function initDeck(): void {
  const stage = document.querySelector<HTMLElement>('[data-deck]')
  if (!stage) return
  const fan = stage.querySelector<HTMLElement>('.deck-fan')
  const cards = Array.from(stage.querySelectorAll<HTMLButtonElement>('[data-deck-card]'))
  const panels = Array.from(stage.querySelectorAll<HTMLElement>('.deck-panel'))
  if (!fan || cards.length === 0) return

  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (motionOk && typeof IntersectionObserver !== 'undefined') {
    fan.classList.add('pre-deal')
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          obs.disconnect()
          fan.classList.add('dealing')
          window.requestAnimationFrame(() => fan.classList.remove('pre-deal'))
          window.setTimeout(() => fan.classList.remove('dealing'), 1200)
          break
        }
      },
      { threshold: 0.25 }
    )
    io.observe(fan)
  }

  let current = 0
  const select = (idx: number, focus: boolean): void => {
    const card = cards[idx]
    if (idx === current || !card) return
    cards[current]?.classList.remove('active')
    cards[current]?.setAttribute('aria-selected', 'false')
    cards[current]?.setAttribute('tabindex', '-1')
    panels[current]?.setAttribute('hidden', '')
    current = idx
    card.classList.add('active')
    card.setAttribute('aria-selected', 'true')
    card.setAttribute('tabindex', '0')
    if (focus) card.focus()
    const panel = panels[idx]
    if (!panel) return
    panel.removeAttribute('hidden')
    if (motionOk) {
      panel.classList.remove('dp-in')
      void panel.offsetWidth
      panel.classList.add('dp-in')
    }
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => select(i, false))
    card.addEventListener('keydown', (ev) => {
      let next = -1
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = (i + 1) % cards.length
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp')
        next = (i - 1 + cards.length) % cards.length
      else if (ev.key === 'Home') next = 0
      else if (ev.key === 'End') next = cards.length - 1
      if (next < 0) return
      ev.preventDefault()
      select(next, true)
    })
  })
}
