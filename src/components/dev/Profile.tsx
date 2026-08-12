// Personalized profile panel for the /dev activity bar. Shows Kevin's avatar,
// current role, live Bogotá clock, build/session metadata and quick links.
// Mirrors the spirit of GitHub's sidebar profile but tuned to dev-mode style.

export function Profile() {
  return (
    <aside id="profile" className="profile-panel" hidden>
      <header className="pf-head">
        <div className="pf-avatar-wrap" aria-hidden="true">
          {/* 102x128 crop, not the 164 KB full portrait: this renders at 58px. */}
          <img className="pf-avatar" src="/kevin-avatar.jpg" alt="" width={102} height={128} />
        </div>
        <div className="pf-id">
          <div className="pf-name">
            Kevin <i>Gámez</i>
          </div>
          <div className="pf-role">
            Founding engineer <span className="pf-at">, open to what&apos;s next</span>
          </div>
        </div>
      </header>

      <section className="pf-block">
        <div className="pf-block-label">Location</div>
        <div className="pf-row">
          <span className="material-symbols-outlined pf-ico">location_on</span>
          <span>Bogotá, CO</span>
        </div>
        <div className="pf-row">
          <span className="material-symbols-outlined pf-ico">schedule</span>
          <span id="pf-clock">--:--</span>
          <span className="pf-tz">UTC-5</span>
        </div>
      </section>

      <section className="pf-block">
        <div className="pf-block-label">Stack today</div>
        <div className="pf-chips">
          <span className="pf-chip">TypeScript</span>
          <span className="pf-chip">Next.js</span>
          <span className="pf-chip">NestJS</span>
          <span className="pf-chip">Postgres</span>
          <span className="pf-chip">OpenAI</span>
        </div>
      </section>

      <section className="pf-block">
        <div className="pf-block-label">Links</div>
        <a
          className="pf-link"
          href="https://github.com/kevingamez"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined pf-ico">code</span>
          <span>github.com/kevingamez</span>
        </a>
        <a
          className="pf-link"
          href="https://www.linkedin.com/in/kevin-gamez/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined pf-ico">badge</span>
          <span>linkedin/kevin-gamez</span>
        </a>
        <a className="pf-link" href="mailto:kevingamez.kg@gmail.com">
          <span className="material-symbols-outlined pf-ico">mail</span>
          <span>kevingamez.kg@gmail.com</span>
        </a>
      </section>

      <section className="pf-block pf-meta">
        <div className="pf-block-label">Session</div>
        <div className="pf-meta-row">
          <span>uptime</span>
          <b id="pf-uptime">0s</b>
        </div>
        <div className="pf-meta-row">
          <span>started</span>
          <b id="pf-started">--</b>
        </div>
      </section>
    </aside>
  )
}
