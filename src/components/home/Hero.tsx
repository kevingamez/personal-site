import type { HomeStrings } from "@/content/home"
import { formatBogotaTime } from "@/scripts/clock"

interface Props {
  t: HomeStrings["hero"]
}

export function Hero({ t }: Props) {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div className="hero-rail" aria-hidden="true">
          <span className="rail-text">{t.metaRole}</span>
          <span className="rail-line"></span>
          <span className="rail-year">2026</span>
        </div>
        <div className="hero-copy">
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">[ {t.stat1Num} ]</div>
              <div className="stat-cap">{t.stat1Label}</div>
            </div>
            <div className="stat">
              <div className="stat-num">[ {t.stat2Num} ]</div>
              <div className="stat-cap">{t.stat2Label}</div>
            </div>
          </div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          <p className="hero-lede" dangerouslySetInnerHTML={{ __html: t.lede }} />
          <div className="hero-cta">
            <a className="btn btn-primary" href="#contact">{t.btnGetInTouch}</a>
            <a className="arrow-link" href="#about">{t.scrollDown} ↓</a>
          </div>
        </div>
        <div className="hero-media">
          <div className="media-frame">
            <picture>
              <source srcSet="/kevin.webp" type="image/webp" />
              <img
                src="/kevin.jpg"
                alt={t.portraitAlt}
                width="640"
                height="800"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
          <p className="hero-media-cap">
            <span className="live">{t.metaPlace}</span>
            {/* The static build bakes one time; the client re-renders with the
                current one before the clock script takes over - suppress the
                expected text mismatch. */}
            <span>
              ·{' '}
              <span data-bogota-clock suppressHydrationWarning>
                {formatBogotaTime()}
              </span>
            </span>
          </p>
        </div>
      </div>
    </header>
  )
}
