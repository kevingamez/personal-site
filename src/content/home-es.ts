import type { HomeStrings } from './home'
import { esSections } from './home-es-sections'

export const es: HomeStrings = {
  meta: {
    htmlLang: 'es',
    title: 'Kevin Gámez - Founding Engineer en Enttor',
    description:
      'Kevin Gámez es founding engineer en Enttor y vive en Bogotá. Construye automatización de navegador y pipelines de OpenAI que encuentran y califican prospectos, con Next.js, NestJS y Postgres.',
    canonical: 'https://kevingamez.co/es/',
    ogUrl: 'https://kevingamez.co/es/',
    ogTitle: 'Kevin Gámez - Founding Engineer en Enttor',
    ogDescription:
      'Founding engineer en enttor.ai. Outbound con IA, automatización de navegador, pipelines de LLM.',
    ogLocale: 'es_CO',
    ogLocaleAlternate: 'en_US',
    twitterTitle: 'Kevin Gámez - Founding Engineer en Enttor',
    twitterDescription:
      'Founding engineer en enttor.ai. Outbound con IA, automatización de navegador, pipelines de LLM.',
    includeJsonLd: true,
    brandHref: '/es/',
    langSwitchHref: '/',
    langSwitchHreflang: 'en',
    langSwitchAriaLabel: 'Switch to English',
    langSwitchLabelHtml: 'EN · <b>ES</b>',
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
    metaRole: 'Founding engineer @ Enttor',
    metaPlace: 'Bogotá',
    titleHtml: 'Hola',
    lede: 'Soy founding engineer en <b>Enttor</b>, donde construimos outbound con IA: automatización de navegador y\n            pipelines de OpenAI que encuentran y califican prospectos. Antes lancé un marketplace de e-commerce en\n            <b>Samsam</b>. Maestría en deep learning en la Universidad de los Andes.',
    stat1Num: '02',
    stat1Label: 'Startups como founding engineer',
    stat2Num: '07',
    stat2Label: 'Años en GitHub',
    portraitAlt: 'Kevin Gámez frente a Royce Hall, UCLA',
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
      '<b>Juego de la vida de Conway</b> · un autómata celular de cero jugadores. Cada celda vive, muere o nace según el número de sus 8 vecinas (B3/S23). Click para sembrar un patrón. <a href="https://es.wikipedia.org/wiki/Juego_de_la_vida" target="_blank" rel="noopener">más info →</a>',
    golAriaLabel: 'Simulación del Juego de la vida de Conway',
  },
  about: {
    secNum: 'Sobre mí',
    titleHtml: 'Sobre mí.',
    blurb: 'Founding engineer full-stack, con maestría en deep learning.',
    p1Html:
      'Soy ingeniero de software, de Bogotá. En <b>Enttor</b> construí el sistema de outbound con IA desde cero. La\n              automatización de navegador encuentra prospectos en Instagram y LinkedIn y los pipelines de OpenAI los\n              califican. Todo corre sobre dashboards en Next.js, APIs en NestJS y colas de Inngest.',
    p2Html:
      'Antes de Enttor fui founding engineer en <b>Samsam</b>, un marketplace de e-commerce con una app de React\n              Native para compradores, un panel en Next.js para comerciantes, todo sobre Prisma y Postgres. Antes de eso\n              trabajé en analítica: pipelines SQL y dashboards en Power BI para HR, riesgo y operaciones. Y en deep\n              learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental.',
    p3Html:
      'B.Sc. en Ingeniería de Sistemas y Computación y M.Sc. en Ingeniería de Información, ambas en la\n              <b>Universidad de los Andes</b>, con especialización en deep learning y un minor en Management.',
    qfBased: 'Ubicación',
    qfBasedV: 'Bogotá, Colombia',
    qfRole: 'Rol',
    qfRoleV: 'Founding engineer @ enttor.ai',
    qfStack: 'Stack favorito',
    qfStackV: 'TypeScript · Next.js · Postgres',
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
    e1Year: 'Jun 2025 · Jul 2026',
    e1Meta: 'New York · remoto · outbound con IA',
    e1Desc:
      'Construí el sistema que encuentra prospectos en Instagram y LinkedIn y los califica con IA. Full-stack:\n                dashboards en Next.js, APIs en NestJS, colas en Inngest, todo sobre Vercel y Supabase.',
    e2Year: 'Feb 2024 · Mar 2025',
    e2Meta: 'Bogotá · plataforma de e-commerce',
    e2Desc:
      'Lancé los dos lados del marketplace: una app en React Native para compradores y un panel en Next.js para\n                comerciantes, sobre Prisma y Postgres.',
    e3Year: 'Ene 2024 · May 2025',
    e3RoleHtml:
      'M.Sc. Ingeniería de Información <span class="at">@ Universidad de los Andes</span>',
    e3Meta: 'Especialización en deep learning · TA de posgrado',
    e3Desc:
      'Entrené modelos de deep learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental. En\n                paralelo, teaching assistant de posgrado.',
    e4Year: 'Ene 2019 · Dic 2023',
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
        meta: 'Ministerio de Educación · Colombia · categoría nacional',
        desc: 'Otorgada por el Ministerio de Educación por estar entre los mejores puntajes del examen Saber 11 del país.',
      },
      {
        year: '2022',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certificación · Amazon Web Services',
        desc: 'Construir, desplegar y escalar apps en AWS: IAM, Lambda, DynamoDB y S3.',
      },
      {
        year: '2021',
        titleHtml: 'AWS Academy <i>Cloud Foundations</i>',
        meta: 'Certificación · Amazon Web Services',
        desc: 'Fundamentos de AWS: servicios, seguridad, arquitectura y facturación.',
      },
    ],
  },
  work: {
    secNum: 'Proyectos',
    titleHtml: 'Cosas que he construido.',
    blurb: 'Uno del trabajo, tres por mi cuenta.',
    p1Featured: '01 / Destacado',
    p1NameHtml: 'enttor.ai · <i>outbound con IA.</i>',
    p1ImageAlt:
      'Estación de trabajo de Kevin Gámez con el sitio de Enttor abierto en un portátil y código en un monitor',
    p1Desc:
      'El sistema encuentra prospectos en Instagram y LinkedIn y los califica con pipelines de OpenAI. Construí la automatización de navegador, los dashboards y el backend.',
    p1Link: 'Ver Enttor →',
    p2Name: 'este sitio',
    p2Desc: 'La página en la que estás. Open-source, construida con Astro y TypeScript.',
    p3Name: 'modo dev',
    p3Desc: 'Un easter egg estilo VS Code escondido en /dev: explorador, pestañas, terminal.',
    p4Name: 'consola claude',
    p4Desc:
      'La shell al final de esta página. Transmite respuestas de Claude a través de una función de Vercel.',
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
        statement: 'Outbound con IA en Enttor.',
        bodyHtml:
          'Automatización de navegador que encuentra prospectos en Instagram y LinkedIn, y pipelines de OpenAI que los califican. Next.js, NestJS, Inngest, Supabase.',
      },
      {
        label: 'En paralelo',
        statement: 'Este sitio es uno.',
        bodyHtml:
          'Open source, construido con Astro y TypeScript. Esconde un <a href="/dev/">modo dev</a> estilo VS Code y corre una <a href="#console">consola de Claude</a> de verdad.',
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
