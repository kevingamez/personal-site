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
//
// Not a section of its own: it renders inside <Github/>, which owns the heading
// and the repo list. The curve and the repos are the same story.
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
    <div className="yr">
      <div className="yr-frame">
        <svg id="yr-chart" role="img" aria-label={t.chartAlt}></svg>
        <div className="yr-tip" id="yr-tip" aria-hidden="true"></div>
      </div>

      <script id="yr-data" type="application/json" dangerouslySetInnerHTML={{ __html: payload }} />
    </div>
  )
}
