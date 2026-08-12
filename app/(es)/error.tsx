'use client'

// Spanish twin of app/(en)/error.tsx. Route groups do not inherit each other's
// boundaries, so without this file a throw under /es/ would climb past the
// Spanish layout to global-error and the visitor would land in English.

import { useEffect } from 'react'
import '@/styles/error-500.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[render error]', error.digest ?? '(no digest)', error)
  }, [error])

  return (
    <div className="err500" lang="es">
      <div className="wrap">
        <div className="tag">Algo se rompió</div>
        <h1>
          5<i>0</i>0
        </h1>
        <h2>Eso no se pudo renderizar.</h2>
        <p>
          El resto del sitio está bien. Reintentar suele funcionar, porque casi siempre es una
          petición que tardó de más y no una página rota de verdad.
        </p>
        <div className="ctas">
          <button className="btn btn-primary" type="button" onClick={reset}>
            ↻ Reintentar
          </button>
          <a className="btn btn-ghost" href="/es/">
            ← Volver al inicio
          </a>
          <a className="btn btn-ghost" href="mailto:kevingamez.kg@gmail.com">
            Cuéntame qué pasó
          </a>
        </div>

        <div className="console" role="presentation">
          <div className="ln">
            <span className="nm">1</span>
            <span>
              <span className="key">$</span> <span className="mute">render segment</span>
            </span>
          </div>
          <div className="ln">
            <span className="nm">2</span>
            <span className="err">Error: el componente falló al renderizar</span>
          </div>
          <div className="ln">
            <span className="nm">3</span>
            <span className="mute">
              digest: {error.digest ?? 'ninguno, este falló en el cliente'}
            </span>
          </div>
          <div className="ln">
            <span className="nm">4</span>
            <span className="ok">reintentar vuelve a renderizar solo esta sección</span>
          </div>
        </div>
      </div>
    </div>
  )
}
