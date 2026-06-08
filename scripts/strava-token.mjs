#!/usr/bin/env node
// One-time helper to mint a Strava refresh token for /api/strava.
//
// Prerequisite: create an API application at https://www.strava.com/settings/api
// (set "Authorization Callback Domain" to `localhost`). Note the Client ID and
// Client Secret it gives you.
//
// Step 1 - print the authorize URL, open it, click Authorize, then copy the
//          `code` query param from the (broken) localhost redirect you land on:
//
//   STRAVA_CLIENT_ID=12345 node scripts/strava-token.mjs authorize
//
// Step 2 - exchange that code for a long-lived refresh token:
//
//   STRAVA_CLIENT_ID=12345 STRAVA_CLIENT_SECRET=abc... \
//     node scripts/strava-token.mjs exchange <code>
//
// Then add all three to Vercel (Project -> Settings -> Environment Variables):
//   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
//
// Scope note: `activity:read_all` includes private activities. Swap it for
// `read,activity:read` below if you only want public activities surfaced.

const SCOPE = 'read,activity:read_all'
const REDIRECT = 'http://localhost/exchange_token'

function die(msg) {
  console.error(msg)
  process.exit(1)
}

const cmd = process.argv[2]
const clientId = process.env.STRAVA_CLIENT_ID

if (cmd === 'authorize') {
  if (!clientId) die('Set STRAVA_CLIENT_ID first.')
  const url =
    'https://www.strava.com/oauth/authorize?' +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: REDIRECT,
      approval_prompt: 'force',
      scope: SCOPE,
    }).toString()
  console.log('\nOpen this URL, click Authorize, then copy the `code` from the redirect:\n')
  console.log(url + '\n')
} else if (cmd === 'exchange') {
  const code = process.argv[3]
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) die('Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.')
  if (!code) die('Usage: node scripts/strava-token.mjs exchange <code>')
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })
  const data = await res.json()
  if (!res.ok) die(`Strava error ${res.status}: ${JSON.stringify(data)}`)
  console.log('\n✓ Success. Set these in Vercel:\n')
  console.log(`STRAVA_CLIENT_ID=${clientId}`)
  console.log(`STRAVA_CLIENT_SECRET=${clientSecret}`)
  console.log(`STRAVA_REFRESH_TOKEN=${data.refresh_token}\n`)
} else {
  console.log(
    'Usage:\n  node scripts/strava-token.mjs authorize\n  node scripts/strava-token.mjs exchange <code>'
  )
}
