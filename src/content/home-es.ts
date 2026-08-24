import type { HomeStrings } from './home'
import { esSections } from './home-es-sections'
import { esRoles } from './home-es-roles'

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
    metaPlace: 'Bogotá, Colombia',
    weatherLabels:
      '{"clear": "despejado", "partly cloudy": "parcialmente nublado", "cloudy": "nublado", "fog": "niebla", "drizzle": "llovizna", "rain": "lluvia", "showers": "aguaceros", "snow": "nieve", "storm": "tormenta"}',
    titleHtml: 'Hola',
    lede: 'Soy founding engineer en Bogotá y estoy buscando lo que sigue. Tuve la ingeniería a cargo en\n            <b>Enttor</b>, donde armé la plataforma de paid ads sobre Meta y TikTok y el agente de Slack que la\n            maneja. Antes trabajé en un marketplace de e-commerce en <b>Samsam</b>. Tengo una maestría de la\n            Universidad de los Andes.',
    creds: [
      { k: 'Hasta hace poco', v: 'Founding engineer en Enttor' },
      { k: 'Estudié en', v: 'Universidad de los Andes' },
    ],
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
    blurb: 'Founding engineer full-stack, con maestría en Ingeniería de Información.',
    p1Html:
      'Me gustan las partes de un producto que nadie muestra en un demo: la cola que reintenta, la sesión\n              que sigue abierta, el pipeline que admite que se equivocó y vuelve a correr. Casi todo lo que he\n              lanzado es alguna máquina haciendo trabajo tedioso a las tres de la mañana.',
    p2Html:
      'Antes de las startups pasé un tiempo en analítica, escribiendo pipelines SQL y dashboards en Power BI\n              para HR, riesgo y operaciones, y luego en deep learning sobre imágenes satelitales, detectando\n              cultivos y riesgo ambiental. Las dos me enseñaron a desconfiar de un número que no puedo rastrear.',
    p3Html:
      'B.Sc. en Ingeniería de Sistemas y Computación y M.Sc. en Ingeniería de Información, ambas en la\n              <b>Universidad de los Andes</b>, con opciones en Matemáticas y Administración.',
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
    titleHtml: 'Los trabajos, y los estudios alrededor.',
    blurb:
      'Product engineer en Samsam y luego founding engineer en Enttor. Hice la maestría mientras trabajaba en el primer empleo.',
    openHint: 'Haz click en una fila para abrirla',
    roles: esRoles,
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
      'El último producto de Enttor. Le das el sitio de una marca y extrae logos, colores y tipografías, escribe conceptos de anuncio con Claude, renderiza las imágenes y revisa su propio trabajo con una pasada de visión. La mitad difícil va al revés: OCR y segmentación desarman un anuncio terminado en capas editables, y emparejan cada línea de texto contra 311 familias tipográficas, así un media buyer edita sobre un canvas en vez de rehacerlo. Los dos workers de visión corren en GPU.',
    p1Meta: 'Next.js, Python, PyTorch, Modal, Supabase',
    projects: [
      {
        name: 'Agente de Slack',
        desc: 'Un bot de Slack con el que los media buyers hablan como con un colega. 165 herramientas sobre las APIs de Meta y TikTok. La precisión se cae mucho antes de que 165 herramientas quepan en el contexto, así que un router recorta cada mensaje a una lista corta antes de que Claude las vea.',
        meta: 'Claude tool use, APIs de Meta y TikTok, pgvector',
      },
      {
        name: 'Plataforma Enttor',
        desc: 'Dos años en un solo repo. Sacaba prospectos de Instagram y LinkedIn, escribía DMs personalizados y dejaba cada respuesta en un inbox único, y en 2026 se reenfocó en paid ads: insights de Meta y TikTok en un solo esquema de métricas, evaluados contra umbrales por cliente. Row level security aísla a cada empresa del resto, así que un handler que olvida su filtro no devuelve nada.',
        meta: 'Next.js, Supabase, Postgres RLS',
      },
      {
        name: 'MakeMotionGraphics',
        desc: 'De texto a motion graphics en loop. Claude escribe una escena HTML autocontenida, la captura en Chrome headless en tres instantes para leer su propio resultado y corrige lo que falla. Solo una escena que pasa el control de composición se graba a MP4.',
        meta: 'Loop agéntico, Puppeteer, ffmpeg',
      },
      {
        name: 'LinkedIn Editor',
        desc: 'Un editor conversacional para posts de LinkedIn. Pegas un borrador y discutes con Claude sobre el hook hasta que funciona, apoyado en búsqueda por coseno sobre un corpus de posts que sí rindieron. Tres variaciones llegan en paralelo, una por ángulo de hook.',
        meta: 'RAG con pgvector, Next.js',
      },
      {
        name: 'Infraestructura de Automatización',
        desc: 'El backend detrás del outreach: servicios Node en un Mac Mini que mantienen sesiones de navegador autenticadas en cuatro plataformas, con colas de Redis marcando un ritmo de minutos y no de milisegundos. Dos compañeros lo lideraron, yo aporté el pipeline de Instagram y el manejo de sesiones.',
        meta: 'Playwright, Redis, Postgres',
      },
      {
        name: 'Samsam',
        desc: 'Antes de Enttor. Un marketplace de compras: app en React Native y Expo para compradores y panel en Next.js para comerciantes, sobre servicios en NestJS con Prisma y Postgres. Lancé ambos lados.',
        meta: 'React Native, Expo, NestJS, Prisma',
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
