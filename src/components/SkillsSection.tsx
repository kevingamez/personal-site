export default function SkillsSection() {
  const skills = [
    { category: 'Frontend', items: ['TypeScript', 'React', 'Preact', 'Next.js', 'Tailwind CSS', 'SASS'] },
    { category: 'Backend', items: ['Node.js', 'Python', 'Express', 'PostgreSQL', 'MongoDB', 'Redis'] },
    { category: 'Tools & Cloud', items: ['Docker', 'AWS', 'Vercel', 'Git', 'Jest', 'Webpack'] },
    { category: 'Creative', items: ['Canvas API', 'WebGL', 'Pixi.js', 'Creative Coding', 'Game Development'] }
  ]

  return (
    <section id="skills" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#fff',
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
            <pattern id="crosses-skills" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(0,0,0,0.03)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-skills)" />
        </svg>
      </div>

      <div style={{
        maxWidth: '1200px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Skills & Technologies
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Technologies and tools I use to bring ideas to life
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          {skills.map((skillGroup, index) => (
            <div key={index} style={{
              backgroundColor: '#f8fafc',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '20px',
                fontFamily: 'Inter, sans-serif'
              }}>
                {skillGroup.category}
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {skillGroup.items.map((skill, skillIndex) => (
                  <span key={skillIndex} style={{
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 