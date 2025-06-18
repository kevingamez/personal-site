import { useState } from 'preact/hooks'
import { useI18n } from '../store/i18nStore'

export default function ProjectsSection() {
  const { t } = useI18n()
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  /* ───── portfolio projects ───── */
  const projects = [
    /* 1 ─ Conway visualiser (this website's hero) */
  

    /* 2 ─ Undergraduate capstone thesis */
    {
      title: 'Deep Learning in Agriculture',
      description: 'Undergraduate thesis on oil-palm crop mapping in Colombia using Sentinel-1/2 satellite imagery and DeepLab V3+ architecture.',
      tech: ['Python', 'PyTorch', 'DeepLab V3+', 'Google Earth Engine'],
      github: '#',
      demo: 'https://repositorio.uniandes.edu.co/entities/publication/2cd71d69-7078-4901-87e7-9bc9f2cb62e5',
      details: {
        features: [
          '100 m↑ global oil-palm segmentation',
          'Sentinel SAR + optical composite pipeline',
          'MobileNet-V3 backbone fine-tuned',
          '98 % mIoU on held-out zones',
          'GeoTIFF masking & QGIS visual toolkit'
        ],
        challenges: [
          'Balancing class imbalance with focal-loss',
          'SAR incidence-angle normalisation',
          'GPU-memory limits on 16 GB cards',
          'Automated cloud-shadow filtering in GEE'
        ]
      }
    },

    /* 3 ─ CodeFest Ad Astra 2023 */
    {
      title: 'AD ASTRA – Aerial Object Detection',
      description: 'Open-source library for detecting and classifying Amazon-deforestation events from aircraft footage.',
      tech: ['Python', 'OpenCV', 'YOLOv5', 'FastAPI'],
      github: 'https://github.com/favalosdev/AD_ASTRA2023-SpaceInvaders',
      demo: '#',
      details: {
        features: [
          'YOLOv5 custom-weights for smoke & forest-loss',
          'Frame-striding video ingestion CLI',
          'Geo-tagged alert JSON output',
          'FastAPI microservice for batch jobs',
          'Docker-compose deployment scripts'
        ],
        challenges: [
          'Dataset curation from noisy cockpit video',
          'Domain-specific augmentation pipelines',
          'Real-time inference under 30 ms / frame',
          'Synchronising detections with ADS-B telemetry'
        ]
      }
    }
  ]

  return (
    <section id="projects" style={{
      minHeight:'100vh',
      width:'100%',
      backgroundColor:'#f8fafc',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'80px 20px',
      position:'relative',
      overflow:'hidden'
    }}>
      {/* subtle grid */}
      <div style={{
        position:'absolute',inset:0,zIndex:1,opacity:1,
        backgroundImage:`
          linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)
        `,
        backgroundSize:'25px 25px',pointerEvents:'none'
      }}/>
      {/* crosses */}
      <div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none'}}>
        <svg style={{width:'100%',height:'100%',position:'absolute'}}>
          <defs>
            <pattern id="crosses-projects" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="rgba(0,0,0,0.03)" strokeWidth="1" fill="none">
                <line x1="50" y1="44" x2="50" y2="56"/>
                <line x1="44" y1="50" x2="56" y2="50"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosses-projects)"/>
        </svg>
      </div>

      <div style={{maxWidth:'1600px',width:'100%',position:'relative',zIndex:10}}>
        {/* heading */}
        <div style={{textAlign:'center',marginBottom:'60px'}}>
          <h2 style={{
            fontSize:'clamp(2rem, 5vw, 3.5rem)',
            fontWeight:700,color:'#0f172a',marginBottom:'16px',
            fontFamily:'Inter, sans-serif'
          }}>
            {t('projects.title')}
          </h2>
          <p style={{
            fontSize:18,color:'#64748b',maxWidth:600,
            margin:'0 auto',lineHeight:1.6
          }}>
            {t('projects.subtitle')}
          </p>
        </div>

        {/* cards grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',
          gap:'32px',
          maxWidth:'100%'
        }}>
          {projects.map((project,index)=>{
            const isExpanded = expandedCard===index
            return (
              <div key={index} style={{position:'relative'}}>
                {/* dot */}
                <div style={{
                  position:'absolute',left:-20,top:24,width:12,height:12,
                  borderRadius:'50%',
                  backgroundColor:isExpanded?'#3b82f6':'#64748b',
                  border:'3px solid #f8fafc',
                  boxShadow:`0 0 0 2px ${isExpanded?'#3b82f6':'#e2e8f0'}`,
                  zIndex:10,transform:isExpanded?'scale(1.2)':'scale(1)',
                  transition:'all .3s ease'
                }}/>
                {/* card */}
                <div
                  onClick={()=>setExpandedCard(isExpanded?null:index)}
                  style={{
                    backgroundColor:isExpanded?'#fff':'#f8fafc',
                    borderRadius:16,padding:32,
                    border:`2px solid ${isExpanded?'#3b82f6':'#e2e8f0'}`,
                    cursor:'pointer',transition:'all .3s ease',
                    transform:isExpanded?'translateY(-4px)':'translateY(0)',
                    boxShadow:isExpanded
                      ?'0 20px 40px rgba(59,130,246,.15)'
                      :'0 4px 6px rgba(0,0,0,.05)',
                    display:'flex',flexDirection:'column',minHeight:420
                  }}
                >
                  <h3 style={{
                    fontSize:24,fontWeight:600,color:'#1e293b',
                    marginBottom:16,fontFamily:'Inter, sans-serif'
                  }}>
                    {project.title}
                  </h3>

                  <p style={{
                    color:'#64748b',lineHeight:1.6,
                    marginBottom:20,fontSize:16
                  }}>
                    {project.description}
                  </p>

                  <div style={{
                    display:'flex',flexWrap:'wrap',
                    gap:8,marginBottom:isExpanded?24:20
                  }}>
                    {project.tech.map((tech,ti)=>(
                      <span key={ti} style={{
                        backgroundColor:'#dbeafe',color:'#3b82f6',
                        padding:'4px 12px',borderRadius:12,
                        fontSize:12,fontWeight:500,fontFamily:'Inter, sans-serif'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>

                                     {/* links */}
                   {(project.github !== '#' || project.demo !== '#') && (
                     <div style={{
                       display:'flex',gap:16,
                       marginBottom:isExpanded?24:0,marginTop:'auto'
                     }}>
                       {project.github !== '#' && (
                         <a href={project.github} onClick={e=>e.stopPropagation()}
                           target="_blank" rel="noopener noreferrer"
                           style={{
                             padding:'8px 16px',background:'#f8fafc',color:'#475569',
                             textDecoration:'none',borderRadius:8,fontSize:14,
                             fontWeight:500,border:'1px solid #e2e8f0',
                             transition:'all .2s'
                           }}
                           onMouseEnter={e=>{
                             e.currentTarget.style.background='#e2e8f0'
                           }}
                           onMouseLeave={e=>{
                             e.currentTarget.style.background='#f8fafc'
                           }}
                         >
                           {t('projects.viewCode')}
                         </a>
                       )}
                       {project.demo !== '#' && (
                         <a href={project.demo} onClick={e=>e.stopPropagation()}
                           target="_blank" rel="noopener noreferrer"
                           style={{
                             padding:'8px 16px',background:'#3b82f6',color:'#fff',
                             textDecoration:'none',borderRadius:8,fontSize:14,
                             fontWeight:500,transition:'all .2s'
                           }}
                           onMouseEnter={e=>{
                             e.currentTarget.style.background='#2563eb'
                           }}
                           onMouseLeave={e=>{
                             e.currentTarget.style.background='#3b82f6'
                           }}
                         >
                           {project.title === 'Deep Learning in Agriculture' ? 'View Document' : t('projects.viewProject')}
                         </a>
                       )}
                     </div>
                   )}

                  {/* expanded */}
                  {isExpanded && (
                    <div style={{
                      paddingTop:24,borderTop:'1px solid #e2e8f0',
                      animation:'slideDown .3s ease-out'
                    }}>
                      <div style={{
                        display:'grid',
                        gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
                        gap:24
                      }}>
                        <DetailsList
                          title={`✨ ${t('projects.achievements')}`}
                          items={project.details.features}
                          bullet="•"
                          bulletColor="#10b981"
                        />
                        <DetailsList
                          title={`🚀 ${t('projects.challenges')}`}
                          items={project.details.challenges}
                          bullet="•"
                          bulletColor="#f59e0b"
                        />
                      </div>
                    </div>
                  )}

                  <div style={{
                    textAlign:'center',marginTop:16,
                    fontSize:12,color:'#94a3b8'
                  }}>
                    {isExpanded?'Click to collapse':'Click for details'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {opacity:0;transform:translateY(-10px);}
          to   {opacity:1;transform:translateY(0);}
        }
      `}</style>
    </section>
  )
}

/* helper */
function DetailsList({
  title, items, bullet, bulletColor
}:{
  title:string; items:string[]; bullet:string; bulletColor:string
}){
  return (
    <div>
      <h4 style={{
        fontSize:16,fontWeight:600,color:'#1e293b',
        marginBottom:12,fontFamily:'Inter, sans-serif'
      }}>
        {title}
      </h4>
      <ul style={{listStyle:'none',margin:0,padding:0}}>
        {items.map((item,i)=>(
          <li key={i} style={{
            display:'flex',alignItems:'flex-start',gap:8,
            marginBottom:8,fontSize:14,lineHeight:1.5
          }}>
            <span style={{
              color:bulletColor,fontWeight:600,marginTop:2,flexShrink:0
            }}>
              {bullet}
            </span>
            <span style={{color:'#475569'}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
