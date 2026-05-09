// Strongly typed strings for the home page (EN + ES share this shape).

export interface HomeStrings {
  meta: {
    htmlLang: 'en' | 'es'
    title: string
    description: string
    canonical: string
    ogUrl: string
    ogTitle: string
    ogDescription: string
    ogLocale: 'en_US' | 'es_CO'
    ogLocaleAlternate: 'en_US' | 'es_CO'
    twitterTitle: string
    twitterDescription: string
    includeJsonLd: boolean
    brandHref: string // "/" or "/es/"
    langSwitchHref: string // sister locale URL
    langSwitchHreflang: 'en' | 'es'
    langSwitchAriaLabel: string
    langSwitchLabelHtml: string // contains <b>EN</b> · ES or EN · <b>ES</b>
    skip: string
  }
  nav: {
    about: string
    skills: string
    experience: string
    work: string
    github: string
    now: string
    devMode: string
    sayHi: string
  }
  hero: {
    hello: string
    titleHtml: string // contains <br/> and <i>
    lede: string // raw HTML allowed (b tags)
    btnSeeWork: string
    btnGetInTouch: string
    available: string
    pauseTitle: string
    resetTitle: string
    stampGlider: string
    stampLwss: string
    stampPulsar: string
    stampGun: string
    stampClear: string
    gen: string
    alive: string
    fps: string
  }
  about: {
    secNum: string
    titleHtml: string
    blurb: string
    p1Html: string
    p2Html: string
    p3Html: string
    qfBased: string
    qfBasedV: string
    qfRole: string
    qfRoleV: string
    qfStack: string
    qfStackV: string
    qfObsessed: string
    qfObsessedV: string
  }
  skills: {
    secNum: string
    titleHtml: string
    blurb: string
    languages: string
    frontend: string
    backend: string
    ai: string
    data: string
    chips: {
      // chip names that differ between locales
      llmPipelines: string
      sqlModeling: string
      etlPipelines: string
    }
  }
  experience: {
    secNum: string
    titleHtml: string
    blurb: string
    e1Year: string
    e1Meta: string
    e1Desc: string
    e2Year: string
    e2Meta: string
    e2Desc: string
    e3Year: string
    e3RoleHtml: string
    e3Meta: string
    e3Desc: string
    e4Year: string
    e4RoleHtml: string
    e4Meta: string
    e4Desc: string
  }
  work: {
    secNum: string
    titleHtml: string
    blurb: string
    p1Featured: string
    p1NameHtml: string
    p1Desc: string
    p1Link: string
    p2Desc: string
    p3Desc: string
    p4Desc: string
    p5Name: string
    p5Desc: string
  }
  github: {
    secNum: string
    titleHtml: string
    blurb: string
    snapshot: string
    publicRepos: string
    publicReposSub: string
    languagesShipped: string
    languagesShippedSub: string
    yearsOnGithub: string
    yearsOnGithubSub: string
    languageMix: string
    acrossPublicRepos: string
    contributionsTitle: string
    last12Months: string
    less: string
    more: string
    months: readonly string[]
    dows: readonly string[]
    statCommits: string
    statCurrent: string
    statLongest: string
    repoSiteDesc: string
    repoSpaceDesc: string
    repoChatDesc: string
    repoBudgetDesc: string
    repoCloudDesc: string
  }
  now: {
    secNum: string
    titleHtml: string
    blurb: string
    buildingK: string
    buildingV: string
    buildingSub: string
    readingK: string
    readingV: string
    readingSub: string
    listeningK: string
    listeningV: string
    listeningSub: string
    thinkingK: string
    thinkingV: string
    thinkingSub: string
  }
  bookshelf: {
    secNum: string
    titleHtml: string
    blurb: string
  }
  console: {
    secNum: string
    titleHtml: string
    blurb: string
    promptLabel: string
    streaming: string
    greeting: string
    placeholder: string
    suggest1: string
    suggest2: string
    suggest3: string
    suggest4: string
    rateLimitMsg: string
    errorMsg: string
  }
  contact: {
    titleHtml: string
    body: string
    btnEmail: string
    btnDev: string
  }
  footer: {
    h4Page: string
    pBlurb: string
    h4Sections: string
    sectionsAbout: string
    sectionsExperience: string
    sectionsWork: string
    sectionsGithub: string
    h4Elsewhere: string
    elsewhereDev: string
    fonts: string
    estab: string
  }
}
