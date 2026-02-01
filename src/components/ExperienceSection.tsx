import { useState } from 'preact/hooks'
import { useI18n } from '../store/i18nStore'
import { useGameStore } from '../store/gameStore'
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation'

export default function ExperienceSection() {
  const { t } = useI18n()
  const { isDarkMode } = useGameStore()
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  // Theme colors
  const colors = {
    bg: isDarkMode ? '#0f172a' : '#fff',
    text: isDarkMode ? '#e2e8f0' : '#475569',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    heading: isDarkMode ? '#f1f5f9' : '#0f172a',
    subheading: isDarkMode ? '#cbd5e1' : '#475569',
    card: isDarkMode ? '#1e293b' : '#f8fafc',
    cardHover: isDarkMode ? '#334155' : '#fff',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    accent: '#3b82f6',
    accentLight: isDarkMode ? '#1e3a5f' : '#dbeafe',
    timeline: isDarkMode ? '#334155' : '#e2e8f0',
    gridLine: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
    crossStroke: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  }

  // Animation refs
  const headerRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', duration: 0.8 })
  const timelineRef = useStaggerAnimation<HTMLDivElement>({
    animation: 'fadeUp',
    stagger: 0.2,
    childSelector: ':scope > div'
  })
  const educationRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', delay: 0.1 })
  const awardsRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', delay: 0.2 })

  /* ── Professional experience ── */
  const experiences = [
    {
        company: 'Enttor',
        logo: '/logos/enttor.png',
        position: 'Founding Engineer',
        period: 'Jun 2025 – Present',
        description:
          'Leads backend, data-pipeline and AI-infrastructure initiatives while collaborating daily with the NYC engineering team.',
        tech: [
          'Next.js 14',
          'Node.js',
          'Express',
          'PostgreSQL / pgvector',
          'Google Cloud Run',
          'Docker',
          'LLMs',
        ],
        details: {
          achievements: [
            'Joined in June 2025 — achievements to follow as projects launch',
          ],
          responsibilities: [
            'Owns and scales enterprise marketing-data pipelines for accurate, reliable metrics',
            'Designs and deploys micro-services that process large volumes of social-media data',
            'Builds multi-platform posting systems with safeguards against frequent API changes',
            'Implements AI-powered content generation using LLMs and vector embeddings',
            'Develops real-time analytics dashboards with clean, cross-platform interfaces',
            'Maintains historical-data ingestion and validation with robust error handling',
          ],
        },
      },
    {
      company: 'Samsam',
      logo: '/logos/samsam.png',
      position: t('experience.experiences.samsam.position'),
      period: t('experience.experiences.samsam.period'),
      description: t('experience.experiences.samsam.description'),
      tech: ['TypeScript', 'React Native', 'Next.js', 'Prisma', 'PostgreSQL', 'AWS'],
      details: {
        achievements: t('experience.experiences.samsam.achievements') as unknown as string[],
        responsibilities: t('experience.experiences.samsam.responsibilities') as unknown as string[],
      },
    },
    {
      company: t('experience.universityName'),
      logo: '/logos/uniandes.svg',
      position: t('experience.experiences.uniandes.position'),
      period: t('experience.experiences.uniandes.period'),
      description: t('experience.experiences.uniandes.description'),
      tech: ['Python', 'Linux', 'Git', 'Education'],
      details: {
        achievements: t('experience.experiences.uniandes.achievements') as unknown as string[],
        responsibilities: t('experience.experiences.uniandes.responsibilities') as unknown as string[],
      },
    },
  ]

     /* ── Education (from résumé) ── */
   const education = [
     {
       degree: t('experience.degrees.msc'),
       school: t('experience.universityName'),
       date: t('experience.dates.expectedMay2025'),
     },
     {
       degree: t('experience.degrees.bsc'),
       school: t('experience.universityName'),
       date: t('experience.dates.dec2023'),
     },
     { 
       degree: t('experience.degrees.minorMath'), 
       school: t('experience.universityName'), 
       date: t('experience.dates.dec2023') 
     },
     { 
       degree: t('experience.degrees.minorMgmt'), 
       school: t('experience.universityName'), 
       date: t('experience.dates.dec2022') 
     },
   ]

   /* ── Awards & Distinctions ── */
   const awards = [
     {
       title: t('experience.awardsData.bello.title'),
       issuer: t('experience.awardsData.bello.issuer'),
       date: t('experience.awardsData.bello.date'),
     },
   ]

  return (
    <section
      id="experience"
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
      {/* fine-grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            `linear-gradient(${colors.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)`,
          backgroundSize: '25px 25px',
          pointerEvents: 'none',
        }}
      />
      {/* crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <pattern
              id="crosses-exp"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <g stroke={colors.crossStroke} strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56" />
                <line x1="44" y1="50" x2="56" y2="50" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-exp)" />
        </svg>
      </div>

      <div style={{ maxWidth: 800, width: '100%', position: 'relative', zIndex: 10 }}>
        {/* header */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 700,
              color: colors.heading,
              marginBottom: 16,
              fontFamily: 'Geist Sans, sans-serif',
            }}
          >
            {t('experience.title')}
          </h2>
          <p
            style={{
              fontSize: 18,
              color: colors.textMuted,
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {t('experience.subtitle')}
          </p>
        </div>

        {/* timeline */}
        <div ref={timelineRef} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: colors.timeline,
            }}
          />
          {experiences.map((exp, index) => {
            const isExpanded = expandedCard === index
            return (
              <div
                key={index}
                style={{
                  position: 'relative',
                  marginBottom: index < experiences.length - 1 ? 48 : 0,
                  paddingLeft: 60,
                }}
              >
                {/* dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 8,
                    width: 16,
                    height: 16,
                    backgroundColor: isExpanded ? colors.accent : colors.textMuted,
                    borderRadius: '50%',
                    border: `4px solid ${colors.bg}`,
                    boxShadow: `0 0 0 2px ${isExpanded ? colors.accent : colors.timeline}`,
                    transition: 'all .3s ease',
                    transform: isExpanded ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
                {/* card */}
                <div
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                  style={{
                    backgroundColor: isExpanded ? colors.cardHover : colors.card,
                    padding: 24,
                    borderRadius: 12,
                    border: `2px solid ${isExpanded ? colors.accent : colors.cardBorder}`,
                    cursor: 'pointer',
                    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                    transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isExpanded
                      ? '0 20px 40px rgba(59,130,246,.15)'
                      : isDarkMode ? '0 4px 6px rgba(0,0,0,.3)' : '0 4px 6px rgba(0,0,0,.05)',
                  }}
                >
                  {/* heading */}
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: colors.heading,
                        marginBottom: 4,
                        fontFamily: 'Geist Sans, sans-serif',
                      }}
                    >
                      {exp.position}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      {exp.logo && (
                        <img
                          src={exp.logo}
                          alt={`${exp.company} logo`}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                      )}
                      {exp.company === 'Enttor' ? (
                        <a
                          href="https://www.enttor.ai/"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#3b82f6',
                            fontWeight: 500,
                            fontSize: 16,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none'
                          }}
                        >
                          {exp.company}
                        </a>
                      ) : (
                        <span
                          style={{
                            color: '#3b82f6',
                            fontWeight: 500,
                            fontSize: 16,
                          }}
                        >
                          {exp.company}
                        </span>
                      )}
                      <span style={{ color: colors.textMuted, fontSize: 14 }}>{exp.period}</span>
                    </div>
                  </div>
                  {/* summary */}
                  <p
                    style={{
                      color: colors.text,
                      lineHeight: 1.6,
                      marginBottom: 16,
                      fontSize: 15,
                    }}
                  >
                    {exp.description}
                  </p>
                  {/* tech chips */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: isExpanded ? 24 : 0,
                    }}
                  >
                    {exp.tech.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          backgroundColor: colors.accentLight,
                          color: colors.accent,
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          fontFamily: 'Geist Sans, sans-serif',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* details */}
                  {isExpanded && (
                    <div
                      style={{
                        paddingTop: 24,
                        borderTop: `1px solid ${colors.cardBorder}`,
                        animation: 'slideDown .3s ease-out',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
                          gap: 24,
                        }}
                      >
                        <DetailsList
                          title={t('experience.achievements')}
                          items={exp.details.achievements}
                          bullet="•"
                          bulletColor="#10b981"
                        />
                        <DetailsList
                          title={t('experience.responsibilities')}
                          items={exp.details.responsibilities}
                          bullet="•"
                          bulletColor="#6366f1"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 16,
                      fontSize: 12,
                      color: colors.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <span>{isExpanded ? t('experience.collapse') : t('experience.expand')}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* education section */}
        <div ref={educationRef} style={{ marginTop: 80 }}>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: colors.subheading,
              marginBottom: 12,
              fontFamily: 'Geist Sans, sans-serif',
            }}
          >
            {t('experience.education')}
          </h3>

          <div style={{
            backgroundColor: colors.card,
            padding: '20px',
            borderRadius: 8,
            border: `1px solid ${colors.cardBorder}`
          }}>
            <div
              style={{
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src="/logos/uniandes.svg"
                alt="Universidad de los Andes logo"
                style={{ width: 24, height: 24, objectFit: 'contain' }}
              />
              <span
                style={{
                  color: '#3b82f6',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'Geist Sans, sans-serif',
                }}
              >
                {t('experience.universityName')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {education.map((edu) => (
                <div
                  key={edu.degree}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    padding: '6px 0',
                  }}
                >
                  <span
                    style={{
                      color: colors.heading,
                      fontSize: 14,
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    {edu.degree}
                  </span>
                  <span
                    style={{
                      color: colors.textMuted,
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {edu.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* awards section */}
        <div ref={awardsRef} style={{ marginTop: 60 }}>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: colors.subheading,
              marginBottom: 24,
              fontFamily: 'Geist Sans, sans-serif',
            }}
          >
            {t('experience.awards')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {awards.map((award) => (
              <div
                key={award.title}
                style={{
                  padding: '16px 20px',
                  backgroundColor: isDarkMode ? '#422006' : '#fefce8',
                  border: `1px solid ${isDarkMode ? '#854d0e' : '#fde047'}`,
                  borderRadius: 8,
                  borderLeft: '4px solid #eab308',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        margin: 0,
                        color: isDarkMode ? '#fef08a' : '#713f12',
                        fontSize: 15,
                        lineHeight: 1.3,
                      }}
                    >
                      {award.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: isDarkMode ? '#fde047' : '#a16207',
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {t('experience.issuedBy')} {award.issuer} · {award.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }
      `}</style>
    </section>
  )
}

function DetailsList({
  title,
  items,
  bullet,
  bulletColor,
}: {
  title: string
  items: string[]
  bullet: string
  bulletColor: string
}) {
  const { isDarkMode } = useGameStore()
  return (
    <div>
      <h4
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: isDarkMode ? '#f1f5f9' : '#1e293b',
          marginBottom: 12,
          fontFamily: 'Geist Sans, sans-serif',
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((txt) => (
          <li
            key={txt}
            style={{
              fontSize: 14,
              color: isDarkMode ? '#cbd5e1' : '#475569',
              marginBottom: 8,
              paddingLeft: 16,
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', left: 0, color: bulletColor }}>{bullet}</span>
            {txt}
          </li>
        ))}
      </ul>
    </div>
  )
}
