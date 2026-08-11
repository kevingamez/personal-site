import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['contact']
}

export function Contact({ t }: Props) {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <h2 dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
        <p>{t.body}</p>
        <div className="contact-cta">
          <a className="btn btn-primary btn-email" href="mailto:kevingamez.kg@gmail.com">
            {t.btnEmail}
          </a>
          <a className="btn btn-ghost" href="/dev/">
            {t.btnDev}
          </a>
        </div>
      </div>
    </section>
  )
}
