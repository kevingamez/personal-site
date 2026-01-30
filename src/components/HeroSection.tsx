import { useEffect, useRef } from 'preact/hooks'
import GameOfLifeIsland from './GameOfLifeIsland'
import { useI18n } from '../store/i18nStore'
import gsap from 'gsap'

export default function HeroSection() {
  const { t } = useI18n()
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollIndicatorRef.current) {
      // Fade in the scroll indicator after a delay
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 0.8, y: 0, duration: 1, ease: 'power2.out', delay: 1.5 }
      )
    }
  }, [])

  return (
    <section id="hero" style={{
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <GameOfLifeIsland />

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(100, 116, 139, 0.8)',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          letterSpacing: '0.5px',
          opacity: 0
        }}
      >
        <span>{t('hero.scrollToExplore')}</span>
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ animation: 'bounce 2s infinite ease-in-out' }}
        >
          <rect x="1" y="1" width="18" height="26" rx="9" />
          <circle cx="10" cy="8" r="2" fill="currentColor" style={{ animation: 'scroll-dot 2s infinite ease-in-out' }} />
        </svg>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes scroll-dot {
          0%, 100% { cy: 8; opacity: 1; }
          50% { cy: 16; opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}
