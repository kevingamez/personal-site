import type { ResumeStrings } from './resume'

export const resumeEs: ResumeStrings = {
  kicker: 'Hoja de vida',
  name: 'Kevin Gámez',
  contactLocation: 'Bogotá, Colombia',
  summary:
    'Founding engineer, más recientemente en Enttor, respaldada por MaC Venture Capital (2025-2026). Tuve la ingeniería a cargo en un equipo de seis, entre la plataforma de anuncios, el agente de Slack que la maneja y el estudio con IA detrás de los anuncios. Buscando lo que sigue.',
  download: 'Descargar hoja de vida ↓',
  downloadFileName: 'Kevin-Gamez-Hoja-de-vida.pdf',
  headings: {
    experience: 'Experiencia',
    education: 'Educación',
    projects: 'Proyectos',
    skills: 'Habilidades e intereses',
  },
  experience: [
    {
      role: 'Founding Engineer',
      at: 'Enttor',
      dates: 'Mar 2025 – Jul 2026',
      meta: 'Nueva York, NY (remoto), respaldada por MaC Venture Capital',
      bullets: [
        'Responsable de la ingeniería en un equipo de seis personas a lo largo de varios pivots. Construí y operé la plataforma detrás de más de USD 160.000 en ingresos durante los primeros siete meses de 2026.',
        'Construí una plataforma de anuncios multi-tenant que unifica los datos de campañas de Meta y TikTok en un solo esquema de métricas. Un agente en Slack la maneja y reduce 165 herramientas a una lista corta por mensaje mediante coincidencia por palabra clave, con recuperación por embeddings como respaldo.',
        'Construí un generador de anuncios con IA que recibe la URL de una marca y devuelve creatividades terminadas, y luego volví editables esas creatividades por capas con docTR, SAM 3 e inpainting con LaMa. Mover el renderizado a GPUs bajó la generación de una hora a menos de 5 minutos.',
        'Puse cada API externa detrás de un circuit breaker con reintentos con jitter y tracé cada petición de punta a punta con OpenTelemetry.',
        'Automaticé el outreach y la búsqueda de candidatos con agentes de navegador en Playwright sobre Instagram, LinkedIn y X. El ritmo configurado por plataforma mantuvo las cuentas utilizables durante semanas y no horas.',
      ],
    },
    {
      role: 'Product Engineer',
      at: 'Samsam',
      dates: 'Feb 2024 – Mar 2025',
      meta: 'Bogotá, Colombia, respaldada por Neo',
      bullets: [
        'Construí una app móvil en React Native y Expo y una app web en Next.js para compradores y comercios, sobre servicios en TypeScript con NestJS y Prisma.',
        'Refactoricé servicios centrales y reduje los tiempos de respuesta en un 10% mediante mejores consultas de Prisma y una reestructuración de la lógica.',
        'Construí el sistema de alertas que clasificaba los errores de producción por severidad y enrutaba cada uno a un responsable, con Sentry y el monitoreo de Vercel.',
      ],
    },
    {
      role: 'Software Engineer',
      at: 'Heinsohn Human Global Solutions',
      dates: 'Oct 2022 – Dic 2023',
      meta: 'Bogotá, Colombia',
      bullets: [
        'Reemplacé los despliegues manuales llevando el pipeline a Azure y construyendo el CI/CD que publicaba automáticamente en el servidor de cada cliente.',
        'Fui responsable de un servicio de reportes en Python/Flask que ejecutaba consultas programadas sobre las bases de datos de los clientes.',
        'Construí los tableros en Power BI que los clientes usaban para seguir métricas de recursos humanos y nómina, reemplazando reportes que se armaban a mano.',
      ],
    },
  ],
  education: [
    {
      role: 'M.Sc. en Ingeniería de Información',
      at: 'Universidad de los Andes',
      dates: 'Ene 2024 – May 2025',
      meta: 'Bogotá, Colombia',
      bullets: [],
    },
    {
      role: 'Ingeniería de Sistemas y Computación',
      at: 'Universidad de los Andes',
      dates: 'Ene 2019 – Dic 2023',
      meta: 'Bogotá, Colombia',
      bullets: ['Opciones en Matemáticas y Administración (Dic 2022).'],
    },
  ],
  projects: [
    {
      role: 'Deep learning para segmentación de cultivos sobre imágenes satelitales',
      dates: 'Dic 2023',
      bullets: [
        'Entrené DeepLab V3+ en PyTorch, comparando backbones MobileNet V3 y ResNet50, para segmentar plantaciones de palma de aceite a partir de compuestos SAR de Sentinel-1 y de banda roja de Sentinel-2.',
        'Alcancé 98,4% de exactitud y 0,991 de F1 en mosaicos de 10x10 km, frente al 96% de una línea base de machine learning convencional. Publicado en repositorio.uniandes.edu.co.',
      ],
    },
  ],
  skills: [
    {
      term: 'Lenguajes',
      desc: 'TypeScript, JavaScript, Python, SQL, Java.',
    },
    {
      term: 'IA y ML',
      desc: 'Agentes con LLMs y tool use, RAG con pgvector, APIs de Anthropic y OpenAI, servidores MCP, PyTorch.',
    },
    {
      term: 'Web e infraestructura',
      desc: 'Next.js, React Native, NestJS, tRPC, Prisma, PostgreSQL, Redis, AWS, Docker, CI/CD.',
    },
    {
      term: 'Intereses',
      desc: 'Running de fondo y ciclismo.',
    },
  ],
  back: '← volver a kevingamez.co',
  jsonLdLang: 'es',
  jsonLdName: 'Hoja de vida, Kevin Gámez',
  breadcrumbLabel: 'Hoja de vida',
  pageUrl: 'https://kevingamez.co/es/resume/',
}
