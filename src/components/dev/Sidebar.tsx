import { loadHomeStats } from '@/data/home-github'
import { loadRecentCommits } from '@/data/dev-github'

export async function Sidebar() {
  // Same source of truth as the public-facing GitHub section on / - counts,
  // language mix and top repos are all live from the GraphQL/REST API at
  // build time (with disk cache).
  const stats = await loadHomeStats()

  // Real recent commits feed (PushEvents across public repos, 6h cache).
  const recentCommits = (await loadRecentCommits()).slice(0, 6)
  const tailTime = (iso: string): string => {
    const d = new Date(iso)
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mm = String(d.getUTCMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  // Format "joined Apr 2019" from the ISO date.
  const joinedLabel = (() => {
    if (!stats.joinedISO) return ''
    const d = new Date(stats.joinedISO)
    const month = d.toLocaleString('en-US', { month: 'short' })
    return `joined ${month} ${d.getFullYear()}`
  })()

  // Top language bars - height scales relative to the leading slice (so the
  // tallest bar is always 99%, rest scale down). Mirrors the spark mix shown
  // on the home page.
  const topLang = stats.languageMix[0]?.pct || 1
  const langBars = stats.languageMix.slice(0, 8).map((l) => ({
    name: l.name,
    pct: l.pct,
    color: l.color,
    height: Math.max(15, Math.round((l.pct / topLang) * 99)),
  }))

  // Top repos - link out to github.com. Limit to 4 to fit the sidebar.
  const featured = stats.topRepos.slice(0, 4).map((r) => {
    const tag = r.language === 'TypeScript' ? 'TS' : r.language === 'JavaScript' ? 'JS' : r.language
    return { name: r.name, color: r.color, tag, url: r.url }
  })

  return (
    <aside className="sidebar">
      <div className="panel">
        <div className="ph">
          <b>github, @kevingamez</b>
          <span className="pos">live</span>
        </div>
        <div className="row2">
          <div className="metric">
            <div className="vl">
              {stats.publicRepos}
              <span> repos</span>
            </div>
            <div className="sub">
              {stats.followers} followers, {stats.following} following
            </div>
          </div>
          <div className="metric">
            <div className="vl">
              {stats.yearsOnGithub}
              <span> yrs</span>
            </div>
            <div className="sub">{joinedLabel}</div>
          </div>
        </div>
        <div className="spark" id="spark" aria-label="Language mix across public repos">
          {langBars.map((l, i) => (
            <span
              key={i}
              style={{ height: `${l.height}%`, background: l.color }}
              title={`${l.name} ${l.pct}%`}
            />
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <b>in flight</b>
          <span className="pos">2026</span>
        </div>
        <div className="flight-list">
          <a
            className="flight-row"
            href="https://www.linkedin.com/company/enttor/"
            target="_blank"
            rel="noopener noreferrer"
            title="Enttor - ai outbound platform"
          >
            <span className="fl-num">01</span>
            <div className="fl-body">
              <div className="fl-title">
                ai outbound, <span className="fl-where">enttor</span>
              </div>
              <div className="fl-meta">browser automation, openai pipelines, ig/linkedin</div>
            </div>
            <span className="fl-status fl-live">live</span>
          </a>
          <a
            className="flight-row"
            href="https://github.com/kevingamez/personal-site"
            target="_blank"
            rel="noopener noreferrer"
            title="kevingamez/personal-site"
          >
            <span className="fl-num">02</span>
            <div className="fl-body">
              <div className="fl-title">
                this site, <span className="fl-where">open source</span>
              </div>
              <div className="fl-meta">next.js, typescript, live console + dev mode</div>
            </div>
            <span className="fl-status fl-ship">ship</span>
          </a>
          <a
            className="flight-row"
            href="https://github.com/kevingamez/AD_ASTRA2023-SpaceInvaders"
            target="_blank"
            rel="noopener noreferrer"
            title="AD ASTRA, aerial deforestation detection"
          >
            <span className="fl-num">03</span>
            <div className="fl-body">
              <div className="fl-title">
                AD_ASTRA, <span className="fl-where">m.sc. thesis</span>
              </div>
              <div className="fl-meta">python, opencv, yolov5, fastapi, amazon basin</div>
            </div>
            <span className="fl-status fl-research">research</span>
          </a>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <b>tail -f /var/log/commits</b>
          <span className="pos">github, live</span>
        </div>
        <div className="reqs commit-tail" id="reqs">
          {recentCommits.length === 0 && (
            <div className="r" style={{ color: 'var(--mute-2)' }}>
              no recent push events
            </div>
          )}
          {recentCommits.map((c, i) => (
            <a
              key={i}
              className="r commit-r"
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ts">{tailTime(c.ts)}</span> <span className="sha">{c.shaShort}</span>{' '}
              <span className="pa">
                <span className="ct-repo">{c.repoShort}</span>{' '}
                <span className="ct-msg">{c.message}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <b>contributions, 12mo</b>
          <span className="pos">github</span>
        </div>
        <div
          className="hm"
          id="hm"
          data-contrib={JSON.stringify(stats.contribCalendar.days.map((d) => d.level))}
        ></div>
        <div className="hm-legend">
          <span>12mo ago</span>{' '}
          <span className="hm-total">
            {stats.contribCalendar.totalContributions.toLocaleString()} contributions
          </span>{' '}
          <span>today</span>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <b>open source</b>
          <span className="pos">@kevingamez</span>
        </div>
        <div className="repos">
          {featured.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="lg" style={{ background: r.color }} /> {r.name}
              </span>
              <span className="star">{r.tag}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <b>now() →</b>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: '11.5px',
            lineHeight: 1.7,
            color: 'var(--ink-2)',
          }}
        >
          <div>
            <span className="ac">status</span>, open to what's next
          </div>
          <div>
            <span className="ac">stack</span>, next.js + nestjs + postgres
          </div>
          <div>
            <span className="ac">studying</span>, deep learning, browser automation
          </div>
          <div>
            <span className="ac">based</span>, bogotá, co, utc-5
          </div>
        </div>
      </div>
    </aside>
  )
}
