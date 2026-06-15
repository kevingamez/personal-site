// Strongly typed strings for the home page (EN + ES share this shape).
//
// SECURITY INVARIANT - fields suffixed `*Html` (e.g. `titleHtml`, `p1Html`,
// `lede`, `golCaptionHtml`) are rendered with Astro's `set:html` directive
// because they contain trusted markup like <i>, <b>, <span>, <a>. These
// strings MUST be authored statically in `home-en.ts` / `home-es.ts` and
// never sourced from user input, the runtime API, or any other untrusted
// channel. If you ever need dynamic HTML here, sanitize with a library
// like DOMPurify before assigning. Plain-text fields (no `Html` suffix)
// are safe for arbitrary content.

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
    // hreflang alternates for this page. Bilingual home pages list en/es/
    // x-default; single-language pages (e.g. privacy) pass an empty array so
    // they don't falsely advertise a translation.
    hreflang: { lang: string; href: string }[]
  }
  nav: {
    about: string
    experience: string
    work: string
    github: string
    devMode: string
    sayHi: string
  }
  hero: {
    metaRole: string // quiet status line, left of the live dot
    metaPlace: string // location label (live clock appended in the component)
    titleHtml: string // contains <br/> and <i>
    lede: string // raw HTML allowed (b tags)
    btnSeeWork: string
    btnGetInTouch: string
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
    golCaptionHtml: string
    golAriaLabel: string // plain-text accessible name for the <canvas> simulation
  }
  about: {
    secNum: string
    titleHtml: string
    blurb: string
    portraitAlt: string
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
    achievementsTitle: string
    achievementsBlurb: string
    achievements: { year: string; titleHtml: string; meta: string; desc: string }[]
  }
  work: {
    secNum: string
    titleHtml: string
    blurb: string
    p1Featured: string
    p1NameHtml: string
    p1ImageAlt: string
    p1Desc: string
    p1Link: string
    p2Name: string
    p2Desc: string
    p3Name: string
    p3Desc: string
    p4Name: string
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
    languagesShippedSub: string // fallback caption when fewer than 2 languages
    langLeads: string // connector, e.g. "leads" / "va primero"
    langSecond: string // connector, e.g. "is second" / "segundo"
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
    repoFallbackDesc: string // shown when a repo has no curated or API description
  }
  strava: {
    secNum: string
    titleHtml: string
    blurb: string
    statKm: string
    statMi: string
    statHours: string
    statElevation: string
    statElevationFt: string
    statActivities: string
    weeklyTitle: string
    weeklyPeakLabel: string
    featuredLabel: string
    featDist: string
    featElev: string
    featTime: string
    featSpeed: string
    featPace: string
    insightClimbLabel: string
    insightFastLabel: string
    insightBiggestLabel: string
    insightClimbedLabel: string
    climbedCompare: string
    weekOf: string
    heatmapTitle: string
    heatLess: string
    heatMore: string
    recentTitle: string
    viewOnStrava: string
    profileUrl: string
    // Localized Strava sport_type labels; the client falls back to the raw
    // sport_type for anything not listed here.
    sports: {
      Run: string
      TrailRun: string
      VirtualRun: string
      Ride: string
      VirtualRide: string
      GravelRide: string
      MountainBikeRide: string
      Swim: string
      Walk: string
      Hike: string
      Workout: string
      WeightTraining: string
      Yoga: string
    }
  }
  writing: {
    secNum: string
    titleHtml: string
    blurb: string
    reactionsLabel: string
    commentsLabel: string
    repostsLabel: string
    readOn: string
    seeMore: string
    seeLess: string
    more: string
  }
  wanderings: {
    secNum: string
    titleHtml: string
    blurb: string
    countries: string
    cities: string
    since: string
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
