import type { HomeStrings } from '@/content/home'
import type { Payload } from '@/scripts/home/strava-types'

interface Props {
  t: HomeStrings['strava']
  lang: string
  // Snapshot fetched during the page render. With it the section ships
  // visible, with its totals and the full payload inline, so the client fills
  // the cards without a round-trip. Without it (no credentials, Strava down)
  // the section ships hidden and the client fetches /api/strava as before.
  data: Payload | null
}

const safeJson = (v: unknown): string => JSON.stringify(v).replace(/</g, '\\u003c')

export function Strava({ t, lang, data }: Props) {
  // Metric, like strava-init.ts before it resolves the visitor's units.
  const tot = data?.totals
  const hours = tot ? tot.movingTime / 3600 : 0
  const seed = tot
    ? {
        km: Math.round(tot.distanceM / 1000).toLocaleString(lang),
        hours: hours >= 10 ? String(Math.round(hours)) : hours.toFixed(1),
        elev: Math.round(tot.elevationM).toLocaleString(lang),
        acts: tot.count.toLocaleString(lang),
      }
    : null

  // Inert JSON for the client renderer (labels it needs at runtime).
  const i18n = safeJson({
    sports: t.sports,
    weekOf: t.weekOf,
    featSpeed: t.featSpeed,
    featPace: t.featPace,
    statMi: t.statMi,
    statFt: t.statElevationFt,
  })

  return (
    // Without server data: hidden until the client confirms live activity.
    <section id="strava" hidden={!seed}>
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
        </div>

        {/* Hero band: yearly totals */}
        <div className="sv-hero sheet">
          <div className="sv-hero-grid">
            <div className="sv-hero-lead">
              <div className="sv-hero-km">
                <span id="sv-km">{seed?.km ?? '0'}</span>
              </div>
              <div className="sv-hero-kml" id="sv-km-label">
                {t.statKm}
              </div>
            </div>
            <div className="sv-hero-side">
              <div className="sv-mini">
                <span id="sv-hours">{seed?.hours ?? '0'}</span>
                <em>{t.statHours}</em>
              </div>
              <div className="sv-mini">
                <span id="sv-elev">{seed?.elev ?? '0'}</span>
                <em id="sv-elev-label">{t.statElevation}</em>
              </div>
              <div className="sv-mini">
                <span id="sv-acts">{seed?.acts ?? '0'}</span>
                <em>{t.statActivities}</em>
              </div>
            </div>
          </div>
        </div>

        {/* Most recent activity, between the all-time band and the records:
            filled and unhidden by strava-latest.ts, so it stays out of the
            page when there is no activity. The date is relative, so it is
            computed on the client and the server ships the slot empty. */}
        <article className="sv-latest sheet" id="sv-latest" aria-labelledby="sv-latest-lbl" hidden>
          <div className="sv-latest-route" data-route aria-hidden="true"></div>
          <div className="sv-latest-meta">
            <div className="sv-latest-label" id="sv-latest-lbl">
              {t.latestLabel}
            </div>
            <a
              className="sv-latest-name"
              data-name
              href={t.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              -
            </a>
            <div className="sv-latest-sub">
              <span data-sport></span>, <time></time>
              <span className="sr-only" data-abs></span>
            </div>
          </div>
          <div className="sv-feat-stats sv-latest-stats">
            <div>
              <span data-dist>0</span>
              <em>{t.featDist}</em>
            </div>
            <div>
              <span data-elev>0</span>
              <em>{t.featElev}</em>
            </div>
            <div>
              <span data-time>0</span>
              <em>{t.featTime}</em>
            </div>
            <div>
              <span data-speed>0</span>
              <em data-speedlabel>{t.featSpeed}</em>
            </div>
          </div>
        </article>

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
              '<article class="sv-feat sheet">' +
              '<div class="sv-feat-route" data-route aria-hidden="true"></div>' +
              '<div class="sv-feat-body">' +
              `<div class="sv-feat-label">${t.featuredLabel}, <span data-sport></span></div>` +
              '<a class="sv-feat-name" data-name href="https://www.strava.com" target="_blank" rel="noopener">-</a>' +
              '<time class="sv-feat-date" data-date></time>' +
              '<div class="sv-feat-stats">' +
              `<div><span data-dist>0</span><em>${t.featDist}</em></div>` +
              `<div><span data-elev>0</span><em>${t.featElev}</em></div>` +
              `<div><span data-time>0</span><em>${t.featTime}</em></div>` +
              `<div><span data-speed>0</span><em data-speedlabel>${t.featSpeed}</em></div>` +
              '</div></div></article>',
          }}
        />

        {/* Metric tiles. None of these may restate a number shown above: the
            totals band already has total climb, and the biggest climb is
            usually one of the longest-effort cards. With server data they
            stay hidden until the client has filled them, so a reader never
            sees a row of zeros. */}
        <div className="sv-insights sheet" id="sv-insights" hidden={!!seed}>
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightEverestLabel}</div>
            <div className="sv-tile-val" id="sv-everest-val">
              0
            </div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">
              {t.insightFastLabel}
              <span className="sv-tile-sub" id="sv-fast-sub"></span>
            </div>
            <div className="sv-tile-val" id="sv-fast-val">
              0
            </div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">
              {t.insightBiggestLabel}
              <span className="sv-tile-sub" id="sv-biggest-sub"></span>
            </div>
            <div className="sv-tile-val" id="sv-biggest-val">
              0
            </div>
          </div>
          <div className="sv-tile">
            <div className="sv-tile-lbl">{t.insightActiveLabel}</div>
            <div className="sv-tile-val" id="sv-active-val">
              0
            </div>
          </div>
        </div>

        {data && seed && (
          <script
            id="strava-data"
            type="application/json"
            dangerouslySetInnerHTML={{ __html: safeJson(data) }}
          />
        )}
        <script
          id="strava-i18n"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: i18n }}
        />
      </div>
    </section>
  )
}
