import type { ResumeStrings } from './resume'

export const resumeEs: ResumeStrings = {
  kicker: 'Hoja de vida',
  name: 'Kevin Gámez',
  contactLocation: 'Bogotá, Colombia',
  summary:
    'Founding engineer, más recientemente en una startup respaldada por MaC Venture Capital (2025-2026). Responsable del producto y la plataforma de punta a punta. Ejecución constante, atención meticulosa al detalle, comunicación concisa. Abierto a lo que sigue.',
  download: 'Descargar hoja de vida ↓',
  downloadFileName: 'Kevin-Gamez-Hoja-de-vida.pdf',
  headings: {
    experience: 'Experiencia',
    education: 'Educación',
    skills: 'Habilidades',
  },
  experience: [
    {
      role: 'Founding Engineer',
      at: 'Enttor',
      dates: 'Jun 2025 – Jul 2026',
      meta: 'Bogotá, COL',
      bullets: [
        'Responsable de toda la función de ingeniería en un equipo de seis personas. Diseñé, desarrollé y mantuve la plataforma detrás de más de USD 160.000 en ingresos en 2026.',
        'Operé un proceso de desarrollo AI-native: definí especificaciones, dirigí la generación de código con LLMs y filtré cada release con revisión y QA. Sostuve ciclos de construir, probar y desplegar en 3 días, con sesiones semanales de feedback con clientes.',
        'Construí una plataforma de creación de anuncios con IA y edición por capas al estilo Figma (OCR, segmentación de imágenes, generación de 30 anuncios por lote). Reconstruí el pipeline sobre GPUs y bajé el tiempo de generación de 11 minutos a menos de 2, más de 5 veces más rápido.',
        'Automaticé la búsqueda de candidatos y prospectos: agentes de navegador que filtraban perfiles por universidad, empleador y experiencia como fundador, más un agente de IA nativo de Slack que gestionaba las operaciones publicitarias en Meta, TikTok y Google Ads.',
      ],
    },
    {
      role: 'Product Engineer',
      at: 'Samsam',
      dates: 'Feb 2024 – Mar 2025',
      meta: 'Bogotá, COL',
      bullets: [
        'Desarrollé y desplegué funcionalidades en varias plataformas, incluidas las aplicaciones de compradores y de comercios.',
        'Diseñé e implementé soluciones escalables de front-end y back-end con TypeScript, React Native, Next.js, Prisma y PostgreSQL.',
        'Refactoricé servicios centrales del backend y mejoré el rendimiento, la confiabilidad y la mantenibilidad de la plataforma de e-commerce.',
      ],
    },
  ],
  education: [
    {
      role: 'M.Sc. en Ingeniería de Información',
      at: 'Universidad de los Andes',
      dates: 'May 2025',
      meta: 'Bogotá, COL',
      bullets: [
        'Cursos relevantes: big data, sistemas de recomendación, business analytics, deep learning, desarrollo en la nube.',
      ],
    },
    {
      role: 'Ingeniería de Sistemas y Computación',
      at: 'Universidad de los Andes',
      dates: 'Dic 2023',
      meta: 'Bogotá, COL',
      bullets: [
        'Cursos relevantes: programación de sistemas, estructuras de datos y algoritmos, business analytics, desarrollo web, desarrollo móvil.',
      ],
    },
    {
      role: 'Opciones en Matemáticas y Administración',
      at: 'Universidad de los Andes',
      dates: 'Dic 2022, Dic 2023',
      meta: 'Bogotá, COL',
      bullets: [],
    },
  ],
  skills: [
    {
      term: 'IA',
      desc: 'Agentes con LLMs, prompt engineering, APIs de OpenAI y Anthropic, OCR, segmentación de imágenes, PyTorch.',
    },
    {
      term: 'Ingeniería',
      desc: 'TypeScript, Next.js, NestJS, React Native, Python, Postgres, ETL, AWS.',
    },
  ],
  back: '← volver a kevingamez.co',
  jsonLdLang: 'es',
  jsonLdName: 'Hoja de vida, Kevin Gámez',
  breadcrumbLabel: 'Hoja de vida',
  pageUrl: 'https://kevingamez.co/es/resume/',
}
