// §06 Writing carousel - wires the prev/next buttons and dots.

export function initWriting(): void {
  const feed = document.getElementById('writing-feed')
  if (!feed) return

  const prev = document.querySelector<HTMLButtonElement>('[data-feed-prev]')
  const next = document.querySelector<HTMLButtonElement>('[data-feed-next]')
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-dot-index]'))
  const cards = Array.from(feed.querySelectorAll<HTMLElement>('.post-card'))
  if (!cards.length) return

  function scrollToIndex(i: number): void {
    if (!feed) return
    const target = cards[Math.max(0, Math.min(i, cards.length - 1))]
    if (!target) return
    feed.scrollTo({ left: target.offsetLeft - feed.offsetLeft - 24, behavior: 'smooth' })
  }

  function activeIndex(): number {
    if (!feed) return 0
    const x = feed.scrollLeft + 32
    let best = 0
    let bestDist = Infinity
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - feed.offsetLeft - x)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  function update(): void {
    const i = activeIndex()
    dots.forEach((d, j) => d.classList.toggle('on', j === i))
    if (prev) prev.hidden = i === 0
    if (next) next.hidden = i >= cards.length - 1
  }

  prev?.addEventListener('click', () => scrollToIndex(activeIndex() - 1))
  next?.addEventListener('click', () => scrollToIndex(activeIndex() + 1))
  dots.forEach((d, i) => d.addEventListener('click', () => scrollToIndex(i)))

  let raf = 0
  feed.addEventListener('scroll', () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      update()
    })
  })
  feed.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollToIndex(activeIndex() + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollToIndex(activeIndex() - 1)
    }
  })

  update()
}
