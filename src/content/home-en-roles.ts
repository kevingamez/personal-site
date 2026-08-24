import type { HomeRole } from './home'

// The experience timeline rows for the EN locale. Split out of
// home-en.ts, which hit the 300-line cap when Heinsohn was added.
export const enRoles: HomeRole[] = [
  {
    dates: 'Mar 2025, Jul 2026',
    place: 'New York, remote',
    roleHtml: 'Founding engineer <span class="at">@ Enttor</span>',
    logo: '/logos/enttor.png',
    summary:
      'Three products end to end: the ads platform, the Slack agent that runs it, the creative studio.',
    desc: 'It started as the outbound engine, browser agents sourcing prospects and drafting the DMs. It ended somewhere else: Meta and TikTok campaign data normalized onto one metric schema, a rules engine that returns scale, pause or archive with a reason, and a Slack agent media buyers drive in plain language across 165 tools. The last product generated the ads outright, then took them back apart into editable layers on GPU workers.',
    ledger: [
      { label: 'Products shipped', value: 'Three' },
      { label: 'Ad generation', value: '1 hr to under 5 min' },
      { label: 'Agent tools, Meta and TikTok', value: '165' },
      { label: 'Team', value: 'Six' },
    ],
    stackLabel: 'Built with',
    stack: ['TypeScript', 'Next.js', 'Supabase', 'Playwright', 'Claude', 'Modal'],
    backer: {
      label: 'Backed by',
      name: 'MaC Venture Capital',
      href: 'https://macventurecapital.com/',
    },
  },
  {
    dates: 'Feb 2024, Mar 2025',
    place: 'Bogotá',
    roleHtml: 'Product engineer <span class="at">@ Samsam</span>',
    logo: '/logos/samsam.png',
    summary: 'Shipped both sides of an e-commerce marketplace: shopper app and merchant dashboard.',
    desc: 'A React Native and Expo app for shoppers and a Next.js dashboard for merchants, on NestJS services with Prisma and Postgres. I shipped both sides.',
    ledger: [
      { label: 'Shipped', value: 'Both sides of the marketplace' },
      { label: 'Platforms', value: 'iOS, Android, web' },
      { label: 'API response times', value: '10% faster' },
      { label: 'Production alerts', value: 'Routed by severity' },
    ],
    stackLabel: 'Built with',
    stack: ['React Native', 'Expo', 'Next.js', 'NestJS', 'Prisma', 'Postgres'],
    backer: { label: 'Backed by', name: 'Neo', href: 'https://neo.com/' },
  },
  {
    dates: 'Oct 2022, Dec 2023',
    place: 'Bogotá',
    roleHtml: 'Software engineer <span class="at">@ Heinsohn</span>',
    logo: '/logos/heinsohn.png',
    summary: 'HR and payroll software: the deploy pipeline, the reporting, the dashboards.',
    desc: 'Deploys were manual when I arrived. I moved the pipeline to Azure and built the CI/CD that released to every client server on its own. I owned a Python and Flask reporting service running scheduled queries across client databases, and built the Power BI dashboards clients used to track headcount, turnover and payroll cost, replacing reports that had been assembled by hand.',
    ledger: [
      { label: 'Deploys', value: 'Manual to automated' },
      { label: 'Release targets', value: 'Every client server' },
      { label: 'Reporting service', value: 'Scheduled queries' },
      { label: 'Dashboards', value: 'Headcount, turnover, payroll' },
    ],
    stackLabel: 'Built with',
    stack: ['Python', 'Flask', 'Java', 'Spring Boot', 'Azure', 'Power BI'],
  },
  {
    dates: 'Jan 2024, May 2025',
    place: 'Bogotá',
    roleHtml: 'M.Sc. Information Engineering <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    // The previous copy here (satellite imagery, a deep-learning
    // specialization, a TA role) was unsourced and wrong. What replaced it
    // describes the programme itself, taken from the university: the MINE
    // page at sistemas.uniandes.edu.co/es/mine and the course catalogue at
    // uniandes.smartcatalogiq.com/2024/catalogo/cursos/mine. None of it is
    // a claim about how Kevin personally did in it.
    summary: 'Turning data an organization cannot read yet into decisions it can act on.',
    desc: 'The degree is about the whole life of information rather than one model at the end of it. It starts with the data that does not fit a table, semi-structured, geolocated, high-velocity, multimedia, and asks what it is worth to the organization holding it. Then it spends the rest of the time on the unglamorous half: keeping that data governed, secure and good enough that a decision made on top of it holds. Applied data science and machine learning sit beside recommender systems, knowledge engineering, and privacy.',
    ledger: [
      { label: 'Length', value: 'Four semesters' },
      { label: 'Studied', value: 'Part-time, while working' },
      { label: 'Department', value: 'Systems and Computing' },
      { label: 'Field', value: 'Data at scale' },
    ],
    stackLabel: 'Coursework',
    stack: [
      'Applied data science',
      'Big data',
      'Machine learning',
      'Recommender systems',
      'Knowledge engineering',
      'Security and privacy',
    ],
  },
  {
    dates: 'Dec 2022',
    place: 'Bogotá',
    roleHtml:
      'Minors in Mathematics and Management <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    summary: 'Two minors taken inside the degree, one formal, one business.',
    desc: 'Mathematics for the formal side, management for the business side. Both ran alongside the undergraduate degree and closed before graduation.',
    ledger: [
      { label: 'Mathematics', value: 'For the formal side' },
      { label: 'Management', value: 'For the business side' },
      { label: 'Taken', value: 'Alongside the B.Sc.' },
      { label: 'Closed', value: 'Dec 2022, a year early' },
    ],
    stackLabel: 'Areas',
    stack: ['Mathematics', 'Management'],
  },
  {
    dates: 'Jan 2019, Dec 2023',
    place: 'Bogotá',
    roleHtml: 'B.Sc. Systems and Computing <span class="at">@ Universidad de los Andes</span>',
    logo: '/logos/uniandes.svg',
    summary: 'Five years on the foundations: systems, algorithms and applied ML.',
    desc: 'Systems, algorithms and applied ML. Side projects in Python, TypeScript, Java and Swift along the way.',
    ledger: [
      { label: 'Duration', value: '5 years' },
      { label: 'Thesis', value: 'Crops from satellite imagery' },
      { label: 'Accuracy', value: '98.4%' },
      { label: 'F1', value: '0.991' },
    ],
    stackLabel: 'Worked in',
    stack: ['Python', 'TypeScript', 'Java', 'Swift'],
    // Publication titles are not translated, so both locales carry the
    // Spanish original as it appears in the university repository.
    link: {
      label: 'Thesis',
      name: 'Deep Learning en agricultura: conceptos y aplicaciones en la identificación de cultivos sobre imágenes satelitales',
      href: 'https://repositorio.uniandes.edu.co/entities/publication/2cd71d69-7078-4901-87e7-9bc9f2cb62e5',
    },
  },
]
