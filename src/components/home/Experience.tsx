import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['experience']
}

// Rows collapse into a four-line CV skim; opening one reveals the prose plus a
// single band of evidence (ledger left, stack right). The collapsing itself is
// owned by src/scripts/home/experience.ts, so with no JS every panel is open.
export function Experience({ t }: Props) {
  return (
    <section id="experience" data-exp-section>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <div>
            <p className="sec-blurb">{t.blurb}</p>
            <div className="tl-hint">{t.openHint}</div>
          </div>
        </div>

        <div className="timeline" data-exp-rail>
          <div className="tl-progress" data-exp-fill aria-hidden="true" />
          {t.roles.map((r, i) => (
            <div className="tl-row" data-exp-row data-exp-open={i === 0 ? '' : undefined} key={i}>
              <button
                className="tl-head"
                type="button"
                data-exp-toggle
                aria-expanded={i === 0}
                aria-controls={`exp-panel-${i}`}
              >
                <span className="tl-when">
                  {r.dates}
                  <span className="tl-place">{r.place}</span>
                </span>
                <span className="tl-what">
                  <span className="tl-role" dangerouslySetInnerHTML={{ __html: r.roleHtml }} />
                  <span className="tl-summary">{r.summary}</span>
                </span>
                <span className="tl-plus" aria-hidden="true">
                  +
                </span>
              </button>

              <div className="tl-panel" id={`exp-panel-${i}`} data-exp-panel>
                <div className="tl-panel-in">
                  <div className="tl-aside">
                    <span className="tl-mark">
                      {/* Decorative: the row heading already names the place. */}
                      <img
                        className="tl-logo"
                        src={r.logo}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    {r.backer ? (
                      <p className="tl-backer">
                        <span className="tl-backer-k">{r.backer.label}</span>
                        <a
                          className="tl-backer-v"
                          href={r.backer.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {r.backer.name} ↗
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <div>
                    {r.desc ? <p className="tl-desc">{r.desc}</p> : null}
                    {/* A row with no verified evidence renders no band at all,
                        rather than an empty grid asking to be filled. */}
                    {r.ledger.length > 0 || r.stack.length > 0 ? (
                      <div className="tl-band">
                        <dl className="tl-ledger">
                          {r.ledger.map((f, j) => (
                            <div className="tl-fact" key={j}>
                              <dt>{f.label}</dt>
                              <dd>{f.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <div className="tl-stack">
                          {r.stack.length > 0 ? (
                            <>
                              <div className="tl-stack-k">{r.stackLabel}</div>
                              <div className="tl-stack-v">{r.stack.join(', ')}</div>
                            </>
                          ) : null}
                          {/* Supporting document (the thesis). The investor is
                            not here: it renders beside the company mark. */}
                          {r.link ? (
                            <div className="tl-link">
                              <div className="tl-stack-k">{r.link.label}</div>
                              <a
                                className="tl-link-v"
                                href={r.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {r.link.name} ↗
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="achievements">
          <div className="achievements-head">
            <h3
              className="achievements-title"
              dangerouslySetInnerHTML={{ __html: t.achievementsTitle }}
            />
            <p className="achievements-blurb">{t.achievementsBlurb}</p>
          </div>
          <ul className="achievements-list">
            {t.achievements.map((a, i) => (
              <li className="achievement glass glass-lift" key={i}>
                <div className="ach-top">
                  <span className="ach-mark">
                    {/* Decorative: the card title and meta already name the issuer. */}
                    <img
                      className="ach-logo"
                      src={a.logo}
                      alt=""
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="ach-year">{a.year}</span>
                </div>
                <h4 className="ach-title" dangerouslySetInnerHTML={{ __html: a.titleHtml }} />
                <div className="ach-meta">{a.meta}</div>
                <p className="ach-desc">{a.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
