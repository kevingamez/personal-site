import type { HomeStrings } from '@/content/home'
import { CubeStage } from '@/components/three/CubeStage'
import { ShareIcon } from './ShareIcon'

interface Props {
  t: HomeStrings['contact']
}

export function Contact({ t }: Props) {
  return (
    <section id="contact" className="contact">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <h2 dangerouslySetInnerHTML={{ __html: t.titleHtml }} />
          <p>{t.body}</p>
          <div className="contact-cta">
            <a className="btn btn-primary btn-email" href="mailto:kevingamez.kg@gmail.com">
              {t.btnEmail}
            </a>
            {/* The desktop home of the share control. The sticky bar carries the
                icon-only twin on phones; both are driven by the same
                [data-share] hook in src/scripts/home/share.ts. */}
            <button
              className="btn btn-ghost btn-share"
              type="button"
              data-share
              data-share-text={t.shareText}
              data-share-copied={t.shareCopied}
              data-share-failed={t.shareFailed}
            >
              <ShareIcon />
              <span data-share-label>{t.btnShare}</span>
            </button>
          </div>
        </div>
        <CubeStage />
      </div>
    </section>
  )
}
