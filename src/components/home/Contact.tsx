import type { HomeStrings } from '@/content/home'
import { CubeStage } from '@/components/three/CubeStage'

interface Props {
  t: HomeStrings['contact']
}

export function Contact({ t }: Props) {
  return (
    <section id="contact" className="contact">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <h2 dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          <p>{t.body}</p>
          <div className="contact-cta">
            <a className="btn btn-primary btn-email" href="mailto:kevingamez.kg@gmail.com">
              {t.btnEmail}
            </a>
          </div>
        </div>
        <CubeStage />
      </div>
    </section>
  )
}
