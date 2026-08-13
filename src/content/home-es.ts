import type { HomeStrings } from './home'
import { esSections } from './home-es-sections'

export const es: HomeStrings = {
  meta: {
    htmlLang: 'es',
    title: 'Kevin Gámez - Founding Engineer, abierto a lo que sigue',
    description:
      'Kevin Gámez es founding engineer en Bogotá, abierto a lo que sigue. Automatización de navegador, pipelines de LLM, TypeScript, Next.js, NestJS y Postgres.',
    canonical: 'https://kevingamez.co/es/',
    ogUrl: 'https://kevingamez.co/es/',
    ogTitle: 'Kevin Gámez - Founding Engineer, abierto a lo que sigue',
    ogDescription:
      'Founding engineer en Bogotá, abierto a lo que sigue. Automatización de navegador, pipelines de LLM, TypeScript full-stack.',
    ogLocale: 'es_CO',
    ogLocaleAlternate: 'en_US',
    twitterTitle: 'Kevin Gámez - Founding Engineer, abierto a lo que sigue',
    twitterDescription:
      'Founding engineer en Bogotá, abierto a lo que sigue. Automatización de navegador, pipelines de LLM, TypeScript full-stack.',
    includeJsonLd: true,
    brandHref: '/es/',
    skip: 'Saltar al contenido',
    hreflang: [
      { lang: 'en', href: 'https://kevingamez.co/' },
      { lang: 'es', href: 'https://kevingamez.co/es/' },
      { lang: 'x-default', href: 'https://kevingamez.co/' },
    ],
  },
  nav: {
    about: 'Sobre mí',
    experience: 'Experiencia',
    work: 'Proyectos',
    deck: 'Fuera del CV',
    github: 'GitHub',
    strava: 'En movimiento',
    writing: 'Escritos',
    console: 'Pregúntame',
    resume: 'CV',
    sayHi: 'Escríbeme ↗',
  },
  hero: {
    metaRole: 'Founding engineer, abierto a lo que sigue',
    metaPlace: 'Bogotá, Colombia',
    weatherLabels:
      '{"clear": "despejado", "partly cloudy": "parcialmente nublado", "cloudy": "nublado", "fog": "niebla", "drizzle": "llovizna", "rain": "lluvia", "showers": "aguaceros", "snow": "nieve", "storm": "tormenta"}',
    titleHtml: 'Hola',
    lede: 'Soy founding engineer en Bogotá, abierto a lo que sigue. Estuve en <b>Enttor</b>, donde construí la\n            plataforma de creativos con IA y los agentes de navegador detrás de su outbound. Antes lancé un marketplace\n            de e-commerce en <b>Samsam</b>. Maestría en deep learning en la Universidad de los Andes.',
    stat1Num: '02',
    stat1Label: 'Startups como founding engineer',
    stat2Num: '07',
    stat2Label: 'Años en GitHub',
    scrollDown: 'Sigue bajando',
    btnGetInTouch: 'Hablemos',
    pauseTitle: 'pausar / reproducir',
    resetTitle: 're-sembrar aleatorio',
    stampGlider: 'planeador',
    stampLwss: 'nave',
    stampPulsar: 'púlsar',
    stampGun: 'cañón gosper',
    stampClear: 'limpiar',
    gen: 'gen',
    alive: 'vivas',
    fps: 'fps',
    golCaptionHtml:
      '<b>Juego de la vida de Conway</b>, un autómata celular de cero jugadores. Cada celda vive, muere o nace según el número de sus 8 vecinas (B3/S23). Click para sembrar un patrón. <a href="https://es.wikipedia.org/wiki/Juego_de_la_vida" target="_blank" rel="noopener">más info →</a>',
    golAriaLabel: 'Simulación del Juego de la vida de Conway',
  },
  about: {
    secNum: 'Sobre mí',
    titleHtml: 'Sobre mí.',
    blurb: 'Founding engineer full-stack, con maestría en deep learning.',
    p1Html:
      'Me gustan las partes de un producto que nadie muestra en un demo: la cola que reintenta, la sesión\n              que sigue abierta, el pipeline que admite que se equivocó y vuelve a correr. Casi todo lo que he\n              lanzado es alguna máquina haciendo trabajo tedioso a las tres de la mañana.',
    p2Html:
      'Antes de las startups pasé un tiempo en analítica, escribiendo pipelines SQL y dashboards en Power BI\n              para HR, riesgo y operaciones, y luego en deep learning sobre imágenes satelitales, detectando\n              cultivos y riesgo ambiental. Las dos me enseñaron a desconfiar de un número que no puedo rastrear.',
    p3Html:
      'B.Sc. en Ingeniería de Sistemas y Computación y M.Sc. en Ingeniería de Información, ambas en la\n              <b>Universidad de los Andes</b>, con especialización en deep learning y un minor en Management.',
    qfBased: 'Ubicación',
    qfBasedV: 'Bogotá, Colombia',
    qfRole: 'Rol',
    qfRoleV: 'Founding engineer, abierto a lo que sigue',
    qfStack: 'Stack favorito',
    qfStackV: 'TypeScript, Next.js, Postgres',
    qfObsessed: 'Cacharreando con',
    qfObsessedV: 'Automatización de navegador y pipelines de LLM',
  },
  experience: {
    secNum: 'Experiencia',
    titleHtml: 'Dos startups y una maestría.',
    blurb:
      'Ingeniero fundador en Samsam y luego en Enttor. Hice la maestría en deep learning mientras trabajaba en el primer empleo.',
    openHint: 'Haz click en una fila para abrirla',
    roles: [
      {
        dates: 'Jun 2025, Jul 2026',
        place: 'New York, remoto',
        roleHtml: 'Founding engineer <span class="at">@ Enttor</span>',
        logo: '/logos/enttor.png',
        summary:
          'Construí el motor de outbound con IA de punta a punta: automatización, pipelines y dashboards.',
        desc: 'La automatización de navegador buscaba prospectos en Instagram y LinkedIn, los pipelines de OpenAI los filtraban y redactaban los mensajes, y las campañas los enviaban a escala. Dashboards en Next.js, APIs en NestJS y colas en Inngest sobre Vercel y Supabase, desde cero.',
        ledger: [
          { label: 'Rutas de API', value: '132' },
          { label: 'Esquemas de Postgres', value: '4' },
          { label: 'Tools del agente, Meta y TikTok', value: '165' },
          { label: 'Plataformas automatizadas', value: '4' },
        ],
        stackLabel: 'Construido con',
        stack: ['TypeScript', 'Next.js', 'NestJS', 'Inngest', 'Supabase', 'Playwright'],
      },
      {
        dates: 'Feb 2024, Mar 2025',
        place: 'Bogotá',
        roleHtml: 'Founding engineer <span class="at">@ Samsam</span>',
        logo: '/logos/samsam.png',
        summary:
          'Lancé los dos lados de un marketplace: app para compradores y panel para comerciantes.',
        desc: 'Una app en React Native para compradores y un panel en Next.js para comerciantes, sobre Prisma y Postgres. Lancé los dos lados.',
        ledger: [
          { label: 'Lados del marketplace', value: '2' },
          { label: 'De cero a lanzamiento', value: '14 meses' },
          { label: 'Apps', value: 'iOS, Android, web' },
          { label: 'Capa de datos', value: 'Prisma, Postgres' },
        ],
        stackLabel: 'Construido con',
        stack: ['React Native', 'Next.js', 'Prisma', 'Postgres'],
      },
      {
        dates: 'Ene 2024, May 2025',
        place: 'Bogotá',
        roleHtml:
          'M.Sc. Ingeniería de Información <span class="at">@ Universidad de los Andes</span>',
        logo: '/logos/uniandes.svg',
        summary:
          'Especialización en deep learning, hecha mientras trabajaba. TA de posgrado en paralelo.',
        desc: 'Entrené modelos de deep learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental. En paralelo, teaching assistant de posgrado.',
        ledger: [
          { label: 'Foco', value: 'Imágenes satelitales' },
          { label: 'Rol', value: 'TA de posgrado' },
          { label: 'Especialización', value: 'Deep learning' },
          { label: 'Traslape con el trabajo', value: 'Tiempo completo' },
        ],
        stackLabel: 'Trabajé en',
        stack: ['Python', 'SQL', 'Deep learning'],
      },
      {
        dates: 'Ene 2019, Dic 2023',
        place: 'Bogotá',
        roleHtml:
          'B.Sc. Ingeniería de Sistemas y Computación <span class="at">@ Universidad de los Andes</span>',
        logo: '/logos/uniandes.svg',
        summary: 'Cinco años en los fundamentos, más un minor en Management.',
        desc: 'Sistemas, algoritmos y ML aplicado, más un minor en Management. Por el camino, proyectos propios en Python, TypeScript, Java y Swift.',
        ledger: [
          { label: 'Minor', value: 'Management' },
          { label: 'Fundamentos', value: '5 años' },
          { label: 'Énfasis', value: 'Sistemas, algoritmos' },
          { label: 'Proyectos propios', value: '4 lenguajes' },
        ],
        stackLabel: 'Trabajé en',
        stack: ['Python', 'TypeScript', 'Java', 'Swift'],
      },
    ],
    achievementsTitle: 'Honores y certificaciones',
    achievementsBlurb: 'Una distinción nacional y dos certificaciones de AWS.',
    achievements: [
      {
        year: '2018',
        logo: '/logos/mineducacion.svg',
        titleHtml: 'Distinción <i>Andrés Bello</i>',
        meta: 'Ministerio de Educación, Colombia, categoría nacional',
        desc: 'Otorgada por el Ministerio de Educación por estar entre los mejores puntajes del examen Saber 11 del país.',
      },
      {
        year: '2022',
        logo: '/logos/aws.svg',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certificación, Amazon Web Services',
        desc: 'Construir, desplegar y escalar apps en AWS: IAM, Lambda, DynamoDB y S3.',
      },
      {
        year: '2021',
        logo: '/logos/aws.svg',
        titleHtml: 'AWS Academy <i>Cloud Foundations</i>',
        meta: 'Certificación, Amazon Web Services',
        desc: 'Fundamentos de AWS: servicios, seguridad, arquitectura y facturación.',
      },
    ],
  },
  work: {
    secNum: 'Proyectos',
    titleHtml: 'Cosas que he construido.',
    blurb: 'Producto, infraestructura y algunas cosas por mi cuenta.',
    p1NameHtml: 'Estudio de Anuncios con IA, <i>anuncios que se construyen solos.</i>',
    p1ImageAlt:
      'Estación de trabajo de Kevin Gámez con el sitio de Enttor abierto en un portátil y código en un monitor',
    p1Desc:
      'El último producto de Enttor. Le das el sitio de una marca y extrae logos, colores y tipografías, escribe conceptos de anuncio con Claude, renderiza las imágenes finales y revisa su propio trabajo con una pasada de visión. También desarma un anuncio existente en capas editables: OCR y segmentación recuperan el texto, las fuentes y las cajas reales, así un media buyer edita sobre un canvas en vez de rehacerlo. El pipeline de visión corre en GPU.',
    p1Meta: 'Next.js, NestJS, OpenAI, Inngest, Supabase',
    projects: [
      {
        name: 'Agente de Slack',
        desc: 'Un bot de Slack con el que los media buyers hablan como con un colega. 165 herramientas sobre las APIs de Meta y TikTok, así que lanzar un anuncio toma tres pasos en vez de los treinta que pide Ads Manager.',
        meta: 'Claude tool use, APIs de Meta y TikTok, Postgres',
      },
      {
        name: 'Plataforma Enttor',
        desc: 'Dos años del producto de GTM: sacaba prospectos de Instagram y LinkedIn, escribía DMs personalizados y dejaba cada respuesta en un inbox único. 132 rutas de API sobre cuatro esquemas de Postgres.',
        meta: 'Next.js, Supabase, Inngest',
      },
      {
        name: 'MakeMotionGraphics',
        desc: 'De texto a motion graphics en loop. Claude escribe una escena HTML, la captura en Chrome headless para ver su propio resultado, corrige lo que falla y solo entonces graba a MP4.',
        meta: 'Loop agéntico, Puppeteer, ffmpeg',
      },
      {
        name: 'LinkedIn Editor',
        desc: 'Un editor conversacional para posts de LinkedIn. Pegas un borrador y discutes con Claude sobre el hook hasta que funciona, apoyado en recuperación sobre un corpus de posts que sí rindieron.',
        meta: 'RAG con pgvector, Next.js',
      },
      {
        name: 'Infraestructura de Automatización',
        desc: 'El backend detrás del outreach: servicios Node en un Mac Mini que mantienen sesiones reales en cuatro plataformas y mandan mensajes a ritmo humano. Dos compañeros lo lideraron, yo contribuí.',
        meta: 'Playwright, BullMQ, Redis',
      },
      {
        name: 'Samsam',
        desc: 'Antes de Enttor. Un marketplace de compras: app en React Native para compradores y panel en Next.js para comerciantes, sobre Prisma y Postgres. Lancé ambos lados.',
        meta: 'React Native, Prisma',
      },
    ],
    allRepos: 'Todos los repositorios',
  },
  deck: {
    momentsLabel: 'Momentos',
    momentsFull: 'Pantalla completa',
    momentsClose: 'Click o Esc para soltarla',
    secNum: 'Las cartas',
    titleHtml: 'Lo que un CV no cuenta.',
    blurb: 'Nueve fotos. Todo lo que cuentan es verdad.',
    hint: 'Elige una carta',
  },
  ...esSections,
}
