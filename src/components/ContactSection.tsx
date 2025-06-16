export default function ContactSection() {
  return (
    <section id="contact" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Grid Background Pattern - Dark Theme */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        opacity: 1,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px',
        pointerEvents: 'none'
      }}></div>
      
      {/* Major Grid Crosses every 4 squares - Dark Theme */}
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
            <pattern id="crosses-contact" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(255,255,255,0.025)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-contact)" />
        </svg>
      </div>

      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '24px',
          fontFamily: 'Inter, sans-serif'
        }}>
          Let's Work Together
        </h2>
        
        <p style={{
          fontSize: '20px',
          color: '#94a3b8',
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          I'm always interested in new opportunities and interesting projects. 
          Let's create something amazing together!
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '64px'
        }}>
          {/* Email */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '16px'
            }}>📧</div>
            <h3 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Email
            </h3>
            <a href="mailto:kevin@example.com" style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              kevin@example.com
            </a>
          </div>
          
          {/* LinkedIn */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '16px'
            }}>💼</div>
            <h3 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              LinkedIn
            </h3>
            <a href="#" style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              /in/kevin-gamez
            </a>
          </div>
          
          {/* GitHub */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '16px'
            }}>💻</div>
            <h3 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              GitHub
            </h3>
            <a href="#" style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              @kevingamez
            </a>
          </div>
        </div>
        
        {/* CTA Button */}
        <button style={{
          padding: '16px 32px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Inter, sans-serif',
          marginBottom: '64px'
        }}>
          Start a Conversation
        </button>
        
        {/* Footer */}
        <div style={{
          borderTop: '1px solid #334155',
          paddingTop: '32px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <p>© 2024 Kevin Gamez. Built with passion and lots of coffee ☕</p>
          <p style={{ marginTop: '8px' }}>
            Made with Astro, TypeScript, and Conway's Game of Life
          </p>
        </div>
      </div>
    </section>
  )
} 