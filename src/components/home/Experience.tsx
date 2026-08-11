import type { HomeStrings } from "@/content/home"

interface Props {
  t: HomeStrings["experience"]
}

export function Experience({ t }: Props) {
  return (
    <section id="experience">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>
        <div className="timeline">
          <div className="tl-item">
            <div className="tl-year">{t.e1Year}</div>
            <div className="tl-content">
              <h3 className="tl-role">Founding engineer <span className="at">@ Enttor</span></h3>
              <div className="tl-meta">{t.e1Meta}</div>
              <p className="tl-desc">{t.e1Desc}</p>
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-year">{t.e2Year}</div>
            <div className="tl-content">
              <h3 className="tl-role">Founding engineer <span className="at">@ Samsam</span></h3>
              <div className="tl-meta">{t.e2Meta}</div>
              <p className="tl-desc">{t.e2Desc}</p>
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-year">{t.e3Year}</div>
            <div className="tl-content">
              <h3 className="tl-role" dangerouslySetInnerHTML={{ __html: t.e3RoleHtml }} />
              <div className="tl-meta">{t.e3Meta}</div>
              <p className="tl-desc">{t.e3Desc}</p>
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-year">{t.e4Year}</div>
            <div className="tl-content">
              <h3 className="tl-role" dangerouslySetInnerHTML={{ __html: t.e4RoleHtml }} />
              <div className="tl-meta">{t.e4Meta}</div>
              <p className="tl-desc">{t.e4Desc}</p>
            </div>
          </div>
        </div>

        <div className="achievements">
          <div className="achievements-head">
            <h3 className="achievements-title" dangerouslySetInnerHTML={{ __html: t.achievementsTitle }} />
            <p className="achievements-blurb">{t.achievementsBlurb}</p>
          </div>
          <ul className="achievements-list">
            {t.achievements.map((a, i) => (
              <li className="achievement" key={i}>
                <div className="ach-year">{a.year}</div>
                <div className="ach-content">
                  <h4 className="ach-title" dangerouslySetInnerHTML={{ __html: a.titleHtml }} />
                  <div className="ach-meta">{a.meta}</div>
                  <p className="ach-desc">{a.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
