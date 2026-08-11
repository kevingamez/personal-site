import type { HomeStrings } from './home'
import { enSections } from './home-en-sections'

export const en: HomeStrings = {
  meta: {
    htmlLang: 'en',
    title: 'Kevin Gámez - Founding Engineer at Enttor',
    description:
      'Kevin Gámez is the founding engineer at Enttor, based in Bogotá. AI outbound, browser automation, OpenAI pipelines, Next.js / NestJS / Postgres.',
    canonical: 'https://kevingamez.co/',
    ogUrl: 'https://kevingamez.co/',
    ogTitle: 'Kevin Gámez - Founding Engineer at Enttor',
    ogDescription:
      'Founding engineer at enttor.ai. AI-powered outbound, browser automation, LLM pipelines.',
    ogLocale: 'en_US',
    ogLocaleAlternate: 'es_CO',
    twitterTitle: 'Kevin Gámez - Founding Engineer at Enttor',
    twitterDescription:
      'Founding engineer at enttor.ai. AI-powered outbound, browser automation, LLM pipelines.',
    includeJsonLd: true,
    brandHref: '/',
    langSwitchHref: '/es/',
    langSwitchHreflang: 'es',
    langSwitchAriaLabel: 'Cambiar a español',
    langSwitchLabelHtml: '<b>EN</b> · ES',
    skip: 'Skip to content',
    hreflang: [
      { lang: 'en', href: 'https://kevingamez.co/' },
      { lang: 'es', href: 'https://kevingamez.co/es/' },
      { lang: 'x-default', href: 'https://kevingamez.co/' },
    ],
  },
  nav: {
    about: 'About',
    stack: 'Stack',
    experience: 'Experience',
    work: 'Work',
    github: 'GitHub',
    resume: 'Résumé',
    devMode: 'Dev mode',
    sayHi: 'Email me ↗',
  },
  hero: {
    metaRole: 'Founding engineer @ Enttor',
    metaPlace: 'Bogotá',
    titleHtml: 'Hello',
    lede: "I'm the founding engineer at <b>Enttor</b>, where we build AI outbound: browser automation and OpenAI\n            pipelines that find and qualify prospects. Before that, I shipped an e-commerce marketplace at\n            <b>Samsam</b>. M.Sc. in deep learning from Universidad de los Andes.",
    stat1Num: '02',
    stat1Label: 'Startups as founding engineer',
    stat2Num: '07',
    stat2Label: 'Years on GitHub',
    portraitAlt: 'Kevin Gámez in front of Royce Hall, UCLA',
    scrollDown: 'Scroll down',
    btnGetInTouch: 'Get in touch',
    pauseTitle: 'pause/play',
    resetTitle: 'random reseed',
    stampGlider: 'glider',
    stampLwss: 'spaceship',
    stampPulsar: 'pulsar',
    stampGun: 'gosper gun',
    stampClear: 'clear',
    gen: 'gen',
    alive: 'alive',
    fps: 'fps',
    golCaptionHtml:
      '<b>Conway\'s Game of Life</b> · a zero-player cellular automaton. Each cell lives, dies, or is born from the count of its 8 neighbors (B3/S23). Click to seed a stamp. <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank" rel="noopener">read more →</a>',
    golAriaLabel: "Conway's Game of Life simulation",
  },
  about: {
    secNum: 'About',
    titleHtml: 'About me.',
    blurb: 'Founding engineer, full-stack, deep-learning grad.',
    p1Html:
      "I'm a software engineer from Bogotá. At <b>Enttor</b> I built the AI outbound engine from the ground up: the\n              browser automation that finds prospects on Instagram and LinkedIn, the OpenAI pipelines that qualify them,\n              the Next.js dashboards where it all lives, and the NestJS APIs and Inngest queues holding it together.",
    p2Html:
      'Before Enttor I was founding engineer at <b>Samsam</b>, an e-commerce marketplace with a React Native app for\n              shoppers, a Next.js dashboard for merchants, all on Prisma and Postgres. Earlier work spanned analytics\n              (SQL pipelines and Power BI dashboards for HR, risk, and operations) and deep learning on satellite\n              imagery to spot croplands and flag environmental risk.',
    p3Html:
      'B.Sc. in Systems and Computing and M.Sc. in Information Engineering, both from <b>Universidad de los Andes</b\n              >, with a deep-learning specialization and a minor in management.',
    qfBased: 'Based',
    qfBasedV: 'Bogotá, Colombia',
    qfRole: 'Role',
    qfRoleV: 'Founding engineer @ enttor.ai',
    qfStack: 'Stack of choice',
    qfStackV: 'TypeScript · Next.js · Postgres',
    qfObsessed: 'Tinkering with',
    qfObsessedV: 'Browser automation &amp; LLM pipelines',
  },
  stack: {
    secNum: 'Stack',
    titleHtml: 'The tools I ship with.',
    blurb: "The stack behind Enttor's outbound engine and this site.",
    cols: [
      { name: 'Languages', items: ['TypeScript', 'Python', 'SQL', 'Swift'] },
      { name: 'Frameworks', items: ['Next.js', 'React Native', 'NestJS', 'Astro'] },
      { name: 'Infrastructure', items: ['Postgres', 'Supabase', 'Vercel', 'Inngest'] },
      {
        name: 'AI & ML',
        items: ['OpenAI pipelines', 'Browser automation', 'Deep learning', 'Satellite imagery'],
      },
    ],
  },
  experience: {
    secNum: 'Trajectory',
    titleHtml: "Two startups and a master's.",
    blurb:
      "Founding engineer at Samsam, then at Enttor. The master's in deep learning ran in parallel with the first job.",
    e1Year: 'Jun 2025 · Jul 2026',
    e1Meta: 'New York · remote · AI outbound',
    e1Desc:
      'I built the system that finds prospects on Instagram and LinkedIn and qualifies them with AI. Full-stack:\n                Next.js dashboards, NestJS APIs, Inngest queues, all running on Vercel and Supabase.',
    e2Year: 'Feb 2024 · Mar 2025',
    e2Meta: 'Bogotá · e-commerce platform',
    e2Desc:
      'Shipped both sides of a marketplace: a React Native app for shoppers and a Next.js dashboard for merchants,\n                on Prisma and Postgres.',
    e3Year: 'Jan 2024 · May 2025',
    e3RoleHtml: 'M.Sc. Information Engineering <span class="at">@ Universidad de los Andes</span>',
    e3Meta: 'Deep-learning specialization · graduate TA',
    e3Desc:
      'Trained deep-learning models on satellite imagery to spot croplands and flag environmental risk. Graduate\n                TA in parallel.',
    e4Year: 'Jan 2019 · Dec 2023',
    e4RoleHtml: 'B.Sc. Systems and Computing <span class="at">@ Universidad de los Andes</span>',
    e4Meta: 'Minor in management',
    e4Desc:
      'Five years on the foundations: systems, algorithms, applied ML, plus a minor in management. Side\n                projects in Python, TypeScript, Java, and Swift along the way.',
    achievementsTitle: 'Honors &amp; certifications',
    achievementsBlurb: 'A national distinction and two AWS certifications.',
    achievements: [
      {
        year: '2018',
        titleHtml: 'Andrés Bello <i>National Distinction</i>',
        meta: 'Ministry of Education · Colombia',
        desc: 'Awarded for ranking in the top tier of the country’s national high-school exit exam (Saber 11). One of Colombia’s top student honors.',
      },
      {
        year: '2022',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certification · Amazon Web Services',
        desc: 'Building, deploying, and scaling cloud-native apps on AWS: IAM, Lambda, DynamoDB, S3, the rest of the toolbox.',
      },
      {
        year: '2021',
        titleHtml: 'AWS Academy <i>Cloud Foundations</i>',
        meta: 'Certification · Amazon Web Services',
        desc: 'AWS fundamentals: core services, security, architecture, and pricing.',
      },
    ],
  },
  work: {
    secNum: 'Selected work',
    titleHtml: "Things I've built.",
    blurb: "What I've built at work and on the side.",
    p1Featured: '01 / Featured',
    p1NameHtml: 'enttor.ai · <i>AI outbound.</i>',
    p1ImageAlt:
      'Kevin Gámez workstation with the Enttor site open on a laptop and code on a monitor',
    p1Desc:
      'The system finds prospects on Instagram and LinkedIn and qualifies them with OpenAI pipelines. I built the browser automation, the dashboards, and the backend.',
    p1Link: 'Visit Enttor →',
    p2Name: 'this site',
    p2Desc: "The page you're on. Open-source, built with Astro and TypeScript.",
    p3Name: 'dev mode',
    p3Desc: 'A VS Code-style easter egg hiding at /dev: explorer, tabs, terminal.',
    p4Name: 'claude console',
    p4Desc:
      'The shell at the bottom of this page. Streams Claude replies through a Vercel function.',
    allRepos: 'All repositories',
  },
  deck: {
    secNum: 'Pick a card',
    titleHtml: 'The parts a CV leaves out.',
    blurb: 'Five cards. Everything on them is true.',
    hint: 'Pick a card',
    items: [
      {
        label: 'How I work',
        statement: 'Speak simply.',
        bodyHtml:
          'From a post I wrote on LinkedIn: you can be a great engineer and still be poor. Not because you can\'t code. Because you can\'t speak simply. The full post is in <a href="#writing">Writing</a>.',
      },
      {
        label: 'Currently',
        statement: 'AI outbound at Enttor.',
        bodyHtml:
          'Browser automation that finds prospects on Instagram and LinkedIn, and OpenAI pipelines that qualify them. Next.js, NestJS, Inngest, Supabase.',
      },
      {
        label: 'Side quests',
        statement: 'This site is one.',
        bodyHtml:
          'Open source, built with Astro and TypeScript. It hides a VS Code-style <a href="/dev/">dev mode</a> and runs a working <a href="#console">Claude console</a>.',
      },
      {
        label: 'Ask me about',
        statement: 'Automation, pipelines, satellites.',
        bodyHtml:
          "Browser automation at scale, LLM qualification pipelines, or the deep-learning models I trained on satellite imagery during the master's.",
      },
      {
        label: 'Off the clock',
        statement: 'Running and riding around Bogotá.',
        bodyHtml:
          'The <a href="#strava">Strava section</a> below is live: distance, hours, and the longest effort of each type, pulled from the API.',
      },
    ],
  },
  ...enSections,
}
