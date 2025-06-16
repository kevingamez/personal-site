import { useState } from 'preact/hooks'

export default function ExperienceSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  /* ── Professional experience ── */
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

     /* ── Education (from résumé) ── */
   const education = [
     {
       degree: 'MSc in Information Engineering',
       school: 'Universidad de los Andes',
       date: 'Expected May 2025',
     },
     {
       degree: 'BSc in Systems & Computer Engineering',
       school: 'Universidad de los Andes',
       date: 'Dec 2023',
     },
     { degree: 'Minor in Mathematics', school: 'Universidad de los Andes', date: 'Dec 2023' },
     { degree: 'Minor in Management', school: 'Universidad de los Andes', date: 'Dec 2022' },
   ]

   /* ── Awards & Distinctions ── */
   const awards = [
     {
       title: 'Andrés Bello Distinction - National Category',
       issuer: 'Ministerio de Educación Nacional de Colombia',
       date: 'Dec 2018',
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* fine-grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
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
              <g stroke="rgba(0,0,0,0.03)" strokeWidth="1" fill="none">
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
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 16,
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
                    transition: 'all .3s ease',
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
                    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                    transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isExpanded
                      ? '0 20px 40px rgba(59,130,246,.15)'
                      : '0 4px 6px rgba(0,0,0,.05)',
                  }}
                >
                  {/* heading */}
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
                  {/* summary */}
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

                  {/* details */}
                  {isExpanded && (
                    <div
                      style={{
                        paddingTop: 24,
                        borderTop: '1px solid #e2e8f0',
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
                          title="🏆 Key Achievements"
                          items={exp.details.achievements}
                          bullet="✓"
                          bulletColor="#10b981"
                        />
                        <DetailsList
                          title="📋 Responsibilities"
                          items={exp.details.responsibilities}
                          bullet="•"
                          bulletColor="#3b82f6"
                        />
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

                 {/* education section - compressed */}
         <div style={{ marginTop: 80 }}>
           <h3
             style={{
               fontSize: 22,
               fontWeight: 600,
               color: '#475569',
               marginBottom: 12,
               fontFamily: 'Inter, sans-serif',
             }}
           >
             Education
           </h3>
           
           <div style={{ 
             backgroundColor: '#f8fafc', 
             padding: '20px', 
             borderRadius: 8,
             border: '1px solid #e2e8f0'
           }}>
             <p
               style={{
                 margin: '0 0 16px 0',
                 color: '#3b82f6',
                 fontSize: 15,
                 fontWeight: 600,
                 fontFamily: 'Inter, sans-serif',
               }}
             >
               Universidad de los Andes
             </p>
             
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
                       color: '#1e293b',
                       fontSize: 14,
                       fontWeight: 500,
                       flex: 1,
                     }}
                   >
                     {edu.degree}
                   </span>
                   <span
                     style={{
                       color: '#94a3b8',
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
         <div style={{ marginTop: 60 }}>
           <h3
             style={{
               fontSize: 22,
               fontWeight: 600,
               color: '#475569',
               marginBottom: 24,
               fontFamily: 'Inter, sans-serif',
             }}
           >
             Awards & Distinctions
           </h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {awards.map((award) => (
               <div
                 key={award.title}
                 style={{
                   padding: '16px 20px',
                   backgroundColor: '#fefce8',
                   border: '1px solid #fde047',
                   borderRadius: 8,
                   borderLeft: '4px solid #eab308',
                 }}
               >
                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                   <span style={{ fontSize: 16, marginTop: 2 }}>🏆</span>
                   <div style={{ flex: 1 }}>
                     <p
                       style={{
                         fontWeight: 600,
                         margin: 0,
                         color: '#713f12',
                         fontSize: 15,
                         lineHeight: 1.3,
                       }}
                     >
                       {award.title}
                     </p>
                     <p
                       style={{
                         margin: 0,
                         color: '#a16207',
                         fontSize: 13,
                         marginTop: 4,
                       }}
                     >
                       Issued by {award.issuer} · {award.date}
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
  return (
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
        {title}
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((txt) => (
          <li
            key={txt}
            style={{
              fontSize: 14,
              color: '#475569',
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
