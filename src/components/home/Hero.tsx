import type { HomeStrings } from '@/content/home'
import { formatBogotaTime } from '@/scripts/clock'

interface Props {
  t: HomeStrings['hero']
}

export function Hero({ t }: Props) {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        {/* The rotated metadata rail that used to sit here is gone: it made the
            reader tilt their head for a role and a year the caption under the
            portrait already carries. */}
        <div className="hero-copy">
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">{t.stat1Num}</div>
              <div className="stat-cap">{t.stat1Label}</div>
            </div>
            <div className="stat">
              <div className="stat-num">{t.stat2Num}</div>
              <div className="stat-cap">{t.stat2Label}</div>
            </div>
          </div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          <p className="hero-lede" dangerouslySetInnerHTML={{ __html: t.lede }} />
          <div className="hero-cta">
            <a className="btn btn-primary" href="#contact">
              {t.btnGetInTouch}
            </a>
            {/* Points at the first section that is actually rendered; About is
                commented out in HomePage.tsx. */}
            <a className="arrow-link" href="#experience">
              {t.scrollDown} ↓
            </a>
          </div>
        </div>
        <div className="hero-media">
          {/* Empty on purpose: the dust journey's brain renders into this slot.
              journey-timeline.ts measures the box, so it must keep its
              aspect-ratio and stay in the layout. */}
          <div className="media-frame" aria-hidden="true" />
          <p className="hero-media-cap">
            <span className="hero-place">{t.metaPlace}</span>
            {/* The static build bakes one time; the client re-renders with the
                current one before the clock script takes over - suppress the
                expected text mismatch. */}
            <span data-bogota-clock suppressHydrationWarning>
              {formatBogotaTime()}
            </span>
            {/* Filled in by src/scripts/home/weather.ts; empty until it answers
                so the caption never reserves space for a value that may not
                arrive. */}
            <span className="hero-weather" data-weather data-weather-labels={t.weatherLabels} />
          </p>
        </div>
      </div>
    </header>
  )
}
