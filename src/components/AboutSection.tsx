import { useI18n } from '../store/i18nStore'
import { useState, useEffect, useRef } from 'preact/hooks'
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation'

export default function AboutSection() {
  const { t } = useI18n()
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
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* fine grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.015) 1px,transparent 1px)',
          backgroundSize: '25px 25px',
          pointerEvents: 'none',
        }}
      />
      {/* crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern id="crosses" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(0,0,0,0.03)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses)" />
        </svg>
      </div>

      <div style={{ maxWidth: 800, width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        {/* name */}
        <div ref={titleRef} style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem,6vw,4rem)',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
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
                color: '#3b82f6',
              }}
            >
              |
            </span>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', fontWeight: 500 }}>{t('about.subtitle')}</p>
        </div>

        {/* about text */}
        <div ref={contentRef} style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 700,
              marginBottom: 24,
              color: '#0f172a',
            }}
          >
            {t('about.title')}
          </h2>
          <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 32, color: '#475569', textAlign: 'left' }}>
            <p style={{ marginBottom: 24 }}>
              {t('about.description.paragraph1')}
            </p>
            <p style={{ marginBottom: 24 }}>
              {t('about.description.paragraph2')}
            </p>
            <p>
              {t('about.description.paragraph3')}
            </p>
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
  const { t } = useI18n()
  const email = 'kevingamez.kg@gmail.com'
  const [copied, setCopied] = useState(false)

  const CopyIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )

  const CheckIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'all .2s',
      }}
    >
      <input
        type="text"
        value={email}
        readOnly
        style={{
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          fontSize: 14,
          width: 200,
          color: '#475569',
          fontFamily: 'Inter, sans-serif',
        }}
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(email)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        style={{
          padding: '12px 16px',
          backgroundColor: copied ? '#10b981' : '#f1f5f9',
          color: copied ? '#fff' : '#64748b',
          border: 'none',
          borderLeft: '1px solid #e2e8f0',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          minWidth: 90,
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = '#e2e8f0'
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.backgroundColor = '#f1f5f9'
          }
        }}
        title="Copy email to clipboard"
      >
        {copied ? CheckIcon : CopyIcon}
        {copied ? t('about.emailCopied') : t('about.copyEmail')}
      </button>
    </div>
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
