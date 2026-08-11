// Settings panel for the /dev activity bar. Real-time theme switching (4
// presets), font-size slider, motion preference, sound toggle. Persists to
// localStorage so the user's choice survives reloads.

export function Settings() {
  return (
    <aside id="settings" className="settings-panel" hidden>
      <header className="st-head">
        <div className="st-title">Settings</div>
        <div className="st-sub">Live · saved to this browser</div>
      </header>

      <section className="st-block">
        <div className="st-label">Theme</div>
        <div className="st-themes" role="radiogroup" aria-label="Theme">
          <button
            className="st-theme on"
            data-theme="cream"
            role="radio"
            aria-checked="true"
            title="Cream (editorial · default)"
          >
            <div className="st-swatch" style={{ background: 'linear-gradient(135deg,#faf7f0 0%,#ebe3d4 50%,#d96944 100%)' }}></div>
            <span>Cream</span>
          </button>
          <button className="st-theme" data-theme="midnight" role="radio" aria-checked="false" title="Midnight">
            <div className="st-swatch" style={{ background: 'linear-gradient(135deg,#0d0d14 0%,#1f1d2a 60%,#6b8eff 100%)' }}></div>
            <span>Midnight</span>
          </button>
          <button className="st-theme" data-theme="sepia" role="radio" aria-checked="false" title="Sepia">
            <div className="st-swatch" style={{ background: 'linear-gradient(135deg,#f3e4cb 0%,#c2a085 60%,#7a4a2a 100%)' }}></div>
            <span>Sepia</span>
          </button>
          <button className="st-theme" data-theme="solar" role="radio" aria-checked="false" title="Solar">
            <div className="st-swatch" style={{ background: 'linear-gradient(135deg,#fff4d9 0%,#ffb066 60%,#d9483a 100%)' }}></div>
            <span>Solar</span>
          </button>
        </div>
      </section>

      <section className="st-block">
        <div className="st-label">Editor font size</div>
        <div className="st-row">
          <input id="st-fontsize" type="range" min="11" max="16" step="0.5" defaultValue="13" />
          <output htmlFor="st-fontsize" id="st-fontsize-out">13px</output>
        </div>
      </section>

      <section className="st-block">
        <div className="st-label">Cursor</div>
        <div className="st-segment" role="radiogroup" aria-label="Cursor">
          <button className="st-seg on" data-cursor="block" role="radio" aria-checked="true">Block</button>
          <button className="st-seg" data-cursor="bar" role="radio" aria-checked="false">Bar</button>
          <button className="st-seg" data-cursor="underline" role="radio" aria-checked="false">Underline</button>
        </div>
      </section>

      <section className="st-block">
        <div className="st-label">Preferences</div>
        <label className="st-switch">
          <input type="checkbox" id="st-motion" />
          <span className="st-switch-track"><span className="st-switch-thumb"></span></span>
          <span className="st-switch-text">Reduce motion</span>
        </label>
        <label className="st-switch">
          <input type="checkbox" id="st-sound" />
          <span className="st-switch-track"><span className="st-switch-thumb"></span></span>
          <span className="st-switch-text">Keypress sounds</span>
        </label>
      </section>

      <section className="st-block st-shortcuts">
        <div className="st-label">Shortcuts</div>
        <div className="st-kbd-row"><span>Command palette</span><kbd>⌘P</kbd></div>
        <div className="st-kbd-row"><span>Save file</span><kbd>⌘S</kbd></div>
        <div className="st-kbd-row"><span>Toggle explorer</span><kbd>⌃B</kbd></div>
        <div className="st-kbd-row"><span>Exit dev mode</span><kbd>⎋</kbd></div>
      </section>

      <button className="st-reset" id="st-reset" type="button">
        <span className="material-symbols-outlined">refresh</span>
        <span>Reset to defaults</span>
      </button>
    </aside>
  );
}
