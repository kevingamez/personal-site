// Served as an external file (not inline) so the error page works under a CSP
// without `script-src 'unsafe-inline'`. Powers the 404/500 console flourish and
// the refresh button.

// Cheap pseudo trace-id so the console doesn't feel static. Not real telemetry
// — just a friendly nod for the curious tab-opener.
var el = document.getElementById('ref')
if (el) {
  var hex = function (n) {
    return Math.floor(Math.random() * Math.pow(16, n))
      .toString(16)
      .padStart(n, '0')
  }
  el.textContent = hex(8) + '-' + hex(4) + '-' + hex(4)
}

var refresh = document.getElementById('refresh-btn')
if (refresh) {
  refresh.addEventListener('click', function () {
    window.location.reload()
  })
}
