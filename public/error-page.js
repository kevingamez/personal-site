// Served as an external file (not inline) so the error page works under a CSP
// without `script-src 'unsafe-inline'`. Powers the 404 path readout and the
// refresh button.

var missingPath = document.getElementById('missing-path')
if (missingPath) {
  missingPath.textContent = window.location.pathname || '/404'
}

var refresh = document.getElementById('refresh-btn')
if (refresh) {
  refresh.addEventListener('click', function () {
    window.location.reload()
  })
}
