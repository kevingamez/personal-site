export default function ContactSection() {
  return (
    <section id="contact" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center'
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