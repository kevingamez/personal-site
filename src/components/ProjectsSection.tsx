export default function ProjectsSection() {
  const projects = [
    {
      title: 'Game of Life Visualizer',
      description: 'Interactive Conway\'s Game of Life with patterns, dark mode, and responsive design',
      tech: ['TypeScript', 'Preact', 'Canvas API', 'Zustand'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Portfolio Website',
      description: 'Modern portfolio with smooth scrolling, i18n support, and interactive elements',
      tech: ['Astro', 'TypeScript', 'Tailwind CSS'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Task Management App',
      description: 'Full-stack application with real-time updates and collaborative features',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Socket.io'],
      github: '#',
      demo: '#'
    }
  ]

  return (
    <section id="projects" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%'
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
            Portfolio
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Some of my recent work and side projects
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {projects.map((project, index) => (
            <div key={index} style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                fontFamily: 'Inter, sans-serif'
              }}>
                {project.title}
              </h3>
              
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                marginBottom: '20px',
                fontSize: '16px'
              }}>
                {project.description}
              </p>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '24px'
              }}>
                {project.tech.map((tech, techIndex) => (
                  <span key={techIndex} style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <a href={project.github} style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}>
                  GitHub
                </a>
                <a href={project.demo} style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}>
                  Live Demo
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 