import type { HomeStrings } from '@/content/home'
import type { HomeStats } from '@/data/home-github'
import { yearProjects } from '@/data/year-projects'

interface Props {
  t: HomeStrings['yearRun']
  stats: HomeStats
}

// The contribution curve with the products that were running underneath, so the
// peaks have a cause. Markup only: `src/scripts/home/year-run.ts` draws into the
// <svg> after hydration, reading the payload below.
export function YearRun({ t, stats }: Props) {
  const cal = stats.contribCalendar
  const payload = JSON.stringify({
    days: cal.days.map((d) => [d.date, d.count]),
    projects: yearProjects.map((p) => [p.label, p.from, p.to, p.commits, p.startedBefore === true]),
    labels: {
      contributions: t.tipContributions,
      weekOf: t.tipWeekOf,
      nothing: t.tipNothing,
      streak: t.noteStreak,
      week: t.noteWeek,
      atOnce: t.noteAtOnce,
      begins: t.noteBegins,
    },
  })

  return (
    <section id="year" className="yr-section">
      <div className="wrap yr">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>

        <div className="yr-stats">
          <div className="yr-stat">
            <b data-yr-total>{cal.totalContributions.toLocaleString('en')}</b>
            <span>{t.statContributions}</span>
          </div>
          <div className="yr-stat">
            <b data-yr-streak>{cal.longestStreak}</b>
            <span>{t.statStreak}</span>
          </div>
          <div className="yr-stat">
            <b data-yr-projects>{yearProjects.length}</b>
            <span>{t.statProjects}</span>
          </div>
        </div>

        <div className="yr-frame">
          <svg id="yr-chart" role="img" aria-label={t.chartAlt}></svg>
          <div className="yr-tip" id="yr-tip" aria-hidden="true"></div>
        </div>

        <script
          id="yr-data"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: payload }}
        />
      </div>
    </section>
  )
}
