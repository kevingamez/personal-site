import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['strava']
}

export function Strava({ t }: Props) {
  // Inert JSON for the client renderer (labels it needs at runtime).
  const i18n = JSON.stringify({
    sports: t.sports,
    weekOf: t.weekOf,
    featSpeed: t.featSpeed,
    featPace: t.featPace,
    statMi: t.statMi,
    statFt: t.statElevationFt,
  }).replace(/</g, '\\u003c')

  return (
    // Hidden until the client confirms live activity.
    <section id="strava" hidden>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
        </div>

        {/* Hero band: yearly totals */}
        <div className="sv-hero">
          <div className="sv-hero-grid">
            <div className="sv-hero-lead">
              <div className="sv-hero-km">
                <span id="sv-km">0</span>
                <i id="sv-km-unit">km</i>
              </div>
              <div className="sv-hero-kml" id="sv-km-label">
                {t.statKm}
              </div>
            </div>
            <div className="sv-hero-side">
              <div className="sv-mini">
                <span id="sv-hours">0</span>
                <em>{t.statHours}</em>
              </div>
              <div className="sv-mini">
                <span id="sv-elev">0</span>
                <em id="sv-elev-label">{t.statElevation}</em>
              </div>
              <div className="sv-mini">
                <span id="sv-acts">0</span>
                <em>{t.statActivities}</em>
              </div>
            </div>
          </div>
        </div>

        {/* Longest effort per sport (cards built by the client from the template) */}
        <div className="sv-longest" id="sv-longest"></div>
        {/* React cannot reconcile children of <template> (the browser parses
            them into template.content, not childNodes), so the markup ships as
            innerHTML. The interpolated strings are trusted static copy from
            the content files - same invariant as the *Html fields. */}
        <template
          id="sv-feat-tpl"
          dangerouslySetInnerHTML={{
            __html:
              '<article class="sv-feat">' +
              '<div class="sv-feat-route" data-route aria-hidden="true"></div>' +
              '<div class="sv-feat-body">' +
              `<div class="sv-feat-label">${t.featuredLabel} · <span data-sport></span></div>` +
              '<a class="sv-feat-name" data-name href="https://www.strava.com" target="_blank" rel="noopener">-</a>' +
              '<div class="sv-feat-stats">' +
              `<div><span data-dist>0</span><em>${t.featDist}</em></div>` +
              `<div><span data-elev>0</span><em>${t.featElev}</em></div>` +
              `<div><span data-time>0</span><em>${t.featTime}</em></div>` +
              `<div><span data-speed>0</span><em data-speedlabel>${t.featSpeed}</em></div>` +
              '</div></div></article>',
          }}
        />

        {/* Metric tiles */}
        <div className="sv-insights">
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightClimbLabel}</div>
            <div className="sv-tile-val" id="sv-climb-val">
              0
            </div>
            <div className="sv-tile-sub" id="sv-climb-sub"></div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightFastLabel}</div>
            <div className="sv-tile-val" id="sv-fast-val">
              0
            </div>
            <div className="sv-tile-sub" id="sv-fast-sub"></div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightBiggestLabel}</div>
            <div className="sv-tile-val" id="sv-biggest-val">
              0
            </div>
            <div className="sv-tile-sub" id="sv-biggest-sub"></div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightClimbedLabel}</div>
            <div className="sv-tile-val" id="sv-climbed-val">
              0
            </div>
          </div>
        </div>

        <script
          id="strava-i18n"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: i18n }}
        />
      </div>
    </section>
  )
}
