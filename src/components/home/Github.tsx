import type { HomeStrings } from "@/content/home"
import type { HomeStats } from "@/data/home-github"
import { GH_USER } from "@/data/dev-github"

interface Props {
  t: HomeStrings["github"]
  stats: HomeStats
}

export function Github({ t, stats }: Props) {
  // Localized, curated descriptions for the well-known repos, keyed by GitHub
  // repo name. Falls back to the live API description for anything else, so the
  // ES page shows Spanish copy for these instead of the English API text.
  const repoDesc: Record<string, string> = {
    "personal-site": t.repoSiteDesc,
    "AD_ASTRA2023-SpaceInvaders": t.repoSpaceDesc,
    Palladium_Chat: t.repoChatDesc,
    "budget-app": t.repoBudgetDesc,
    "GCP-CloudRun": t.repoCloudDesc,
  }

  // Derive the "languages shipped" caption from the live, sorted mix so it can
  // never drift from the bar beside it. (It used to be a hardcoded string that
  // claimed TypeScript led while the bar showed Swift first.)
  const [lead, second] = stats.languageMix
  const langSub = lead && second ? `${lead.name} ${t.langLeads} · ${second.name} ${t.langSecond}` : t.languagesShippedSub

  const contribPayload = JSON.stringify({
    t: stats.contribCalendar.totalContributions,
    l: stats.contribCalendar.longestStreak,
    c: stats.contribCalendar.currentStreak,
    d: stats.contribCalendar.days.map((d) => [d.date, d.count, d.level]),
  }).replace(/</g, "\\u003c")

  return (
    <section id="github">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="sec-num">{t.secNum}</div>
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          </div>
          <p className="sec-blurb">{t.blurb}</p>
        </div>
        <div className="gh-banner">
          <div className="gh-banner-cap">{t.snapshot}</div>
          <div className="gh-stats-row">
            <div className="gh-stat">
              <div className="gh-stat-num" data-target={stats.publicRepos} data-format="plain">0</div>
              <div className="gh-stat-lbl">{t.publicRepos}</div>
              <div className="gh-stat-sub">{t.publicReposSub}</div>
            </div>
            <div className="gh-stat">
              <div className="gh-stat-num" data-target={stats.languagesShipped} data-format="plain">0</div>
              <div className="gh-stat-lbl">{t.languagesShipped}</div>
              <div className="gh-stat-sub">{langSub}</div>
            </div>
            <div className="gh-stat">
              <div className="gh-stat-num" data-target={stats.yearsOnGithub} data-format="plain">0</div>
              <div className="gh-stat-lbl">{t.yearsOnGithub}</div>
              <div className="gh-stat-sub">{t.yearsOnGithubSub}</div>
            </div>
          </div>
          <div className="gh-langbar">
            <div className="gh-langbar-head">
              <span>{t.languageMix}</span>
              <span><b>{t.acrossPublicRepos}</b></span>
            </div>
            <div className="gh-langbar-track">
              {stats.languageMix.map((l, i) => (
                <span key={i} className="gh-langbar-seg" data-pct={l.pct} style={{ background: l.color }} />
              ))}
            </div>
            <div className="gh-langbar-legend">
              {stats.languageMix.map((l, i) => (
                <span key={i}>
                  <i style={{ background: l.color }} />
                  {l.name} · {l.pct}%
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="gh-grid">
          <div className="gh-card">
            <div className="gh-card-head">
              <h3>{t.contributionsTitle}</h3>
              <span className="num">{t.last12Months}</span>
            </div>
            <div className="contrib-frame">
              <div className="contrib-months" aria-hidden="true">
                {t.months.map((m, i) => <span key={i}>{m}</span>)}
              </div>
              <div className="contrib-dows" aria-hidden="true">
                {t.dows.map((d, i) => <span key={i} className={i % 2 === 0 ? "hide" : ""}>{d}</span>)}
              </div>
              <div className="contrib" id="contrib-graph"></div>
              <script id="contrib-data" type="application/json" dangerouslySetInnerHTML={{ __html: contribPayload }} />
            </div>
            <div className="contrib-legend">
              <span>{t.less}</span>
              <span className="scale">
                <span style={{ background: 'var(--cream-3)' }}></span>
                <span style={{ background: '#9be9a8' }}></span>
                <span style={{ background: '#40c463' }}></span>
                <span style={{ background: '#30a14e' }}></span>
                <span style={{ background: '#216e39' }}></span>
              </span>
              <span>{t.more}</span>
            </div>
            <div className="contrib-stats">
              <div className="cs">
                <div className="cs-num coral" id="contrib-total">0</div>
                <div className="cs-lbl">{t.statCommits}</div>
              </div>
              <div className="cs">
                <div className="cs-num" id="contrib-current">0</div>
                <div className="cs-lbl">{t.statCurrent}</div>
              </div>
              <div className="cs">
                <div className="cs-num" id="contrib-longest">0</div>
                <div className="cs-lbl">{t.statLongest}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="repos">
              {stats.topRepos.map((r, i) => (
                <a key={i} className="repo" href={r.url} target="_blank" rel="noopener">
                  <div>
                    <div className="nm">
                      {GH_USER} / {r.name}
                    </div>
                    <div className="desc">{repoDesc[r.name] || r.description || t.repoFallbackDesc}</div>
                  </div>
                  <div className="stat">
                    {r.stars > 0 && <span>★ {r.stars}</span>}
                    <span>
                      <span className="lang" style={{ background: r.color }} />
                      {r.language}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
