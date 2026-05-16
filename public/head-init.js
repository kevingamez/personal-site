// Served as an external file (not inline) so the page works under a CSP without
// `script-src 'unsafe-inline'`. Two jobs the head used to do inline:
//   1. Activate the async-preloaded font stylesheet (was an `onload` handler).
//   2. Seed the Google Analytics dataLayer queue (was an inline gtag snippet).

// 1. Flip the preloaded font <link rel="preload" as="style"> to an active
// stylesheet. Mirrors the old `this.rel='stylesheet'` onload trick.
for (const link of document.querySelectorAll('link[rel="preload"][as="style"]')) {
  link.rel = 'stylesheet'
}

// 2. Google Analytics bootstrap. The external gtag/js loader stays in the head;
// here we seed the dataLayer queue it consumes once it loads (order-independent).
window.dataLayer = window.dataLayer || []
function gtag() {
  window.dataLayer.push(arguments)
}
gtag('js', new Date())
gtag('config', 'G-2EK3T4PNNY')
