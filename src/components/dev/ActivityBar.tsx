export function ActivityBar() {
  return (
    <aside className="activity-bar">
      <button className="ab-item on" data-ab="explorer" title="Explorer (⌃B)" aria-label="Explorer">
        <span className="material-symbols-outlined">folder_open</span>
      </button>
      <button className="ab-item" data-ab="search" title="Search (⌘P)" aria-label="Search">
        <span className="material-symbols-outlined">search</span>
      </button>
      <button
        className="ab-item"
        data-ab="source-control"
        title="Source control"
        aria-label="Source control"
      >
        <span className="material-symbols-outlined">commit</span>
      </button>
      <div className="ab-grow"></div>
      <button className="ab-item" data-ab="profile" title="Profile" aria-label="Profile">
        <span className="material-symbols-outlined">account_circle</span>
      </button>
      <button className="ab-item" data-ab="settings" title="Settings" aria-label="Settings">
        <span className="material-symbols-outlined">settings</span>
      </button>
    </aside>
  )
}
