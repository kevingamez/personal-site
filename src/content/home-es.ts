import type { HomeStrings } from './home'

export const es: HomeStrings = {
  meta: {
    htmlLang: 'es',
    title: 'Kevin Gámez · software, matemáticas, mundos pequeños',
    description:
      'Kevin Gámez es founding engineer en Enttor, basado en Bogotá. Outbound con IA, automatización de navegador, pipelines de OpenAI, Next.js / NestJS / Postgres.',
    canonical: 'https://kevingamez.com/es/',
    ogUrl: 'https://kevingamez.com/es/',
    ogTitle: 'Kevin Gámez · software, matemáticas, mundos pequeños',
    ogDescription:
      'Founding engineer en enttor.ai. Outbound con IA, automatización de navegador, pipelines de LLM.',
    ogLocale: 'es_CO',
    ogLocaleAlternate: 'en_US',
    twitterTitle: 'Kevin Gámez · software, matemáticas, mundos pequeños',
    twitterDescription:
      'Founding engineer en enttor.ai. Outbound con IA, automatización de navegador, pipelines de LLM.',
    includeJsonLd: false,
    brandHref: '/es/',
    langSwitchHref: '/',
    langSwitchHreflang: 'en',
    langSwitchAriaLabel: 'Switch to English',
    langSwitchLabelHtml: 'EN · <b>ES</b>',
    skip: 'Saltar al contenido',
  },
  nav: {
    about: 'Sobre mí',
    skills: 'Stack',
    experience: 'Experiencia',
    work: 'Proyectos',
    github: 'GitHub',
    now: 'Ahora',
    devMode: 'Modo dev',
    sayHi: 'Saludar →',
  },
  hero: {
    hello: 'Hola, soy Kevin',
    titleHtml: 'Construyo software<br />que <i>se compone.</i>',
    lede: 'Soy founding engineer en <b>Enttor</b>, donde usamos IA y automatización de navegador para que el outbound\n            de marketing realmente funcione. Antes lancé una plataforma de e-commerce en <b>Samsam</b>. Maestría en\n            deep learning en la Universidad de los Andes.',
    btnSeeWork: 'Ver proyectos →',
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
      '<b>Juego de la vida de Conway</b> · un autómata celular de cero jugadores. Cada celda vive, muere o nace según el número de sus 8 vecinas (B3/S23). Reglas simples, patrones sorprendentes. Click para sembrar un patrón. <a href="https://es.wikipedia.org/wiki/Juego_de_la_vida" target="_blank" rel="noopener">más info →</a>',
  },
  about: {
    secNum: '§01 · Sobre mí',
    titleHtml: 'Ingeniero primero, nerd de matemáticas <i>de cerca</i>.',
    blurb:
      'Founding engineer, full-stack, recién egresado de deep learning. La corta abajo; la larga, con café.',
    p1Html:
      'Soy ingeniero de software, de Bogotá. En <b>Enttor</b> construí el motor de outbound con IA desde cero — la\n              automatización de navegador que encuentra prospectos en Instagram y LinkedIn, los pipelines de OpenAI que\n              los califican, los dashboards en Next.js donde todo vive, y las APIs en NestJS y colas de Inngest que lo\n              sostienen.',
    p2Html:
      'Antes de Enttor fui founding engineer en <b>Samsam</b>, un marketplace de e-commerce — una app de React\n              Native para compradores, un panel en Next.js para comerciantes, todo sobre Prisma y Postgres. Trabajos\n              anteriores cruzaron analítica (pipelines SQL y dashboards en Power BI para HR, riesgo y operaciones) y\n              deep learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental.',
    p3Html:
      'B.Sc. en Ingeniería de Sistemas y Computación y M.Sc. en Ingeniería de Información, ambas en la\n              <b>Universidad de los Andes</b>, con especialización en deep learning y un minor en Management. El Juego\n              de la vida de la derecha está vivo desde 1970; yo solo le puse marco.',
    qfBased: 'Ubicación',
    qfBasedV: 'Bogotá, Colombia',
    qfRole: 'Rol',
    qfRoleV: 'Founding engineer @ enttor.ai',
    qfStack: 'Stack favorito',
    qfStackV: 'TypeScript · Next.js · Postgres',
    qfObsessed: 'Obsesión actual',
    qfObsessedV: 'Browser automation &amp; pipelines de LLM',
  },
  skills: {
    secNum: '§02 · Herramientas',
    titleHtml: 'El kit, y a qué <i>de verdad</i> recurro.',
    blurb:
      'Todo lo que he usado en producción. Los chips coral son los que escogería hoy si pudiera.',
    languages: 'Lenguajes',
    frontend: 'Frontend',
    backend: 'Backend e infra',
    ai: 'IA / ML',
    data: 'Datos y analítica',
    chips: {
      llmPipelines: 'Pipelines de LLM',
      sqlModeling: 'Modelado SQL',
      etlPipelines: 'Pipelines ETL',
    },
  },
  experience: {
    secNum: '§03 · Trayectoria',
    titleHtml: 'Una historia corta y casi <i>lineal</i>.',
    blurb:
      'Dos turnos como founding engineer, una maestría en deep learning, y los años en Uniandes que me enseñaron a\n            hacer shipping.',
    e1Year: 'Jun 2025 · hoy',
    e1Meta: 'New York · remoto · outbound con IA',
    e1Desc:
      'Construí el sistema que encuentra los prospectos correctos en Instagram y LinkedIn, los califica con IA y\n                arranca conversaciones reales — a escala. Full-stack: dashboards en Next.js, APIs en NestJS, colas en\n                Inngest, todo sobre Vercel y Supabase.',
    e2Year: 'Feb 2024 · Mar 2025',
    e2Meta: 'Bogotá · plataforma de e-commerce',
    e2Desc:
      'Lancé los dos lados del marketplace: una app en React Native para compradores y un panel en Next.js para\n                comerciantes. Bajé los tiempos de respuesta del backend un 10% y construí un sistema de alertas que\n                hizo visibles los errores críticos un 70% más rápido.',
    e3Year: 'Ene 2024 · May 2025',
    e3RoleHtml:
      'M.Sc. Ingeniería de Información <span class="at">@ Universidad de los Andes</span>',
    e3Meta: 'Especialización en deep learning · TA de posgrado',
    e3Desc:
      'Entrené modelos de deep learning sobre imágenes satelitales para detectar cultivos y riesgo ambiental. En\n                paralelo trabajé como teaching assistant de posgrado — diseñé labs, abrí horarios de consulta y ayudé a\n                pregrados a sacar sus primeros modelos.',
    e4Year: 'Ene 2019 · Dic 2023',
    e4RoleHtml:
      'B.Sc. Ingeniería de Sistemas y Computación <span class="at">@ Universidad de los Andes</span>',
    e4Meta: 'Minor en Management',
    e4Desc:
      'Cinco años en los fundamentos: sistemas, algoritmos, ML aplicado y un minor en Management. Side projects\n                en Python, TypeScript, Java y Swift en el camino.',
    achievementsTitle: 'Honores y certificaciones',
    achievementsBlurb: 'Algunos sellos en el camino.',
    achievements: [
      {
        year: '2018',
        titleHtml: 'Distinción <i>Andrés Bello</i>',
        meta: 'Ministerio de Educación · Colombia · categoría nacional',
        desc: 'Otorgada por estar entre los mejores puntajes del examen Saber 11 a nivel nacional. Uno de los reconocimientos estudiantiles más altos del país.',
      },
      {
        year: '2022',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certificación · Amazon Web Services',
        desc: 'Construir, desplegar y escalar apps cloud-native en AWS — IAM, Lambda, DynamoDB, S3 y el resto del kit.',
      },
      {
        year: '2021',
        titleHtml: 'AWS Academy <i>Cloud Foundations</i>',
        meta: 'Certificación · Amazon Web Services',
        desc: 'Fundamentos de AWS: servicios, seguridad, arquitectura y el modelo de billing que decide cuáles de esos terminas usando.',
      },
    ],
  },
  work: {
    secNum: '§04 · Proyectos seleccionados',
    titleHtml: 'Cosas que he construido y <i>aún defiendo.</i>',
    blurb:
      'Un puñado entre muchos. Cada uno me enseñó una lección distinta; las lecciones se componen, los proyectos se\n          componen.',
    p1Featured: '01 / DESTACADO',
    p1NameHtml: 'enttor.ai · <i>creativos para marketers, a escala.</i>',
    p1Desc:
      'Pipelines que toman un brief de marca, generan cientos de variantes de creativos publicitarios, los\n                puntúan con evals basadas en LLM (estética + ajuste de marca) y despliegan los sobrevivientes. De la\n                primera línea de código a miles de MAU; el pipeline de evals corre ~120k juicios al día.',
    p1Link: 'Leer el caso →',
    p2Desc:
      "Un sandbox de autómatas celulares en WebAssembly: Conway, Wireworld, Brian's Brain, Lenia. En tiempo real\n              sobre un millón de celdas, todo en el navegador. El hero de esta página usa una implementación hermana.",
    p3Desc:
      'Un atlas interactivo de fractales de tiempo de escape · Mandelbrot, Burning Ship, Julia, Newton · con zoom\n              profundo, esquemas de color y URLs compartibles. Un proyecto de fin de semana que se comió tres fines de\n              semana.',
    p4Desc:
      'Recorridos de teoría de números como cuadernos Jupyter en vivo: espiral de Ulam, parejas de Goldbach, la\n              escalera de Riemann. Lo usan algunos profesores de matemáticas que admiro.',
    p5Name: 'este sitio',
    p5Desc:
      'La página en la que estás. Open-source, construida poco a poco, y un lugar para poner matemáticas que me\n              parecen bellas al lado de software del que estoy orgulloso.',
  },
  github: {
    secNum: '§05 · Open source',
    titleHtml: 'Código que dejo <i>a la vista.</i>',
    blurb:
      'Los números, los lenguajes y los repos. El gráfico de contribuciones es decorativo; el resto es real.',
    snapshot: 'github.com/kevingamez · snapshot en vivo',
    publicRepos: 'repos públicos',
    publicReposSub: 'universidad, side projects, ships del trabajo',
    languagesShipped: 'lenguajes embarcados',
    languagesShippedSub: 'TypeScript va primero · Python segundo',
    yearsOnGithub: 'años en github',
    yearsOnGithubSub: 'desde abril de 2019',
    languageMix: 'mezcla de lenguajes',
    acrossPublicRepos: 'repos públicos',
    contributionsTitle: 'Contribuciones · @kevingamez',
    last12Months: 'últimos 12 meses',
    less: 'Menos',
    more: 'Más',
    months: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
    dows: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    statCommits: 'Commits · 12m',
    statCurrent: 'Racha actual',
    statLongest: 'Racha más larga',
    repoSiteDesc: 'Esta página, con código fuente.',
    repoSpaceDesc: 'Detección aérea de eventos de deforestación en la Amazonía.',
    repoChatDesc: 'Experimento de chat en TypeScript.',
    repoBudgetDesc: 'App de finanzas personales en Swift.',
    repoCloudDesc: 'Despliegues de servicios containerizados en Cloud Run.',
  },
  now: {
    secNum: '§06 · Ahora',
    titleHtml: 'Qué tengo en el escritorio <i>esta semana.</i>',
    blurb:
      'Una foto en vivo. Se actualiza cuando algo cambia; normalmente cada lunes en la mañana.',
    buildingK: 'Construyendo',
    buildingV: '<i>Eval-as-a-service</i>',
    buildingSub:
      'Una API para que otros equipos enchufen las evals de marca de enttor en sus propios pipelines.',
    readingK: 'Leyendo',
    readingV: "A Mathematician's Apology",
    readingSub: 'Hardy. Delgado, hermoso, ligeramente desgarrador. Lo releo cada diciembre.',
    listeningK: 'Escuchando',
    listeningV: '<i>Caribou</i>',
    listeningSub: '"Honey" en loop. Sirve para shippear a las 2am.',
    thinkingK: 'Pensando en',
    thinkingV: 'Invariantes de nudos',
    thinkingSub:
      'Específicamente el polinomio de Jones. Sin aplicaciones aún, pero no me deja dormir.',
  },
  bookshelf: {
    secNum: '§07 · Estantería',
    titleHtml: 'Cuatro libros que <i>cambiaron cómo trabajo.</i>',
    blurb: 'No son el canon. Son los que sigo recomendando.',
  },
  console: {
    secNum: '§08 · Consola',
    titleHtml: 'Una shell real. <i>Y una IA, si la llamas.</i>',
    blurb:
      'Escribe un comando — <span class="ac">help</span>, <span class="ac">whoami</span>, <span class="ac">experience</span>… ¿Quieres conversar? <span class="ac">kevin "tu pregunta"</span> abre la IA.',
    promptLabel: 'kevin@gamez · ~',
    streaming: 'listo',
    greeting:
      'bienvenido · escribe <span class="ac">help</span> para ver comandos · o <span class="ac">kevin "tu pregunta"</span> para chatear con la IA.',
    placeholder: 'escribe un comando, enter para enviar…',
    suggest1: 'help',
    suggest2: 'whoami',
    suggest3: 'experience',
    suggest4: 'kevin ¿qué hace enttor?',
    rateLimitMsg: 'demasiadas peticiones · intenta en un minuto.',
    errorMsg: 'algo falló. intenta de nuevo o recarga.',
  },
  contact: {
    titleHtml: '¿Quieres construir algo que <i>se componga</i>?',
    body: 'Tomo un par de proyectos de consultoría al año, más alguna colaboración ocasional. Si algo aquí te resonó, el\n          inbox está abierto.',
    btnEmail: 'kevingamez.kg@gmail.com →',
    btnDev: 'Abrir modo dev',
  },
  footer: {
    h4Page: 'La página',
    pBlurb:
      'Founding engineer, recién graduado de deep learning y estudiante entusiasta · aunque mediocre · de\n              matemáticas. Hecho a mano en Bogotá.',
    h4Sections: 'Secciones',
    sectionsAbout: 'Sobre mí',
    sectionsExperience: 'Experiencia',
    sectionsWork: 'Proyectos',
    sectionsGithub: 'Open source',
    h4Elsewhere: 'En otros lados',
    elsewhereDev: 'Modo dev →',
    fonts: 'Tipografías Instrument Serif e Inter Tight',
    estab: 'EST. 2026 · BOGOTÁ · 04°35′N',
  },
}
