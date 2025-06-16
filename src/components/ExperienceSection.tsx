import { useState } from 'preact/hooks'

export default function ExperienceSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  /* ───── real-world experience from résumé ───── */
  const experiences = [
    {
      company: 'Samsam',
      position: 'Product Engineer',
      period: 'Feb 2024 – Mar 2025',
      description:
        'Built and shipped shopper- and merchant-facing features while refactoring core backend services for a high-growth e-commerce startup.',
      tech: ['TypeScript', 'React Native', 'Next.js', 'Prisma', 'PostgreSQL', 'AWS'],
      details: {
        achievements: [
          'Released a new checkout flow that increased conversion 12 %',
          'Refactored legacy Node micro-services, cutting P95 latency 40 %',
          'Introduced CI/CD with GitHub Actions — deployments 60 % faster',
        ],
        responsibilities: [
          'Cross-platform feature development (web & mobile)',
          'Scalable architecture & technical decision making',
          'Code reviews, mentoring and agile ceremonies',
          'Product-design collaboration for roadmap planning',
        ],
      },
    },
    {
      company: 'Universidad de los Andes',
      position: 'Graduate Teaching Assistant',
      period: 'Jan 2024 – Feb 2025',
      description:
        'Designed lab material and supported students across advanced CS courses while handling course operations.',
      tech: ['Python', 'Linux', 'Git', 'Education'],
      details: {
        achievements: [
          'Co-authored eight lab guides used by 100 + students',
          'Streamlined autograding workflow, saving 30 % TA time',
        ],
        responsibilities: [
          'Prepared & delivered weekly lab sessions',
          'Managed course repositories and CI for autograding',
          'One-on-one mentoring and office hours',
          'Curriculum updates alongside professors',
        ],
      },
    },
  ]

  return (
    <section
      id="experience"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* heading */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Experience
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#64748b',
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            My professional journey and key milestones
          </p>
        </div>
        {/* timeline */}
        <div style={{ position: 'relative' }}>
          {/* vertical line */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: '#e2e8f0',
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
                    backgroundColor: isExpanded ? '#3b82f6' : '#64748b',
                    borderRadius: '50%',
                    border: '4px solid #fff',
                    boxShadow: `0 0 0 2px ${isExpanded ? '#3b82f6' : '#e2e8f0'}`,
                    transition: 'all 0.3s ease',
                    transform: isExpanded ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
                {/* card */}
                <div
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                  style={{
                    backgroundColor: isExpanded ? '#fff' : '#f8fafc',
                    padding: 24,
                    borderRadius: 12,
                    border: `2px solid ${isExpanded ? '#3b82f6' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isExpanded
                      ? '0 20px 40px rgba(59,130,246,0.15)'
                      : '0 4px 6px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: 4,
                        fontFamily: 'Inter, sans-serif',
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
                      <span
                        style={{
                          color: '#3b82f6',
                          fontWeight: 500,
                          fontSize: 16,
                        }}
                      >
                        {exp.company}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 14 }}>{exp.period}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#475569',
                      lineHeight: 1.6,
                      marginBottom: 16,
                      fontSize: 15,
                    }}
                  >
                    {exp.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: isExpanded ? 24 : 0,
                    }}
                  >
                    {exp.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        style={{
                          backgroundColor: '#dbeafe',
                          color: '#3b82f6',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* expandable details */}
                  {isExpanded && (
                    <div
                      style={{
                        paddingTop: 24,
                        borderTop: '1px solid #e2e8f0',
                        animation: 'slideDown 0.3s ease-out',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
                          gap: 24,
                        }}
                      >
                        {/* achievements */}
                        <div>
                          <h4
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#1e293b',
                              marginBottom: 12,
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            🏆 Key Achievements
                          </h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {exp.details.achievements.map((a, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: 14,
                                  color: '#475569',
                                  marginBottom: 8,
                                  paddingLeft: 16,
                                  position: 'relative',
                                }}
                              >
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    color: '#10b981',
                                  }}
                                >
                                  ✓
                                </span>
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* responsibilities */}
                        <div>
                          <h4
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#1e293b',
                              marginBottom: 12,
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            📋 Responsibilities
                          </h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {exp.details.responsibilities.map((r, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: 14,
                                  color: '#475569',
                                  marginBottom: 8,
                                  paddingLeft: 16,
                                  position: 'relative',
                                }}
                              >
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    color: '#3b82f6',
                                  }}
                                >
                                  •
                                </span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 16,
                      fontSize: 12,
                      color: '#94a3b8',
                    }}
                  >
                    {isExpanded ? 'Click to collapse' : 'Click to see more details'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* animation */}
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
