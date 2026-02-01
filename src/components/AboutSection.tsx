import { useI18n } from '../store/i18nStore'
import { useGameStore } from '../store/gameStore'
import { useState, useEffect, useRef } from 'preact/hooks'
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation'

export default function AboutSection() {
  const { t } = useI18n()
  const { isDarkMode } = useGameStore()

  // Theme colors
  const colors = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    text: isDarkMode ? '#e2e8f0' : '#334155',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    heading: isDarkMode ? '#f1f5f9' : '#0f172a',
    card: isDarkMode ? '#1e293b' : '#f8fafc',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    accent: '#3b82f6',
    gridLine: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
    crossStroke: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  }
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const fullName = 'Kevin Gamez'

  // Animation refs
  const titleRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', duration: 0.8 })
  const contentRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', delay: 0.2, duration: 0.8 })
  const ctaRef = useStaggerAnimation<HTMLDivElement>({ animation: 'fadeUp', delay: 0.4, stagger: 0.15 })

  /* intersection observer to trigger animation when section is visible */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Reset and start animation
          setDisplayedText('')
          setCurrentIndex(0)
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  /* typing-effect - only starts when section becomes visible */
  useEffect(() => {
    if (hasAnimated && currentIndex < fullName.length) {
      const id = setTimeout(() => {
        setDisplayedText((p) => p + fullName[currentIndex])
        setCurrentIndex((p) => p + 1)
      }, 100)
      return () => clearTimeout(id)
    }
  }, [currentIndex, hasAnimated])

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* fine grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            `linear-gradient(${colors.gridLine} 1px,transparent 1px),linear-gradient(90deg,${colors.gridLine} 1px,transparent 1px)`,
          backgroundSize: '25px 25px',
          pointerEvents: 'none',
        }}
      />
      {/* crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern id="crosses-about" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke={colors.crossStroke} strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-about)" />
        </svg>
      </div>

      <div style={{ maxWidth: 800, width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        {/* name */}
        <div ref={titleRef} style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem,6vw,4rem)',
              fontWeight: 700,
              color: colors.heading,
              marginBottom: 16,
              fontFamily: 'Geist Sans, sans-serif',
              minHeight: '1.2em',
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {displayedText}
            <span
              style={{
                opacity: currentIndex < fullName.length ? 1 : 0,
                animation: 'blink 1s infinite',
                color: colors.accent,
              }}
            >
              |
            </span>
          </h1>
          <p style={{ fontSize: 20, color: colors.textMuted, fontWeight: 500 }}>{t('about.subtitle')}</p>
        </div>

        {/* about text */}
        <div ref={contentRef} style={{ color: colors.text, fontFamily: 'Geist Sans, sans-serif' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 700,
              marginBottom: 24,
              color: colors.heading,
            }}
          >
            {t('about.title')}
          </h2>
          <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 32, color: colors.text, textAlign: 'left' }}>
            <p style={{ marginBottom: 24 }}>
              {t('about.description.paragraph1')}
            </p>
            <p style={{ marginBottom: 24 }}>
              {t('about.description.paragraph2')}
            </p>
            <p style={{ marginBottom: 32 }}>
              {t('about.description.paragraph3')}
            </p>

            {/* Engineering work */}
            <h3 style={{
              fontSize: 20,
              fontWeight: 600,
              color: colors.heading,
              marginBottom: 16,
            }}>
              {t('about.engineeringWork')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(t('about.workItems') as unknown as Array<{title: string, description: string}>).map((item, index) => (
                <div key={index} style={{
                  padding: '16px 20px',
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 8,
                  borderLeft: `3px solid ${colors.accent}`,
                }}>
                  <p style={{
                    fontWeight: 600,
                    margin: 0,
                    color: colors.heading,
                    fontSize: 16,
                    marginBottom: 6,
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    margin: 0,
                    color: colors.textMuted,
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div
            ref={ctaRef}
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <a
              href="/docs/Kevin-Gamez-CV.pdf"
              download
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'download_cv', {
                    event_category: 'engagement',
                    event_label: 'CV Download',
                  })
                }
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t('about.downloadCV')}
            </a>

            {/* copy-email pill */}
            <EmailCopyPill />
          </div>

          {/* socials */}
          <SocialLinks />
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}

/* sub-components */

function EmailCopyPill() {
  const { isDarkMode } = useGameStore()
  const email = 'kevingamez.kg@gmail.com'

  const colors = {
    bg: isDarkMode ? '#1e293b' : '#f8fafc',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    text: isDarkMode ? '#e2e8f0' : '#475569',
  }

  return (
    <a
      href="mailto:kevingamez.kg@gmail.com"
      target="_self"
      rel="noopener"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 20px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        color: colors.text,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Geist Sans, sans-serif',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
      {email}
    </a>
  )
}

function SocialLinks() {
  const links = [
    {
      href: 'https://www.linkedin.com/in/kevin-gamez/',
      bg: '#0077b5',
      svg: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    },
    {
      href: 'https://github.com/kevingamez',
      bg: '#333',
      svg: (
        <path d="M12 .5C5.73.5.5 5.79.5 12.14c0 5.17 3.29 9.57 7.86 11.12.58.11.79-.25.79-.57v-2.14c-3.2.71-3.88-1.54-3.88-1.54-.53-1.36-1.29-1.72-1.29-1.72-1.06-.74.08-.73.08-.73 1.18.08 1.8 1.22 1.8 1.22 1.04 1.83 2.74 1.3 3.41.99.1-.78.4-1.3.73-1.59-2.56-.29-5.25-1.31-5.25-5.8 0-1.28.46-2.32 1.22-3.14-.12-.3-.53-1.51.12-3.15 0 0 .99-.32 3.26 1.24.95-.27 1.98-.4 3-.41 1.02.01 2.05.14 3 .41 2.26-1.56 3.25-1.24 3.25-1.24.65 1.64.24 2.85.12 3.15.76.82 1.22 1.86 1.22 3.14 0 4.5-2.7 5.5-5.28 5.79.41.36.78 1.07.78 2.15v3.19c0 .32.21.69.8.57 4.56-1.55 7.85-5.95 7.85-11.12C23.5 5.79 18.27.5 12 .5z" />
      ),
    },
    {
      href: 'https://www.instagram.com/kevin.gamez/',
      bg: '#E4405F',
      svg: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            backgroundColor: l.bg,
            color: '#fff',
            borderRadius: 12,
            transition: 'all .3s ease',
            boxShadow: `0 4px 6px ${l.bg}33`,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = `0 8px 16px ${l.bg}4d`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 4px 6px ${l.bg}33`
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            {l.svg}
          </svg>
        </a>
      ))}
    </div>
  )
}
