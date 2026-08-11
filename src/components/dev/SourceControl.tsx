import { loadRecentCommits } from "@/data/dev-github"

export async function SourceControl() {
  // Build-time fetch of recent commits across all public repos via GitHub
  // Events API. Cached 6h. Falls back to empty list if unreachable.
  const commits = await loadRecentCommits()

  const fmtRel = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.round(diff / 60000)
    if (m < 1) return "now"
    if (m < 60) return `${m}m`
    const h = Math.round(m / 60)
    if (h < 24) return `${h}h`
    const d = Math.round(h / 24)
    if (d < 30) return `${d}d`
    return `${Math.round(d / 30)}mo`
  }

  // The panel renders a clean working tree - no fabricated dirty files.
  const changes: { path: string; status: string }[] = []
  const staged: { path: string; status: string }[] = []

  return (
    <aside className="sc-panel" id="source-control" hidden>
      <div className="sc-head">
        <span className="sc-title">SOURCE CONTROL</span>
        <span className="sc-actions"><span className="material-symbols-outlined" title="Refresh">refresh</span><span className="material-symbols-outlined" title="More">more_horiz</span></span>
      </div>

      <div className="sc-msg-row">
        <input className="sc-msg" placeholder="Message (⌘Enter to commit on 'main')" disabled />
        <button className="sc-commit" disabled>✓ Commit</button>
      </div>

      <div className="sc-branch">
        <span className="material-symbols-outlined">commit</span>
        <span><b>main</b></span>
        <span className="sc-grow"></span>
        <span className="sc-sync" title="Sync changes">⟳</span>
      </div>

      <details className="sc-section" open>
        <summary>
          <span className="sc-caret">▾</span>Staged Changes <span className="sc-count">{staged.length}</span>
        </summary>
        {staged.map((f, i) => (
          <div key={i} className="sc-file">
            <span className="sc-fpath">{f.path}</span>
            <span className={`sc-st sc-st-${f.status}`}>{f.status}</span>
          </div>
        ))}
      </details>

      <details className="sc-section" open>
        <summary>
          <span className="sc-caret">▾</span>Changes <span className="sc-count">{changes.length}</span>
        </summary>
        {changes.map((f, i) => (
          <div key={i} className="sc-file">
            <span className="sc-fpath">{f.path}</span>
            <span className={`sc-st sc-st-${f.status}`}>{f.status}</span>
          </div>
        ))}
      </details>

      <details className="sc-section" open>
        <summary>
          <span className="sc-caret">▾</span>Recent Commits <span className="sc-count">{commits.length}</span>
        </summary>
        <div className="sc-commits">
          {commits.length === 0 ? (
            <div className="sc-empty">No public push events in the last 90 days.</div>
          ) : (
            commits.map((c, i) => (
              <a key={i} className="sc-commit-row" href={c.url} target="_blank" rel="noopener">
                <span className="sc-sha">{c.shaShort}</span>
                <span className="sc-msg-text">{c.message}</span>
                <span className="sc-meta">
                  <span className="sc-repo">{c.repoShort}</span> <span className="sc-time">{fmtRel(c.ts)}</span>
                </span>
              </a>
            ))
          )}
        </div>
      </details>
    </aside>
  )
}
