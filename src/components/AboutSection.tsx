import { useI18n } from '../store/i18nStore'
import { useState, useEffect } from 'preact/hooks'

export default function AboutSection() {
  const { t } = useI18n()
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const fullName = 'Kevin Gamez'
  
  useEffect(() => {
    if (currentIndex < fullName.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullName[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100) // Typing speed
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, fullName])
  
  return (
    <section id="about" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Grid Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        opacity: 1,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px',
        pointerEvents: 'none'
      }}></div>
      
      {/* Major Grid Crosses every 4 squares */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        opacity: 1,
        pointerEvents: 'none'
      }}>
        <svg style={{
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}>
          <defs>
            <pattern id="crosses" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(0,0,0,0.03)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses)" />
        </svg>
      </div>
      
      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Typing Name */}
        <div style={{
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px',
            fontFamily: 'Inter, sans-serif',
            minHeight: '1.2em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            {displayedText}
            <span style={{
              opacity: currentIndex < fullName.length ? 1 : 0,
              animation: 'blink 1s infinite',
              fontSize: '1em',
              color: '#3b82f6'
            }}>|</span>
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            fontWeight: '500',
            letterSpacing: '0.02em'
          }}>
            Software Developer
          </p>
        </div>
        
        {/* Content */}
        <div style={{
          color: '#334155',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#0f172a'
          }}>
            About Me
          </h2>
          
          <div style={{
            fontSize: '18px',
            lineHeight: '1.7',
            marginBottom: '32px',
            color: '#475569'
          }}>
            <p style={{ marginBottom: '24px' }}>
              Hi! I'm Kevin, a passionate full-stack developer who loves creating interactive experiences and solving complex problems through code.
            </p>
            
            <p style={{ marginBottom: '24px' }}>
              I specialize in modern web technologies, with a focus on TypeScript, React, and creative coding. When I'm not coding, you'll find me exploring new technologies or working on side projects.
            </p>
            
            <p>
              I believe that good code should be both functional and beautiful, just like the Game of Life simulation you saw above!
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <a 
              href="/docs/Kevin-Gamez-CV.pdf" 
              download="Kevin-Gamez-CV.pdf"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '16px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              📄 Download CV
            </a>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              maxWidth: '350px'
            }}>
              <input
                type="text"
                value="kevingamez.kg@gmail.com"
                readOnly
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  color: '#475569',
                  outline: 'none',
                  width: '240px',
                  cursor: 'default'
                }}
              />
              <button
                onClick={(e) => {
                  navigator.clipboard.writeText('kevingamez.kg@gmail.com')
                  // Simple feedback - you could enhance this with a toast notification
                  const btn = e.currentTarget as HTMLButtonElement;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '✓';
                  btn.style.backgroundColor = '#10b981';
                  setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '#3b82f6';
                  }, 2000);
                }}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  minWidth: '60px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                }}
                title="Copy email to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '32px'
          }}>
            <a 
              href="https://www.linkedin.com/in/kevin-gamez/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: '#0077b5',
                color: '#fff',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 119, 181, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 119, 181, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 119, 181, 0.2)'
              }}
              title="LinkedIn Profile"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            <a 
              href="https://github.com/kevingamez"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: '#333',
                color: '#fff',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(51, 51, 51, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(51, 51, 51, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(51, 51, 51, 0.2)'
              }}
              title="GitHub Profile"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* CSS for blinking cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  )
} 