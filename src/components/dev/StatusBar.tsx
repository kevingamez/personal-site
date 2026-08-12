export function StatusBar() {
  return (
    <div className="statusbar">
      <div className="l">
        <span>● NORMAL</span>
        <span>⎇ main</span>
        <span>✓ clean</span>
        <span>typescript, 5.4</span>
      </div>
      <div className="r">
        <span className="synthetic" title="Decorative - not real production metrics">
          p50 38ms, p95 142ms, err 0.02% <em>synthetic</em>
        </span>
        <span id="status-pos">UTF-8, LF, Ln 6, Col 24</span>
      </div>
    </div>
  )
}
