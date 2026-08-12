import type { ResumeStrings } from './resume'

export const resumeEn: ResumeStrings = {
  kicker: 'Résumé',
  name: 'Kevin Gámez',
  contactLocation: 'Bogotá, Colombia',
  summary:
    'Founding engineer, most recently at a MaC Venture Capital-backed startup (2025-2026). End-to-end owner of product and platform. Relentless execution, exacting attention to detail, concise communication. Open to what comes next.',
  download: 'Download resume ↓',
  downloadFileName: 'Kevin-Gamez-Resume.pdf',
  headings: {
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
  },
  experience: [
    {
      role: 'Founding Engineer',
      at: 'Enttor',
      dates: 'Jun 2025 – Jul 2026',
      meta: 'Bogotá, COL',
      bullets: [
        'Owned the entire engineering function on a six-person team; architected, developed, and maintained the platform behind $160K+ in 2026 revenue.',
        'Operated an AI-native development process: defined specs, directed LLM code generation, and gated every release through review and QA; sustained 3-day build-test-ship cycles with weekly client feedback sessions.',
        'Engineered an AI ad-creation platform with Figma-style layer editing (OCR, image segmentation, 30-ad batch generation); rebuilt the pipeline on GPUs, cutting generation time from 11 minutes to under 2, over 5x faster.',
        'Automated candidate and prospect sourcing: built browser agents screening profiles by university, employer, and founder background, plus a Slack-native AI agent managing ad operations across Meta, TikTok, and Google Ads.',
      ],
    },
    {
      role: 'Product Engineer',
      at: 'Samsam',
      dates: 'Feb 2024 – Mar 2025',
      meta: 'Bogotá, COL',
      bullets: [
        'Developed and deployed features across multiple platforms, including shopper and merchant applications.',
        'Designed and implemented scalable front-end and back-end solutions using TypeScript, React Native, Next.js, Prisma, and PostgreSQL.',
        'Refactored core backend services, improving performance, reliability, and maintainability of the e-commerce platform.',
      ],
    },
  ],
  education: [
    {
      role: 'M.Sc. Information Engineering',
      at: 'Universidad de los Andes',
      dates: 'May 2025',
      meta: 'Bogotá, COL',
      bullets: [
        'Relevant coursework: big data, recommender systems, business analytics, deep learning, cloud development.',
      ],
    },
    {
      role: 'B.Sc. Systems and Computer Engineering',
      at: 'Universidad de los Andes',
      dates: 'Dec 2023',
      meta: 'Bogotá, COL',
      bullets: [
        'Relevant coursework: systems programming, data structures and algorithms, business analytics, web development, mobile development.',
      ],
    },
    {
      role: 'Minors in Mathematics and Management',
      at: 'Universidad de los Andes',
      dates: 'Dec 2022, Dec 2023',
      meta: 'Bogotá, COL',
      bullets: [],
    },
  ],
  skills: [
    {
      term: 'AI',
      desc: 'LLM agents, prompt engineering, OpenAI/Anthropic APIs, OCR, image segmentation, PyTorch.',
    },
    {
      term: 'Engineering',
      desc: 'TypeScript, Next.js, NestJS, React Native, Python, Postgres, ETL, AWS.',
    },
  ],
  back: '← back to kevingamez.co',
  jsonLdLang: 'en',
  jsonLdName: 'Résumé, Kevin Gámez',
  breadcrumbLabel: 'Résumé',
  pageUrl: 'https://kevingamez.co/resume/',
}
