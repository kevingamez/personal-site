import type { ResumeStrings } from './resume'

export const resumeEn: ResumeStrings = {
  kicker: 'Résumé',
  name: 'Kevin Gámez',
  contactLocation: 'Bogotá, Colombia',
  summary:
    'Founding engineer, most recently at Enttor, backed by MaC Venture Capital (2025-2026). Owned engineering on a six-person team, across the ad platform, the Slack agent that runs it and the AI studio behind the creative. Looking for the next thing.',
  download: 'Download resume ↓',
  downloadFileName: 'Kevin-Gamez-Resume.pdf',
  headings: {
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Skills and interests',
  },
  experience: [
    {
      role: 'Founding Engineer',
      at: 'Enttor',
      dates: 'Mar 2025 – Jul 2026',
      meta: 'New York, NY (remote), backed by MaC Venture Capital',
      bullets: [
        'Owned engineering on a six-person team across several pivots. Built and ran the platform behind $160K+ in revenue over the first seven months of 2026.',
        'Built a multi-tenant ad platform that puts Meta and TikTok campaign data on one metric schema. A Slack agent drives it, narrowing 165 tools to a per-message shortlist by keyword match with embedding retrieval as fallback.',
        'Built an AI ad generator that takes a brand URL and returns finished creatives, then made those creatives editable again as layers using docTR, SAM 3, and LaMa inpainting. Moving rendering to GPUs took generation from an hour to under 5 minutes.',
        'Put every external API behind a circuit breaker with jittered retry and traced each request end to end with OpenTelemetry.',
        'Automated outreach and candidate sourcing with Playwright browser agents on Instagram, LinkedIn, and X. Per-platform pacing kept accounts usable for weeks rather than hours.',
      ],
    },
    {
      role: 'Product Engineer',
      at: 'Samsam',
      dates: 'Feb 2024 – Mar 2025',
      meta: 'Bogotá, Colombia, backed by Neo',
      bullets: [
        'Built a mobile app in React Native and Expo and a web app in Next.js for shoppers and merchants, on TypeScript services with NestJS and Prisma.',
        'Refactored core services reducing response times by 10% through improved Prisma queries and logic restructuring.',
        'Built the alerting system that classified production errors by severity and routed each one to an accountable owner, using Sentry and Vercel monitoring.',
      ],
    },
    {
      role: 'Software Engineer',
      at: 'Heinsohn Human Global Solutions',
      dates: 'Oct 2022 – Dec 2023',
      meta: 'Bogotá, Colombia',
      bullets: [
        'Replaced manual deploys by moving the pipeline to Azure and building the CI/CD that released to every client server automatically.',
        'Owned a Python/Flask reporting service running scheduled queries across client databases.',
        'Built the Power BI dashboards clients used to track HR and payroll metrics, replacing reports assembled by hand.',
      ],
    },
  ],
  education: [
    {
      role: 'M.Sc. Information Engineering',
      at: 'Universidad de los Andes',
      dates: 'Jan 2024 – May 2025',
      meta: 'Bogotá, Colombia',
      bullets: [],
    },
    {
      role: 'B.Sc. Systems and Computer Engineering',
      at: 'Universidad de los Andes',
      dates: 'Jan 2019 – Dec 2023',
      meta: 'Bogotá, Colombia',
      bullets: ['Minors in Mathematics and Management (Dec 2022).'],
    },
  ],
  projects: [
    {
      role: 'Deep Learning for Crop Segmentation on Satellite Imagery',
      dates: 'Dec 2023',
      bullets: [
        'Trained DeepLab V3+ in PyTorch, benchmarking MobileNet V3 against ResNet50 backbones, to segment oil palm plantations from Sentinel-1 SAR and Sentinel-2 red-band composites.',
        'Reached 98.4% accuracy and 0.991 F1 on 10x10 km tiles, against 96% for a conventional machine learning baseline. Published at repositorio.uniandes.edu.co.',
      ],
    },
  ],
  skills: [
    {
      term: 'Languages',
      desc: 'TypeScript, JavaScript, Python, SQL, Java.',
    },
    {
      term: 'AI and ML',
      desc: 'LLM agents and tool use, RAG with pgvector, Anthropic and OpenAI APIs, MCP servers, PyTorch.',
    },
    {
      term: 'Web and infrastructure',
      desc: 'Next.js, React Native, NestJS, tRPC, Prisma, PostgreSQL, Redis, AWS, Docker, CI/CD.',
    },
    {
      term: 'Interests',
      desc: 'Long-distance running and cycling.',
    },
  ],
  back: '← back to kevingamez.co',
  jsonLdLang: 'en',
  jsonLdName: 'Résumé, Kevin Gámez',
  breadcrumbLabel: 'Résumé',
  pageUrl: 'https://kevingamez.co/resume/',
}
