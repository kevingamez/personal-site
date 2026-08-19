// Next.js Route Handler - /api/repo?path=<relative path>
//
// Serves one source file to dev mode's editor. The explorer ships only the
// tree of paths, so this is what fills a tab when a file is opened, and it is
// what makes the viewer follow the repository instead of the build that
// happened to produce the page.
//
// Reads are delegated to readSourceFile: GitHub at the deployed commit first,
// the deployment's own filesystem second.

import { NextResponse } from 'next/server'
import { listSourcePaths, langOf, readSourceFile } from '@/data/repo-source'
import { limitRoute } from '@/lib/api-rate-limit'

export const runtime = 'nodejs'

// The set of paths this endpoint will ever serve, computed once per lambda
// from the same walk the page used. It is an ALLOWLIST, not a filter: a
// request for anything not in it is refused outright, which is what keeps
// `..`, absolute paths, symlink games and dotfile fishing out of the handler
// without having to reason about path normalisation at all.
let allowed: Set<string> | null = null
const allowlist = (): Set<string> => (allowed ??= new Set(listSourcePaths()))

// Every allowed path is a tracked source file, and the project caps those at
// 300 lines, so nothing legitimate comes close to this. It is a backstop for a
// file that grows unexpectedly (a generated .json, a long .md), not a policy:
// truncating keeps the viewer usable where a 413 would blank the tab.
const MAX_BODY_BYTES = 512 * 1024

export async function GET(req: Request): Promise<Response> {
  // Bounds GitHub API spend. The allowlist holds up to 400 paths, so rotating
  // `path` defeats the CDN's s-maxage and each miss costs one upstream call.
  const limited = await limitRoute(req, 'repo', { limit: 120, window: '10 m' })
  if (limited) return limited

  const path = new URL(req.url).searchParams.get('path')

  if (!path) {
    return NextResponse.json(
      { paths: [...allowlist()] },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300' } }
    )
  }

  if (!allowlist().has(path)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const file = await readSourceFile(path)
  if (!file) return NextResponse.json({ error: 'unreadable' }, { status: 502 })

  const bytes = new TextEncoder().encode(file.body)
  const truncated = bytes.byteLength > MAX_BODY_BYTES
  const body = truncated
    ? new TextDecoder().decode(bytes.slice(0, MAX_BODY_BYTES)) + '\n\n/* truncated */\n'
    : file.body

  return NextResponse.json(
    { path, lang: langOf(path), body, from: file.from, truncated },
    {
      headers: {
        // The URL behind this is pinned to a commit, so the body for a given
        // path cannot change within a deployment. An hour at the edge, and the
        // browser re-asks on a hard reload.
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
