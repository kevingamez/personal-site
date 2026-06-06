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
    commands: [
      'window.kevin("principles")',
      'window.kevin("invariants")',
      'window.kevin("proof")',
      'window.kevin("bibliography")',
      'window.kevin("dev")',
    ],
  }
  var action = String(command || '').trim().toLowerCase()
  if (action === 'dev') window.location.assign('/dev/')
  if (action === 'principles' || action === 'axioms') {
    return [
      'Ship small, observable systems.',
      'Prefer boring infrastructure until the problem earns novelty.',
      'Measure behavior before optimizing aesthetics.',
      'Write for the person who has to maintain the system next.',
    ]
  }
  if (action === 'reading') {
    return ["A Mathematician's Apology - G.H. Hardy", 'The Design of Everyday Things - Don Norman']
  }
  if (action === 'invariants' || action === 'invariant') {
    return [
      'Critical paths are measurable.',
      'State changes are observable.',
      'Contracts are explicit at boundaries.',
      'Automation has a human escape hatch.',
      'A feature is not done while its invariants are implicit.',
    ]
  }
  if (action === 'proof' || action === 'lemma') {
    return [
      'Claim: engineering judgment is compression under constraints.',
      'Premise 1: production systems expose more states than a team can hold in memory.',
      'Premise 2: good interfaces reduce the number of states people must reason about.',
      'Premise 3: observability turns guesses into falsifiable claims.',
      'Conclusion: the job is not to write more code; it is to choose the invariants that make behavior legible.',
    ]
  }
  if (action === 'bibliography' || action === 'books') {
    return [
      "Hardy - A Mathematician's Apology",
      'Abelson & Sussman - Structure and Interpretation of Computer Programs',
      'Kleppmann - Designing Data-Intensive Applications',
      'Meadows - Thinking in Systems',
      'Norman - The Design of Everyday Things',
    ]
  }
  return profile
}
window.kg = window.kevin

window.dataLayer = window.dataLayer || []
window.gtag = function gtag() {
  window.dataLayer.push(arguments)
}
window.gtag('js', new Date())
window.gtag('config', 'G-2EK3T4PNNY')

runWhenIdle(function loadGoogleAnalytics() {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-2EK3T4PNNY'
  document.head.appendChild(script)
})

runWhenIdle(function greetCuriousPeople() {
  if (!window.console) return
  window.console.log('%cKevin Gámez', 'font-weight:700;font-size:16px;color:#c1462e')
  window.console.log('Profile: window.kevin()')
  window.console.log('Exercises: window.kevin("invariants"), window.kevin("proof")')
})
