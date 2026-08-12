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
    stack: 'Stack',
    experience: 'Experiencia',
    work: 'Proyectos',
    github: 'GitHub',
    resume: 'CV',
    devMode: 'Modo dev',
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
      'Soy ingeniero de software, de Bogotá. En <b>Enttor</b> construí el sistema de outbound con IA desde cero. La\n              automatización de navegador encontraba prospectos en Instagram y LinkedIn y los pipelines de OpenAI los\n              calificaban. Todo corría sobre dashboards en Next.js, APIs en NestJS y colas de Inngest.',
    p2Html:
      'Antes de Enttor fui founding engineer en <b>Samsam</b>, un marketplace de e-commerce con una app de React\n              Native para compradores, un panel en Next.js para comerciantes, todo sobre Prisma y Postgres. Antes de eso\n              trabajé en analítica: pipelines SQL y dashboards en Power BI para HR, riesgo y operaciones. Y en deep\n              learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental.',
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
  stack: {
    secNum: 'Stack',
    titleHtml: 'Las herramientas con las que construyo.',
    blurb: 'Con esto construí el outbound de Enttor y este sitio.',
    cols: [
      { name: 'Lenguajes', items: ['TypeScript', 'Python', 'SQL', 'Swift'] },
      { name: 'Frameworks', items: ['Next.js', 'React Native', 'NestJS', 'Astro'] },
      { name: 'Infraestructura', items: ['Postgres', 'Supabase', 'Vercel', 'Inngest'] },
      {
        name: 'IA & ML',
        items: [
          'Pipelines de OpenAI',
          'Automatización de navegador',
          'Deep learning',
          'Imágenes satelitales',
        ],
      },
    ],
  },
  experience: {
    secNum: 'Experiencia',
    titleHtml: 'Dos startups y una maestría.',
    blurb:
      'Ingeniero fundador en Samsam y luego en Enttor. Hice la maestría en deep learning mientras trabajaba en el primer empleo.',
    e1Year: 'Jun 2025, Jul 2026',
    e1Meta: 'New York, remoto, outbound con IA',
    e1Desc:
      'Construí el motor de outbound de punta a punta: automatización de navegador que buscaba prospectos en Instagram y LinkedIn, pipelines de OpenAI que los filtraban y redactaban los mensajes, y las campañas que los enviaban a escala. Dashboards en Next.js, APIs en NestJS y colas en Inngest sobre Vercel y Supabase, desde cero.',
    e2Year: 'Feb 2024, Mar 2025',
    e2Meta: 'Bogotá, plataforma de e-commerce',
    e2Desc:
      'Lancé los dos lados del marketplace: una app en React Native para compradores y un panel en Next.js para\n                comerciantes, sobre Prisma y Postgres.',
    e3Year: 'Ene 2024, May 2025',
    e3RoleHtml:
      'M.Sc. Ingeniería de Información <span class="at">@ Universidad de los Andes</span>',
    e3Meta: 'Especialización en deep learning, TA de posgrado',
    e3Desc:
      'Entrené modelos de deep learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental. En\n                paralelo, teaching assistant de posgrado.',
    e4Year: 'Ene 2019, Dic 2023',
    e4RoleHtml:
      'B.Sc. Ingeniería de Sistemas y Computación <span class="at">@ Universidad de los Andes</span>',
    e4Meta: 'Minor en Management',
    e4Desc:
      'Cinco años en los fundamentos: sistemas, algoritmos y ML aplicado. Además, proyectos propios en Python,\n                TypeScript, Java y Swift.',
    achievementsTitle: 'Honores y certificaciones',
    achievementsBlurb: 'Una distinción nacional y dos certificaciones de AWS.',
    achievements: [
      {
        year: '2018',
        titleHtml: 'Distinción <i>Andrés Bello</i>',
        meta: 'Ministerio de Educación, Colombia, categoría nacional',
        desc: 'Otorgada por el Ministerio de Educación por estar entre los mejores puntajes del examen Saber 11 del país.',
      },
      {
        year: '2022',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certificación, Amazon Web Services',
        desc: 'Construir, desplegar y escalar apps en AWS: IAM, Lambda, DynamoDB y S3.',
      },
      {
        year: '2021',
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
        desc: 'El mismo producto con una segunda puerta: un bot de Slack con el que los media buyers hablan como con un colega. 165 herramientas sobre las APIs de anuncios de Meta y TikTok, así que lanza campañas, diagnostica fatiga de creativos y mueve presupuesto, no solo responde preguntas. Lanzar un anuncio toma tres pasos en vez de los treinta clics que pide Ads Manager, y los creativos se importan en lote desde una carpeta de Drive.',
        meta: 'Claude tool use, APIs de Meta y TikTok, Postgres',
      },
      {
        name: 'Plataforma Enttor',
        desc: 'Dos años del producto de GTM: sacaba prospectos de la interacción en Instagram y LinkedIn, escribía DMs personalizados con IA, respondía solo por webhooks de Meta y lo dejaba todo en un inbox único. 132 rutas de API sobre cuatro esquemas de Postgres.',
        meta: 'Next.js, Supabase, Inngest',
      },
      {
        name: 'MakeMotionGraphics',
        desc: 'De texto a motion graphics en loop. Claude escribe una escena HTML autocontenida, la captura en Chrome headless para ver su propio resultado, la corrige y solo entonces la cierra. Un pipeline paralelo de frames graba todo a MP4.',
        meta: 'Loop agéntico, Puppeteer, ffmpeg',
      },
      {
        name: 'LinkedIn Editor',
        desc: 'Un editor conversacional para posts de LinkedIn. Pegas un borrador y discutes con Claude sobre el hook hasta que funciona, apoyado en recuperación sobre un corpus de posts que sí rindieron.',
        meta: 'RAG con pgvector, Next.js',
      },
      {
        name: 'Infraestructura de Automatización',
        desc: 'El backend self-hosted detrás del outreach: servicios Node en un Mac Mini en Bogotá que mantienen sesiones reales en cuatro plataformas, leen interacción y mandan mensajes a ritmo humano. Contribuí; dos compañeros lo lideraron.',
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
    secNum: 'Las cartas',
    titleHtml: 'Lo que un CV no cuenta.',
    blurb: 'Cinco cartas. Todo lo que dicen es verdad.',
    hint: 'Elige una carta',
    items: [
      {
        label: 'Cómo trabajo',
        statement: 'Habla simple.',
        bodyHtml:
          'De un post que escribí en LinkedIn: puedes ser un gran ingeniero y aun así ser pobre. No porque no sepas programar. Porque no sabes hablar simple. El post completo está en <a href="#writing">Escritos</a>.',
      },
      {
        label: 'Ahora mismo',
        statement: 'Buscando lo que sigue.',
        bodyHtml:
          'Estuve como founding engineer en Enttor hasta julio de 2026. Abierto a roles de founding engineer y full-stack senior. La vía más rápida es el <a href="#contact">correo</a>.',
      },
      {
        label: 'En paralelo',
        statement: 'Este sitio es uno.',
        bodyHtml:
          'Open source, construido con Next.js y TypeScript. Esconde un <a href="/dev/">modo dev</a> estilo VS Code y corre una <a href="#console">consola de Claude</a> de verdad.',
      },
      {
        label: 'Pregúntame por',
        statement: 'Automatización, pipelines, satélites.',
        bodyHtml:
          'Automatización de navegador, pipelines de LLM que califican prospectos, o los modelos de deep learning que entrené sobre imágenes satelitales en la maestría.',
      },
      {
        label: 'Fuera del teclado',
        statement: 'Correr y montar bici por Bogotá.',
        bodyHtml:
          'La <a href="#strava">sección de Strava</a> más abajo es en vivo: distancia, horas y mi salida más larga de cada tipo, directo de la API.',
      },
    ],
  },
  ...esSections,
}
