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

export const runtime = 'nodejs'

// The set of paths this endpoint will ever serve, computed once per lambda
// from the same walk the page used. It is an ALLOWLIST, not a filter: a
// request for anything not in it is refused outright, which is what keeps
// `..`, absolute paths, symlink games and dotfile fishing out of the handler
// without having to reason about path normalisation at all.
let allowed: Set<string> | null = null
const allowlist = (): Set<string> => (allowed ??= new Set(listSourcePaths()))

export async function GET(req: Request): Promise<Response> {
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

  return NextResponse.json(
    { path, lang: langOf(path), body: file.body, from: file.from },
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
