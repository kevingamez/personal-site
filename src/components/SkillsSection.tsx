import { useI18n } from '../store/i18nStore'
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation'

export default function SkillsSection() {
  const { t } = useI18n()

  // Animation refs
  const headerRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', duration: 0.8 })
  const gridRef = useStaggerAnimation<HTMLDivElement>({
    animation: 'fadeUp',
    stagger: 0.12,
    childSelector: ':scope > div'
  })

  const skillCategories = [
    {
      category: t('skills.categories.frontend'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      skills: ['TypeScript', 'React/Preact', 'Next.js', 'Tailwind CSS', 'Canvas API', 'SASS/CSS']
    },
    {
      category: t('skills.categories.backend'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      skills: ['Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'FastAPI']
    },
    {
      category: t('skills.categories.ai'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M16 11v1a4 4 0 0 1-8 0v-1" />
          <line x1="12" y1="16" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      ),
      skills: ['PyTorch', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'Satellite Imagery', 'Data Science']
    },
    {
      category: t('skills.categories.devops'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      skills: ['Docker', 'AWS', 'Git/GitHub', 'Vercel', 'Jest/Testing', 'CI/CD']
    }
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
        inset: 0,
        zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px',
        pointerEvents: 'none'
      }} />

      {/* Crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern id="crosses-skills" width="100" height="100" patternUnits="userSpaceOnUse">
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
        maxWidth: '1000px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div ref={headerRef} style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 16,
            fontFamily: 'Inter, sans-serif'
          }}>
            {t('skills.title')}
          </h2>
          <p style={{
            fontSize: 18,
            color: '#64748b',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {t('skills.subtitle')}
          </p>
        </div>

        {/* Skills Grid */}
        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              style={{
                backgroundColor: '#fafafa',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                }}>
                  {category.icon}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1e293b',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  {category.category}
                </h3>
              </div>

              {/* Skills List */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fff',
                      color: '#374151',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1e293b'
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.borderColor = '#1e293b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff'
                      e.currentTarget.style.color = '#374151'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                  >
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
