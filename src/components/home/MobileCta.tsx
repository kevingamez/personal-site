import type { HomeStrings } from '@/content/home'
import { ShareIcon } from './ShareIcon'

interface Props {
  t: HomeStrings['contact']
}

// The one action bar that follows you on a phone. The page's real CTA lives in
// #contact, at the very bottom of a long scroll - on a 390px screen that is
// several minutes of thumb work away, so the ask is repeated here and pinned.
//
// Hidden above 899px (the same breakpoint the nav uses) because the desktop nav
// already carries "Email me" in the corner at all times. It is also hidden
// until the hero has scrolled past: `mcta-on` is stamped on <html> by
// src/scripts/home/share.ts, so the bar never covers the first screen.
//
// aria-hidden is NOT set when it is off-screen - it is translated out of view
// but stays in the tab order for keyboard users on small viewports, which is
// where a hidden-but-focusable control would otherwise trap focus.
export function MobileCta({ t }: Props) {
  return (
    <div className="mcta" id="mobile-cta" data-mobile-cta>
      <div className="mcta-in glass">
        <span className="mcta-label">{t.ctaLabel}</span>
        <div className="mcta-actions">
          <a className="mcta-email" href="mailto:kevingamez.kg@gmail.com" data-cta="mobile-email">
            {t.ctaEmail}
          </a>
          <button
            className="mcta-share"
            type="button"
            data-share
            data-share-text={t.shareText}
            data-share-copied={t.shareCopied}
            data-share-failed={t.shareFailed}
            aria-label={t.shareAria}
          >
            <ShareIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
