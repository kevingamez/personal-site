import type { HomeStrings } from '@/content/home'

import { AdStudioMock } from './AdStudioMock'

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
          {/* Same two-child shape as a grid card below (copy block, then the
              mono meta line) so `justify-content: space-between` lands the
              stack on the card's baseline exactly like the others. The stack
              used to be a row of outlined pills declared inline here, which
              made the featured card the only one in the section with a
              different treatment - and kept its technologies out of the
              content files, so they never translated. */}
          <div className="wf-copy glass-strong">
            <div>
              <h3 className="wf-title" dangerouslySetInnerHTML={{ __html: t.p1NameHtml }} />
              <p className="wf-desc">{t.p1Desc}</p>
            </div>

            <div className="wc-meta">{t.p1Meta}</div>
          </div>

          <a
            className="wf-visual"
            href="https://www.enttor.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AdStudioMock alt={t.p1ImageAlt} />
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
              <a className="work-card glass glass-lift" href={p.href} key={p.name}>
                {body}
              </a>
            ) : (
              <div className="work-card glass glass-lift" key={p.name}>
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
