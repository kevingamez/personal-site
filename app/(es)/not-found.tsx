import Script from 'next/script'
import type { Metadata } from 'next'
import '@/styles/error-404.css'

export const metadata: Metadata = {
  title: '404 - Kevin Gámez',
  description: 'La página no existe en el sitio de Kevin Gámez.',
  robots: 'noindex,nofollow',
}

export default function NotFound() {
  return (
    <div className="err404" lang="es">
      <div className="wrap">
        <div className="tag">ruta no encontrada</div>
        <h1>
          4<i>0</i>4
        </h1>
        <p>Esta página no existe. La URL puede estar mal escrita o haber quedado obsoleta.</p>
        <div className="ctas">
          <a className="btn btn-primary" href="/es/">
            ← Volver al inicio
          </a>
          <a className="btn btn-ghost" href="/dev/">
            Abrir dev mode
          </a>
        </div>

        <div className="console" role="presentation">
          <div className="ln">
            <span className="nm">1</span>
            <span>
              <span className="key">$</span> resolve <span id="missing-path">/404</span>
            </span>
          </div>
          <div className="ln">
            <span className="nm">2</span>
            <span className="err">ERR_ROUTE_NOT_FOUND</span>
          </div>
          <div className="ln">
            <span className="nm">3</span>
            <span className="mute">
              alternativas: <a href="/es/">/es/</a>, <a href="/dev/">/dev/</a>
            </span>
          </div>
          <div className="ln">
            <span className="nm">4</span>
            <span className="ok">pista: /humans.txt tiene más contexto</span>
          </div>
        </div>
      </div>

      <Script src="/error-page.js" strategy="afterInteractive" />
    </div>
  )
}
