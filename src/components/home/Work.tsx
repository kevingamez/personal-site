import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['work']
}

export function Work({ t }: Props) {
  return (
    <section id="work" className="work-section">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>

        <article className="work-feature">
          <div className="wf-copy">
            <h3 className="wf-title" dangerouslySetInnerHTML={{ __html: t.p1NameHtml }} />
            <p className="wf-desc">{t.p1Desc}</p>

            <div className="wf-stack" aria-label="Technology stack">
              <span>Next.js</span>
              <span>NestJS</span>
              <span>OpenAI</span>
              <span>Inngest</span>
              <span>Supabase</span>
            </div>
          </div>

          <a
            className="wf-visual"
            href="https://www.linkedin.com/company/enttor/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <picture>
              <source srcSet="/posts/lessons-turbo.webp" type="image/webp" />
              <img
                src="/posts/lessons-turbo.jpg"
                alt={t.p1ImageAlt}
                width="1400"
                height="733"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </a>
        </article>

        <div className="work-grid">
          {t.projects.map((p) => {
            const body = (
              <>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                </div>
                <div className="wc-meta">{p.meta}</div>
              </>
            )
            return p.href ? (
              <a className="work-card" href={p.href} key={p.name}>
                {body}
              </a>
            ) : (
              <div className="work-card" key={p.name}>
                {body}
              </div>
            )
          })}
        </div>

        <div className="work-more">
          <a
            className="arrow-link"
            href="https://github.com/kevingamez"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.allRepos} ↗
          </a>
        </div>
      </div>
    </section>
  )
}
