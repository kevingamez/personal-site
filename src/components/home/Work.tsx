import type { HomeStrings } from "@/content/home"

interface Props {
  t: HomeStrings["work"]
}

export function Work({ t }: Props) {
  const sideProjects = [
    { name: t.p2Name, desc: t.p2Desc, meta: "Astro · TypeScript", href: "https://github.com/kevingamez" },
    { name: t.p3Name, desc: t.p3Desc, meta: "This site · /dev", href: "/dev/" },
    { name: t.p4Name, desc: t.p4Desc, meta: "Claude API · Vercel", href: "#console" },
  ]

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
            <div className="work-eyebrow">{t.p1Featured}</div>
            <h3 className="wf-title" dangerouslySetInnerHTML={{ __html: t.p1NameHtml }} />
            <p className="wf-desc">{t.p1Desc}</p>

            <div className="wf-stack" aria-label="Technology stack">
              <span>Next.js</span>
              <span>NestJS</span>
              <span>OpenAI</span>
              <span>Inngest</span>
              <span>Supabase</span>
            </div>

            <a className="work-link" href="https://www.enttor.ai/" target="_blank" rel="noopener">
              {t.p1Link}
            </a>
          </div>

          <a className="wf-visual" href="https://www.enttor.ai/" target="_blank" rel="noopener">
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
          {sideProjects.map((p, i) => (
            <a className="work-card" href={p.href} key={i}>
              <div className="wc-index">{String(i + 2).padStart(2, "0")}</div>
              <div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
              <div className="wc-meta">{p.meta}</div>
            </a>
          ))}
        </div>

        <div className="work-more">
          <a className="arrow-link" href="https://github.com/kevingamez" target="_blank" rel="noopener">{t.allRepos} ↗</a>
        </div>
      </div>
    </section>
  )
}
