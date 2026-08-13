import type { HomeStrings } from '@/content/home'

interface Props {
  t: HomeStrings['deck']
}

// The framed window into the card swarm. Markup only: the scene is mounted by
// `src/scripts/home/moments.ts` after hydration, and only once the box scrolls
// into view - it is a second WebGL context on a page that already runs one.
export function Moments({ t }: Props) {
  return (
    <div className="moments" id="moments">
      <div className="moments-bar">
        <span className="moments-label">{t.momentsLabel}</span>
        <button className="moments-full" id="moments-full" type="button">
          {t.momentsFull}
        </button>
      </div>

      <div className="moments-stage" id="moments-stage" data-moments-lazy="">
        <p className="moments-hint">{t.hint}</p>

        <div className="moments-panel" id="moments-panel" role="status" aria-live="polite">
          <p className="mp-meta" id="moments-meta"></p>
          <p className="mp-title" id="moments-title"></p>
          <p className="mp-desc" id="moments-desc"></p>
          <p className="mp-close">{t.momentsClose}</p>
        </div>
      </div>
    </div>
  )
}
