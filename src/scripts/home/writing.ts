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
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    feed.scrollTo({ left: target.offsetLeft - feed.offsetLeft - 24, behavior })
  }

  function maxScroll(): number {
    return feed ? feed.scrollWidth - feed.clientWidth : 0
  }

  // Several cards fit per view, so the leftmost card never reaches the last
  // index and the old card-based index left dead dots and a dead next-arrow
  // at the end of the strip. Map scroll progress across the dots instead:
  // start = first dot, fully scrolled = last dot.
  function activeIndex(): number {
    if (!feed) return 0
    const max = maxScroll()
    if (max <= 0) return 0
    return Math.round((feed.scrollLeft / max) * (cards.length - 1))
  }

  function update(): void {
    if (!feed) return
    const i = activeIndex()
    dots.forEach((d, j) => d.classList.toggle('on', j === i))
    if (prev) prev.hidden = feed.scrollLeft <= 4
    if (next) next.hidden = feed.scrollLeft >= maxScroll() - 4
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
  window.addEventListener('resize', update)
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
