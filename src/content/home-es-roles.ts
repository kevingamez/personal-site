import type { HomeRole } from './home'

// The experience timeline rows for the ES locale. Split out of
// home-es.ts, which hit the 300-line cap when Heinsohn was added.
export const esRoles: HomeRole[] = [
  {
    dates: 'Mar 2025, Jul 2026',
    place: 'New York, remoto',
    roleHtml: 'Founding engineer <span class="at">@ Enttor</span>',
    logo: '/logos/enttor.png',
    summary:
      'Tres productos de punta a punta: la plataforma de anuncios, el agente de Slack que la maneja y el estudio creativo.',
    desc: 'Empezó como el motor de outbound, con agentes de navegador buscando prospectos y redactando los DMs. Terminó en otro lugar: los datos de campañas de Meta y TikTok unificados en un solo esquema de métricas, un motor de reglas que responde escalar, pausar o archivar con una razón, y un agente de Slack que los media buyers manejan en lenguaje natural sobre 165 herramientas. El último producto generaba los anuncios y luego los desarmaba en capas editables sobre workers con GPU.',
    ledger: [
      { label: 'Productos lanzados', value: 'Tres' },
      { label: 'Generación de anuncios', value: '1 hr a menos de 5 min' },
      { label: 'Tools del agente, Meta y TikTok', value: '165' },
      { label: 'Equipo', value: 'Seis' },
    ],
    stackLabel: 'Construido con',
    stack: ['TypeScript', 'Next.js', 'Supabase', 'Playwright', 'Claude', 'Modal'],
    backer: {
      label: 'Respaldada por',
      name: 'MaC Venture Capital',
      href: 'https://macventurecapital.com/',
    },
  },
  {
    dates: 'Feb 2024, Mar 2025',
    place: 'Bogotá',
    roleHtml: 'Product engineer <span class="at">@ Samsam</span>',
    logo: '/logos/samsam.png',
    summary:
      'Lancé los dos lados de un marketplace: app para compradores y panel para comerciantes.',
    desc: 'Una app en React Native y Expo para compradores y un panel en Next.js para comerciantes, sobre servicios en NestJS con Prisma y Postgres. Lancé los dos lados.',
    ledger: [
      { label: 'Lancé', value: 'Los dos lados del marketplace' },
      { label: 'Plataformas', value: 'iOS, Android, web' },
      { label: 'Respuesta de la API', value: '10% más rápida' },
      { label: 'Alertas de producción', value: 'Por severidad' },
    ],
    stackLabel: 'Construido con',
    stack: ['React Native', 'Expo', 'Next.js', 'NestJS', 'Prisma', 'Postgres'],
    backer: { label: 'Respaldada por', name: 'Neo', href: 'https://neo.com/' },
  },
  {
    dates: 'Oct 2022, Dic 2023',
    place: 'Bogotá',
    roleHtml: 'Software engineer <span class="at">@ Heinsohn</span>',
    logo: '/logos/heinsohn.png',
    summary:
      'Software de recursos humanos y nómina: el pipeline de despliegue, los reportes, los tableros.',
    desc: 'Los despliegues eran manuales cuando llegué. Llevé el pipeline a Azure y construí el CI/CD que publicaba solo en el servidor de cada cliente. Fui responsable de un servicio de reportes en Python y Flask que ejecutaba consultas programadas sobre las bases de datos de los clientes, y construí los tableros en Power BI que usaban para seguir headcount, rotación y costo de nómina, reemplazando reportes que se armaban a mano.',
    ledger: [
      { label: 'Despliegues', value: 'Manual a automático' },
      { label: 'Releases', value: 'A cada servidor cliente' },
      { label: 'Servicio de reportes', value: 'Consultas programadas' },
      { label: 'Tableros', value: 'Headcount, rotación, nómina' },
    ],
    stackLabel: 'Construido con',
    stack: ['Python', 'Flask', 'Java', 'Spring Boot', 'Azure', 'Power BI'],
  },
  {
    dates: 'Ene 2024, May 2025',
    place: 'Bogotá',
    roleHtml: 'M.Sc. Ingeniería de Información <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    // Ver la nota en home-en.ts: describe el programa, no su desempeño.
    summary:
      'Convertir datos que una organización todavía no sabe leer en decisiones que sí puede tomar.',
    desc: 'La maestría trata sobre toda la vida de la información, no sobre un modelo al final. Arranca con los datos que no caben en una tabla, semiestructurados, geolocalizados, de alta velocidad, multimedia, y pregunta cuánto valen para la organización que los tiene. El resto del tiempo se va en la mitad menos vistosa: mantener esos datos gobernados, seguros y lo bastante buenos como para que una decisión tomada encima se sostenga. La ciencia de datos aplicada y el machine learning van al lado de los sistemas de recomendación, la ingeniería del conocimiento y la privacidad.',
    ledger: [
      { label: 'Duración', value: 'Cuatro semestres' },
      { label: 'Cursada', value: 'Part-time, trabajando' },
      { label: 'Departamento', value: 'Sistemas y Computación' },
      { label: 'Campo', value: 'Datos a escala' },
    ],
    stackLabel: 'Cursos',
    stack: [
      'Ciencia de datos aplicada',
      'Big data',
      'Machine learning',
      'Sistemas de recomendación',
      'Ingeniería del conocimiento',
      'Seguridad y privacidad',
    ],
  },
  {
    dates: 'Dic 2022',
    place: 'Bogotá',
    roleHtml:
      'Opciones en Matemáticas y Administración <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    summary: 'Dos opciones cursadas dentro del pregrado, una formal y una de negocio.',
    desc: 'Matemáticas por el lado formal, Administración por el lado de negocio. Las dos se cursaron en paralelo a la carrera y se cerraron antes del grado.',
    ledger: [
      { label: 'Matemáticas', value: 'Por el lado formal' },
      { label: 'Administración', value: 'Por el lado de negocio' },
      { label: 'Cursadas', value: 'En paralelo al pregrado' },
      { label: 'Cerradas', value: 'Dic 2022, un año antes' },
    ],
    stackLabel: 'Áreas',
    stack: ['Matemáticas', 'Administración'],
  },
  {
    dates: 'Ene 2019, Dic 2023',
    place: 'Bogotá',
    roleHtml:
      'B.Sc. Ingeniería de Sistemas y Computación <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    summary: 'Cinco años en los fundamentos: sistemas, algoritmos y ML aplicado.',
    desc: 'Sistemas, algoritmos y ML aplicado. Por el camino, proyectos propios en Python, TypeScript, Java y Swift.',
    ledger: [
      { label: 'Duración', value: '5 años' },
      { label: 'Tesis', value: 'Cultivos en imágenes satelitales' },
      { label: 'Exactitud', value: '98,4%' },
      { label: 'F1', value: '0,991' },
    ],
    stackLabel: 'Trabajé en',
    stack: ['Python', 'TypeScript', 'Java', 'Swift'],
    link: {
      label: 'Tesis',
      name: 'Deep Learning en agricultura: conceptos y aplicaciones en la identificación de cultivos sobre imágenes satelitales',
      href: 'https://repositorio.uniandes.edu.co/entities/publication/2cd71d69-7078-4901-87e7-9bc9f2cb62e5',
    },
  },
]
