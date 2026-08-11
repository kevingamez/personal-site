export function Explorer() {
  return (
    <aside className="explorer">
      <div className="hd">Explorer<span className="actions">⊕ ⟲</span></div>
      <div id="file-tree"></div>

      <div className="hd" id="outline-hd" style={{ marginTop: '18px' }}>Outline</div>
      <div id="outline-list"></div>

      <div className="hd" style={{ marginTop: '18px' }}>Source control</div>
      <div className="it indent">⎇ main</div>
    </aside>
  )
}
