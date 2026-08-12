// The AI Ad Studio surface, rebuilt from the live enttor.ai DOM: the dot-grid
// canvas and the floating 720px composer. The workspace rail is dropped so the
// canvas fills the column it sits in. Markup only, so it can
// stay a server component; `src/scripts/home/ad-studio.ts` runs the generation
// loop after hydration and only while the section is on screen.

export function AdStudioMock({ alt }: { alt: string }) {
  return (
    <div className="as" role="img" aria-label={alt}>
      <div className="as-stage" data-as-stage>
        <div className="as-auth" aria-hidden="true">
          <span className="as-login">Log in</span>
          <span className="as-signup">Sign up</span>
        </div>

        <div className="as-status" data-as-status aria-hidden="true"></div>
        <div className="as-board">
          <div className="as-grid" data-as-grid></div>
        </div>

        <div className="as-handle" aria-hidden="true" />
        <div className="as-composer" aria-hidden="true">
          <div className="as-crow">
            <div className="as-tile" data-as-tile>
              <span className="as-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 16l5-4 4 3 3-2 6 4" />
                </svg>
              </span>
              Ad Reference
              <br />
              (Required)
            </div>
            <div className="as-tile" data-as-tile>
              <span className="as-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                </svg>
              </span>
              Product
              <br />
              (Optional)
            </div>
            <div className="as-brief is-ph" data-as-brief></div>
          </div>
          <div className="as-brow">
            <div className="as-vars">
              <b>5</b> Variations
              <span className="as-track">
                <span className="as-knob" />
              </span>
            </div>
            <div className="as-ratio">
              <span className="as-sq" />
              Portrait 4:5
            </div>
            <div className="as-create is-off" data-as-create>
              Create 5 ads
            </div>
          </div>
        </div>

        <div className="as-zoom" aria-hidden="true">
          <i>-</i>
          <b>80%</b>
          <i>+</i>
        </div>
      </div>
    </div>
  )
}
