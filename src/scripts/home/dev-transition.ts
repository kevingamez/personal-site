// Smooth transition into /dev: instead of an immediate hard navigation we
// briefly fade in a CRT-style terminal-boot overlay, then navigate. Gives the
// editorial home → IDE jump some narrative weight ("you are entering dev
// mode") without feeling slow. Total time ~650ms; reduced-motion users get
// the plain instant navigation.

const BOOT_LINES = ['> booting dev mode', '> mounting workspace', '> opening editor']

export function initDevTransition(): void {
  const toggle = document.querySelector<HTMLAnchorElement>('a.dev-toggle')
  if (!toggle) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  toggle.addEventListener('click', (e) => {
    // Honor middle-click / cmd-click / ctrl-click → open in new tab as usual
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const href = toggle.getAttribute('href') || '/dev/'

    const overlay = document.createElement('div')
    overlay.className = 'dev-transition'
    overlay.innerHTML = `
      <div class="dev-transition-inner">
        ${BOOT_LINES.map((l) => `<div class="dev-transition-line">${l}</div>`).join('')}
        <div class="dev-transition-line dev-transition-prompt">$<span class="dev-transition-cursor"></span></div>
      </div>
    `
    document.body.appendChild(overlay)

    requestAnimationFrame(() => overlay.classList.add('on'))

    window.setTimeout(() => {
      window.location.href = href
    }, 1500)
  })
}
