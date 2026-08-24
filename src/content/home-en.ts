import type { HomeStrings } from './home'
import { enSections } from './home-en-sections'
import { enRoles } from './home-en-roles'

export const en: HomeStrings = {
  meta: {
    htmlLang: 'en',
    title: 'Kevin Gámez - Founding Engineer in Bogotá',
    description:
      'Kevin Gámez is a founding engineer in Bogotá, Colombia, looking for the next thing. Browser automation, LLM pipelines, TypeScript, Next.js, NestJS, Postgres.',
    canonical: 'https://kevingamez.co/',
    ogUrl: 'https://kevingamez.co/',
    ogTitle: 'Kevin Gámez - Founding Engineer in Bogotá',
    ogDescription:
      'Founding engineer in Bogotá, looking for the next thing. Browser automation, LLM pipelines, full-stack TypeScript.',
    ogLocale: 'en_US',
    ogLocaleAlternate: 'es_CO',
    twitterTitle: 'Kevin Gámez - Founding Engineer in Bogotá',
    twitterDescription:
      'Founding engineer in Bogotá, looking for the next thing. Browser automation, LLM pipelines, full-stack TypeScript.',
    includeJsonLd: true,
    brandHref: '/',
    skip: 'Skip to content',
    hreflang: [
      { lang: 'en', href: 'https://kevingamez.co/' },
      { lang: 'es', href: 'https://kevingamez.co/es/' },
      { lang: 'x-default', href: 'https://kevingamez.co/' },
    ],
  },
  nav: {
    about: 'About',
    experience: 'Experience',
    work: 'Work',
    deck: 'Off the CV',
    github: 'GitHub',
    strava: 'In motion',
    writing: 'Writing',
    console: 'Ask me',
    resume: 'Résumé',
    sayHi: 'Email me ↗',
  },
  hero: {
    metaPlace: 'Bogotá, Colombia',
    weatherLabels:
      '{"clear": "clear", "partly cloudy": "partly cloudy", "cloudy": "cloudy", "fog": "fog", "drizzle": "drizzle", "rain": "rain", "showers": "showers", "snow": "snow", "storm": "storm"}',
    titleHtml: 'Hello',
    lede: "I'm a founding engineer in Bogotá, looking for the next thing. I ran engineering at <b>Enttor</b>, where\n            I built the paid ads platform on Meta and TikTok and the Slack agent that runs it. Before that I worked\n            on an e-commerce marketplace at <b>Samsam</b>. I have a master's from Universidad de los Andes.",
    creds: [
      { k: 'Most recently', v: 'Founding engineer at Enttor' },
      { k: 'Studied at', v: 'Universidad de los Andes' },
    ],
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
      '<b>Conway\'s Game of Life</b>, a zero-player cellular automaton. Each cell lives, dies, or is born from the count of its 8 neighbors (B3/S23). Click to seed a stamp. <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank" rel="noopener">read more →</a>',
    golAriaLabel: "Conway's Game of Life simulation",
  },
  about: {
    secNum: 'About',
    titleHtml: 'About me.',
    blurb: "Full-stack founding engineer with a master's in information engineering.",
    p1Html:
      'I end up on the parts nobody demos. Retries, session handling, the pipeline that notices it was\n              wrong and runs itself again. Most of what I have shipped is a machine doing boring work at\n              three in the morning.',
    p2Html:
      'Before the startups I spent a while in analytics, writing SQL pipelines and Power BI dashboards\n              for HR, risk and operations, and then on deep learning over satellite imagery, spotting\n              croplands and flagging environmental risk.',
    p3Html:
      'B.Sc. in Systems and Computing and M.Sc. in Information Engineering, both from <b>Universidad de los Andes</b\n              >, with minors in mathematics and management.',
    qfBased: 'Based',
    qfBasedV: 'Bogotá, Colombia',
    qfRole: 'Role',
    qfRoleV: 'Founding engineer, looking for the next thing',
    qfStack: 'Stack of choice',
    qfStackV: 'TypeScript, Next.js, Postgres',
    qfObsessed: 'Tinkering with',
    qfObsessedV: 'Browser automation and LLM pipelines',
  },
  experience: {
    secNum: 'Experience',
    titleHtml: 'The jobs, and the school around them.',
    blurb:
      "Product engineer at Samsam, then founding engineer at Enttor. I did the master's while working the first job.",
    openHint: 'Click a row to open it',
    roles: enRoles,
    achievementsTitle: 'Honors &amp; certifications',
    achievementsBlurb: 'A national distinction and two AWS certifications.',
    achievements: [
      {
        year: '2018',
        logo: '/logos/mineducacion.svg',
        titleHtml: 'Andrés Bello <i>National Distinction</i>',
        meta: 'Ministry of Education, Colombia',
        desc: 'Awarded by the Ministry of Education for a top-ranked score on Colombia’s national high-school exit exam (Saber 11).',
      },
      {
        year: '2022',
        logo: '/logos/aws.svg',
        titleHtml: 'AWS Academy <i>Cloud Developing</i>',
        meta: 'Certification, Amazon Web Services',
        desc: 'Building, deploying, and scaling apps on AWS: IAM, Lambda, DynamoDB, S3.',
      },
      {
        year: '2021',
        logo: '/logos/aws.svg',
        titleHtml: 'AWS Academy <i>Cloud Foundations</i>',
        meta: 'Certification, Amazon Web Services',
        desc: 'AWS fundamentals: core services, security, architecture, and pricing.',
      },
    ],
  },
  work: {
    secNum: 'Selected work',
    titleHtml: "Things I've built.",
    blurb: 'Product, infrastructure, and a few things on the side.',
    p1NameHtml: 'AI Ad Studio, <i>ads that build themselves.</i>',
    p1ImageAlt:
      'Kevin Gámez workstation with the Enttor site open on a laptop and code on a monitor',
    p1Desc:
      "Enttor's last product. Give it a brand's website and it scrapes the logos, colors and fonts, writes ad concepts with Claude, renders the images, then checks its own work with a vision pass. The harder half runs backwards: OCR and segmentation take a finished ad apart into editable layers, matching every line of text against 311 font families, so a media buyer edits on a canvas instead of rebuilding from scratch. Both vision workers run on GPUs.",
    p1Meta: 'Next.js, Python, PyTorch, Modal, Supabase',
    projects: [
      {
        name: 'Slack Agent',
        desc: 'A Slack bot media buyers talk to like a coworker. 165 tools across the Meta and TikTok ad APIs. Accuracy falls off long before 165 tools fit in context, so a router narrows every message to a shortlist before Claude sees it.',
        meta: 'Claude tool use, Meta and TikTok APIs, pgvector',
      },
      {
        name: 'Enttor Platform',
        desc: 'Two years in one repo. It sourced prospects from Instagram and LinkedIn, wrote personalized DMs and tracked every reply in one inbox, then in 2026 was refocused on paid ads: Meta and TikTok insights on one metric schema, scored against per-client thresholds. Row level security isolates every company from the rest, so a handler that forgets its filter returns nothing.',
        meta: 'Next.js, Supabase, Postgres RLS',
      },
      {
        name: 'MakeMotionGraphics',
        desc: 'Text to looping motion graphics. Claude writes a self-contained HTML scene, screenshots it in headless Chrome at three timestamps to read back its own output, then patches what is wrong. Only a scene that clears the composition gate gets recorded to MP4.',
        meta: 'Agentic loop, Puppeteer, ffmpeg',
      },
      {
        name: 'LinkedIn Editor',
        desc: 'A chat-first editor for LinkedIn posts. You paste a draft and argue with Claude about the hook until it lands, grounded by cosine search over a corpus of posts that actually performed. Three variations stream in parallel, one per hook angle.',
        meta: 'pgvector RAG, Next.js',
      },
      {
        name: 'Browser Automation Infrastructure',
        desc: 'The backend behind the outreach: Node services on a Mac Mini that keep authenticated browser sessions alive on four platforms, with Redis queues pacing outreach in minutes rather than milliseconds. Two teammates led it, I contributed the Instagram pipeline and session handling.',
        meta: 'Playwright, Redis, Postgres',
      },
      {
        name: 'Samsam',
        desc: 'Before Enttor. A shopping marketplace: a React Native and Expo app for shoppers and a Next.js dashboard for merchants, on NestJS services with Prisma and Postgres. I shipped both sides.',
        meta: 'React Native, Expo, NestJS, Prisma',
      },
    ],
    allRepos: 'All repositories',
  },
  deck: {
    momentsLabel: 'Moments',
    momentsFull: 'Fullscreen',
    momentsClose: 'Click or Esc to let it go',
    secNum: 'The deck',
    titleHtml: 'The parts a CV leaves out.',
    blurb: 'Nine photographs from the last few years.',
    hint: 'Pick a card',
  },
  ...enSections,
}
