export function CommandPalette() {
  return (
    <>
      <div className="palette" id="palette" hidden>
        <div className="palette-card">
          <input
            className="palette-input"
            id="palette-input"
            placeholder="search files… (⌘P, ↑↓ to navigate, ↵ open, esc cancel)"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="palette-list" id="palette-list"></div>
          <div className="palette-foot">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> open
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>
        </div>
      </div>

      <div className="toast" id="toast"></div>
    </>
  )
}
