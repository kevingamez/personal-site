// Served as an external file so the page works under a CSP without
// `script-src 'unsafe-inline'`.

for (const link of document.querySelectorAll('link[rel="preload"][as="style"]')) {
  link.rel = 'stylesheet'
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
  window.console.log('%cKevin Gámez', 'font-weight:700;font-size:16px;color:#c1462e')
  window.console.log('Profile: window.kevin()')
})
