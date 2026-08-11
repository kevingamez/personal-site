import type { HomeStrings } from "@/content/home"
import { posts } from "@/data/posts"

interface Props {
  t: HomeStrings["writing"]
}

// Highest-engagement first; tie-break with comments + reposts.
const orderedPosts = [...posts].sort((a, b) => {
  const score = (p: (typeof posts)[number]): number => p.reactions + (p.comments ?? 0) + (p.reposts ?? 0)
  return score(b) - score(a)
})

// Char-based preview - predictable across cards regardless of paragraph
// breaks, and lets us know whether the post was actually truncated.
const PREVIEW = 240
function preview(text: string): { text: string; truncated: boolean } {
  const trimmed = text.replace(/\n+$/, "")
  if (trimmed.length <= PREVIEW) return { text: trimmed, truncated: false }
  const cut = trimmed.lastIndexOf(" ", PREVIEW)
  return { text: trimmed.slice(0, cut > 100 ? cut : PREVIEW) + "…", truncated: true }
}

export function Writing({ t }: Props) {
  return (
    <section id="writing">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>

        <div className="feed-wrap">
          <button className="feed-nav prev" type="button" aria-label="Previous post" data-feed-prev="" hidden>
            ‹
          </button>

          <div className="feed" id="writing-feed" role="region" tabIndex={0} aria-label="LinkedIn posts carousel">
            {orderedPosts.map((p, postIndex) => (
              <article className="post-card" key={postIndex}>
                <header className="pc-head">
                  <img
                    className="pc-avatar"
                    src="/kevin-avatar.jpg"
                    alt=""
                    width="48"
                    height="48"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="pc-author">
                    <div className="pc-name">
                      Kevin Gamez{" "}
                      <span className="pc-badge" aria-label="LinkedIn">
                        in
                      </span>{" "}
                      <span className="pc-degree">· 1st</span>
                    </div>
                    <div className="pc-headline">Founding Engineer @ Enttor</div>
                    <div className="pc-meta">
                      {p.date} <span className="pc-dot">·</span>{" "}
                      <span className="pc-globe" aria-hidden="true">
                        🌎
                      </span>
                    </div>
                  </div>
                  <a className="pc-open" href={p.url} target="_blank" rel="noopener" aria-label="Open on LinkedIn">
                    ⋯
                  </a>
                </header>

                <div className="pc-body">
                  <div className="pc-text">
                    {preview(p.body)
                      .text.split(/\n\n+/)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </div>
                  {preview(p.body).truncated && (
                    <a className="pc-more" href={p.url} target="_blank" rel="noopener">
                      {t.seeMore}
                    </a>
                  )}
                </div>

                {p.images && p.images.length > 0 && (
                  <a
                    className={`pc-imgs n-${Math.min(p.images.length, 4)}`}
                    href={p.url}
                    target="_blank"
                    rel="noopener"
                  >
                    {p.images.slice(0, 4).map((img, i) => (
                      <span className="pc-img-cell" key={i}>
                        <picture>
                          <source srcSet={img.src.replace(/\.jpe?g$/i, ".webp")} type="image/webp" />
                          <img className="pc-img" src={img.src} alt={img.alt || ""} loading="lazy" decoding="async" />
                        </picture>
                        {i === 3 && p.images && p.images.length > 4 && (
                          <span className="pc-img-more">+{p.images.length - 4}</span>
                        )}
                      </span>
                    ))}
                  </a>
                )}

                <footer className="pc-foot">
                  <span className="pc-reactions">
                    <span className="pc-reax-stack" aria-hidden="true">
                      <span className="pc-reax like">
                        <svg viewBox="0 0 24 24" width="11" height="11">
                          <path
                            fill="currentColor"
                            d="M2 21V9h4v12H2zm20-9.5c0-.83-.67-1.5-1.5-1.5h-5.92l.9-4.32.03-.32c0-.41-.17-.79-.44-1.06L14.17 3 7.59 9.59C7.22 9.95 7 10.45 7 11v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.5z"
                          />
                        </svg>
                      </span>
                      <span className="pc-reax love">
                        <svg viewBox="0 0 24 24" width="11" height="11">
                          <path
                            fill="currentColor"
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          />
                        </svg>
                      </span>
                      <span className="pc-reax insight">
                        <svg viewBox="0 0 24 24" width="11" height="11">
                          <path
                            fill="currentColor"
                            d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"
                          />
                        </svg>
                      </span>
                    </span>
                    <span className="pc-reax-num">{p.reactions}</span>
                  </span>
                  <span className="pc-meta-right">
                    <span className="pc-meta-item">
                      {p.comments} <span className="pc-meta-label">{t.commentsLabel}</span>
                    </span>
                    {p.reposts ? (
                      <>
                        <span className="pc-meta-sep" aria-hidden="true">
                          ·
                        </span>
                        <span className="pc-meta-item">
                          {p.reposts} <span className="pc-meta-label">{t.repostsLabel}</span>
                        </span>
                      </>
                    ) : null}
                  </span>
                </footer>
              </article>
            ))}
          </div>

          <button className="feed-nav next" type="button" aria-label="Next post" data-feed-next="">
            ›
          </button>
        </div>

        <div className="feed-dots" role="group" aria-label="Post indicators">
          {orderedPosts.map((_, i) => (
            <button
              className={`feed-dot${i === 0 ? " on" : ""}`}
              type="button"
              data-dot-index={i}
              aria-label={`Go to post ${i + 1}`}
              key={i}
            >
              <span className="feed-dot-shape" />
            </button>
          ))}
        </div>

        <a
          className="writing-more"
          href="https://www.linkedin.com/in/kevin-gamez/recent-activity/all/"
          target="_blank"
          rel="noopener"
        >
          {t.more}
        </a>
      </div>
    </section>
  )
}
