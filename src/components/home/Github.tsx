import type { HomeStrings } from '@/content/home'
import type { HomeStats } from '@/data/home-github'
import { GH_USER } from '@/data/dev-github'
import { yearProjects } from '@/data/year-projects'
import { YearRun } from './YearRun'

interface Props {
  t: HomeStrings['github']
  tYear: HomeStrings['yearRun']
  stats: HomeStats
}

// One GitHub section, one screen: the year curve and the products behind it.
// It used to be two (`#year` + `#github`) that shared an eyebrow and plotted the
// same 12 months twice, once as this curve and once as a green heatmap, with a
// repo list beside it. Both are gone; /dev still carries a daily grid and the
// full file tree for anyone who wants to browse the code.
export function Github({ t, tYear, stats }: Props) {
  const cal = stats.contribCalendar

  return (
    <section id="github">
      <div className="wrap yr">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>

        {/* One stat row for the whole section. The old pair repeated the
            contribution total and the longest streak, and carried a third copy
            of "years on GitHub" that the hero already shows. */}
        <div className="yr-stats">
          <div className="yr-stat">
            <b>{cal.totalContributions.toLocaleString('en')}</b>
            <span>{tYear.statContributions}</span>
          </div>
          <div className="yr-stat">
            <b>{cal.longestStreak}</b>
            <span>{tYear.statStreak}</span>
          </div>
          <div className="yr-stat">
            <b>{yearProjects.length}</b>
            <span>{tYear.statProjects}</span>
          </div>
          <div className="yr-stat">
            <b>{stats.publicRepos}</b>
            <span>{t.publicRepos}</span>
          </div>
        </div>

        <YearRun t={tYear} stats={stats} />

        {/* `gh-banner` is the hook gh-stats.ts observes to run the fill. */}
        <div className="gh-banner">
          <div className="gh-langbar">
            <div className="gh-langbar-head">
              <span>{t.languageMix}</span>
              <a
                className="gh-langbar-user"
                href={`https://github.com/${GH_USER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/{GH_USER} ↗
              </a>
            </div>
            <div className="gh-langbar-track">
              {stats.languageMix.map((l, i) => (
                <span
                  key={i}
                  className="gh-langbar-seg"
                  data-pct={l.pct}
                  /* Width is server-rendered so the bar is correct with no JS
                     at all. The reveal is a scaleX the script drives from
                     zero; previously the width itself started at 0 in CSS and
                     was filled in by the script, which left the bar invisible
                     for anyone without it. */
                  style={{ background: l.color, width: l.pct + '%' }}
                />
              ))}
            </div>
            <div className="gh-langbar-legend">
              {stats.languageMix.map((l, i) => (
                <span key={i}>
                  <i style={{ background: l.color }} />
                  {l.name}, {l.pct}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
