// Origin allowlist for /api/chat: which browser origins may call the endpoint.

// ───────── Origin allowlist ─────────

const ALLOWED_ORIGINS = new Set(['https://kevingamez.co', 'https://www.kevingamez.co'])

// `next dev` serves :3000, `pnpm preview` serves :4321. Never accepted on a
// deployment: there a "localhost" origin is some other program on a visitor's
// machine driving the endpoint through their browser.
const LOCAL_ORIGINS = new Set(
  process.env.VERCEL
    ? []
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4321',
        'http://127.0.0.1:4321',
      ]
)

// Vercel injects the canonical production + branch hostnames at run time; trust
// those exactly. Other preview deploys of this project are matched by project
// name AND team scope: `personal-site-…` alone would also match anyone else's
// Vercel project that happens to start with the same name.
const VERCEL_ORIGINS = new Set(
  [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
    .filter((h): h is string => Boolean(h))
    .map((h) => `https://${h}`)
)

const PREVIEW_ORIGIN_RE =
  /^https:\/\/personal-site-[a-z0-9-]+-kevin-gamezs-projects-f712bd5c\.vercel\.app$/

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin) || LOCAL_ORIGINS.has(origin)) return true
  if (VERCEL_ORIGINS.has(origin)) return true
  return PREVIEW_ORIGIN_RE.test(origin)
}
