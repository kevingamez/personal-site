import { useState, useEffect } from 'preact/hooks'
import { useI18n } from '../store/i18nStore'

export default function SkillsSection() {
  const { t } = useI18n()
  const [isMobile, setIsMobile] = useState(false)
  
  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000)
    }
    
    // Initial check
    checkMobile()
    
    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const skillCategories = [
    {
      category: t('skills.categories.frontend'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
          <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#3b82f6',
      skills: ['TypeScript', 'React/Preact', 'Next.js', 'Tailwind CSS', 'Canvas API', 'SASS/CSS']
    },
    {
      category: t('skills.categories.backend'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 1V3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 21V23" stroke="currentColor" strokeWidth="2"/>
          <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2"/>
          <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2"/>
          <path d="M1 12H3" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 12H23" stroke="currentColor" strokeWidth="2"/>
          <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2"/>
          <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#10b981',
      skills: ['Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'FastAPI']
    },
    {
      category: t('skills.categories.ai'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 21V18" stroke="currentColor" strokeWidth="2"/>
          <path d="M18 12H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 12H6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#8b5cf6',
      skills: ['PyTorch', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'Satellite Imagery', 'Data Science']
    },
    {
      category: t('skills.categories.devops'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12.22 2H11.78L11.11 2.96L10.45 3.93L9.68 4.8L8.8 5.55L7.82 6.17L6.75 6.64L5.61 6.95L4.42 7.09L3.2 7.06L1.97 6.85L0.78 6.47V17.53L1.97 17.15L3.2 16.94L4.42 16.91L5.61 17.05L6.75 17.36L7.82 17.83L8.8 18.45L9.68 19.2L10.45 20.07L11.11 21.04L11.78 22H12.22L12.89 21.04L13.55 20.07L14.32 19.2L15.2 18.45L16.18 17.83L17.25 17.36L18.39 17.05L19.58 16.91L20.8 16.94L22.03 17.15L23.22 17.53V6.47L22.03 6.85L20.8 7.06L19.58 7.09L18.39 6.95L17.25 6.64L16.18 6.17L15.2 5.55L14.32 4.8L13.55 3.93L12.89 2.96L12.22 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="12,7 16,12 12,17 8,12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      ),
      color: '#f59e0b',
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
        maxWidth: '1400px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {skillCategories.map((category, categoryIndex) => (
            <div 
              key={categoryIndex}
              style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '20px',
                border: '2px solid #f1f5f9',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = category.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = '#f1f5f9'
              }}
            >
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: category.color + '15',
                  color: category.color,
                  marginRight: '12px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  {category.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1e293b',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0
                }}>
                  {category.category}
                </h3>
              </div>

              {/* Skills List */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {category.skills.map((skill, skillIndex) => (
                  <span 
                    key={skillIndex}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: category.color + '15',
                      color: category.color,
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      border: `1px solid ${category.color}25`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = category.color
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = category.color + '15'
                      e.currentTarget.style.color = category.color
                      e.currentTarget.style.transform = 'translateY(0)'
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