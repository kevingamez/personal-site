// Strongly typed strings for the home page (EN + ES share this shape).
//
// SECURITY INVARIANT - fields suffixed `*Html` (e.g. `titleHtml`, `p1Html`,
// `lede`, `golCaptionHtml`) are rendered with React's `dangerouslySetInnerHTML`
// because they contain trusted markup like <i>, <b>, <span>, <a>. These
// strings MUST be authored statically in `home-en.ts` / `home-es.ts` and
// never sourced from user input, the runtime API, or any other untrusted
// channel. If you ever need dynamic HTML here, sanitize with a library
// like DOMPurify before assigning. Plain-text fields (no `Html` suffix)
// are safe for arbitrary content.

// One row of the experience timeline: a job or a degree. Lives in its own type
// because the rows are large enough to need their own file per locale
// (home-{en,es}-roles.ts), which keeps the content files under the 300-line cap.
export interface HomeRole {
  dates: string
  place: string
  roleHtml: string
  logo: string // path under /public/logos, decorative (the row names the place)
  summary: string // the one line the row shows while it is closed
  desc: string
  ledger: { label: string; value: string }[]
  stackLabel: string
  stack: string[]
  // Optional labelled outbound link under the stack, for a supporting
  // document: the thesis a degree produced.
  link?: { label: string; name: string; href: string }
  // The investor that backed a company. Rendered large beside the company
  // mark rather than under the stack, so it reads as part of the company
  // and not as one more entry in the tech list.
  backer?: { label: string; name: string; href: string }
}

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
    // og:type. Only the two home pages are profile cards; utility pages like
    // /privacy are plain websites and must not emit the profile:* trio.
    ogType?: 'profile' | 'website'
    twitterTitle: string
    twitterDescription: string
    includeJsonLd: boolean
    brandHref: string // "/" or "/es/"
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
    deck: string
    github: string
    strava: string
    writing: string
    console: string
    resume: string
    sayHi: string
  }
  hero: {
    metaPlace: string // location label (live clock appended in the component)
    weatherLabels: string // JSON map of condition key -> localized label
    titleHtml: string // contains <br/> and <i>
    lede: string // raw HTML allowed (b tags)
    // Two credentials, not metrics. This slot held oversized numerals twice
    // ("02 startups", then "3 products") and both times the number was too
    // small to carry 56px type or too soft to defend. Third-party facts do the
    // work a fake statistic was doing.
    creds: { k: string; v: string }[]
    scrollDown: string
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
    openHint: string // affordance line, revealed only once the rows are clickable
    roles: HomeRole[]
    achievementsTitle: string
    achievementsBlurb: string
    achievements: { year: string; logo: string; titleHtml: string; meta: string; desc: string }[]
  }
  work: {
    secNum: string
    titleHtml: string
    blurb: string
    p1NameHtml: string
    p1ImageAlt: string
    p1Desc: string
    // Same shape as each project's `meta` below: the featured card renders it
    // with the same `.wc-meta` rule, so the whole section reads as one list.
    p1Meta: string
    // Everything else, newest first. `href` is optional: most of the Enttor
    // work lives in private repos that a visitor cannot open.
    projects: {
      name: string
      desc: string
      meta: string
      href?: string
    }[]
    allRepos: string
  }
  deck: {
    secNum: string
    momentsLabel: string
    momentsFull: string
    momentsClose: string
    titleHtml: string
    blurb: string
    hint: string
    // `bodyHtml` follows the *Html invariant above: static, trusted markup only.
  }
  // Chart-only labels. The heading, blurb, and eyebrow live on `github`: the
  // curve and the repo list share one section.
  yearRun: {
    statContributions: string
    statStreak: string
    statProjects: string
    chartAlt: string
    tipContributions: string
    tipWeekOf: string
    tipNothing: string
    noteStreak: string
    noteWeek: string
    noteAtOnce: string
    noteBegins: string
  }
  github: {
    secNum: string
    titleHtml: string
    blurb: string
    publicRepos: string
    languageMix: string
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
    btnShare: string
    // Sticky mobile action bar + the share control. `shareCopied` and
    // `shareFailed` are the clipboard-fallback toasts for browsers with no
    // navigator.share (desktop Firefox, most Linux browsers).
    ctaLabel: string
    ctaEmail: string
    shareAria: string
    shareCopied: string
    shareFailed: string
    shareText: string
  }
  footer: {
    pBlurb: string
    h4Sections: string
    sectionsAbout: string
    sectionsExperience: string
    sectionsWork: string
    sectionsGithub: string
    h4Elsewhere: string
    elsewhereDev: string
    elsewherePrivacy: string
    estab: string
    credits: string // colophon link to /humans.txt, where the logo licenses live
  }
}
