// Served as an external file so the page works under a CSP without
// `script-src 'unsafe-inline'`.

for (const link of document.querySelectorAll('link[rel="preload"][as="style"]')) {
  link.rel = 'stylesheet'
}

// Intro curtain gate: only the home pages, only once per browsing session,
// only when motion is allowed. The curtain markup stays display:none unless
// this class lands. The session flag and a safety release both live HERE so
// the scroll lock never depends on the hashed module bundle arriving - if
// intro.ts never runs (deploy skew, blocked chunk), the curtain still lifts.
try {
  var introPath = window.location.pathname
  if (
    (introPath === '/' || introPath === '/es' || introPath === '/es/') &&
    !window.sessionStorage.getItem('kg-intro') &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    document.documentElement.classList.add('intro-pending')
    window.sessionStorage.setItem('kg-intro', '1')
    window.setTimeout(function releaseIntroCurtain() {
      document.documentElement.classList.remove('intro-pending')
    }, 3200)
  }
} catch (err) {
  // Storage or matchMedia unavailable: skip the intro entirely.
  void err
}

function runWhenIdle(fn) {
  window.setTimeout(function scheduleIdle() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: 3000 })
      return
    }
    window.setTimeout(fn, 0)
  }, 1200)
}

window.kevin = function kevin(command) {
  var profile = {
    name: 'Kevin Gámez',
    handle: '@kevingamez',
    role: 'Founding engineer @ Enttor',
    location: 'Bogotá, Colombia',
    stack: ['TypeScript', 'Next.js', 'NestJS', 'Postgres', 'OpenAI', 'browser automation'],
    routes: ['/', '/es/', '/dev/', '/privacy/'],
    commands: ['window.kevin("dev")'],
  }
  var action = String(command || '').trim().toLowerCase()
  if (action === 'dev') window.location.assign('/dev/')
  return profile
}
window.kg = window.kevin

runWhenIdle(function greetCuriousPeople() {
  if (!window.console) return
  window.console.log('%cKevin Gámez', 'font-weight:700;font-size:16px')
  window.console.log('Profile: window.kevin()')
})
