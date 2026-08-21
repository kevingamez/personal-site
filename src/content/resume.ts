// Shape for the résumé pages. Two locales render the same markup through
// ResumeArticle, so every string a reader sees lives here rather than in the
// page component.
//
// Content mirrors public/docs/Kevin-Gamez-CV.pdf, which is the source of
// truth - keep all three in sync.

export interface ResumeEntry {
  role: string
  // Projects have no employer and no location, so both are optional and the
  // entry drops the ", at" clause and the meta line when they are absent.
  at?: string
  dates: string
  meta?: string
  bullets: string[]
}

export interface ResumeSkill {
  term: string
  desc: string
}

export interface ResumeStrings {
  // Page-level copy.
  kicker: string
  name: string
  contactLocation: string
  summary: string
  download: string
  downloadFileName: string
  headings: {
    experience: string
    education: string
    projects: string
    skills: string
  }
  experience: ResumeEntry[]
  education: ResumeEntry[]
  projects: ResumeEntry[]
  skills: ResumeSkill[]
  back: string
  // Used by the JSON-LD graph, which reuses the #kevin @id from the home page
  // so crawlers merge both locales into one entity.
  jsonLdLang: 'en' | 'es'
  jsonLdName: string
  breadcrumbLabel: string
  pageUrl: string
}
