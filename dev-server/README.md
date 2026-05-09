# dev-server

Ephemeral code-server playground for the `/dev` page of [kevingamez.com](https://kevingamez.com).

A visitor opens [code.kevingamez.com](https://code.kevingamez.com) (or whatever subdomain you pick) and gets a real VS Code editor in the browser, pre-loaded with a fresh clone of this repo. They can edit, run terminal commands, install extensions — but nothing persists. When the container restarts the workspace is wiped and re-cloned from `main`.

## What's in here

- `Dockerfile` — extends [`codercom/code-server`](https://hub.docker.com/r/codercom/code-server), installs git, pre-installs a handful of OpenVSX extensions (Astro, Prettier, ESLint, Material Icons).
- `entrypoint.sh` — wipes the workspace, fresh-clones the repo, launches code-server with `--auth none` on `$PORT`.
- `railway.json` — Railway build config (Dockerfile builder).
- `.dockerignore` — keep the build context lean.

No persistent volume is used on purpose — this is an "ephemeral playground". Visitors can edit and break things; nothing leaks back into the real repo.

## Deploy on Railway

```bash
# 1. Login + create a new project from this directory
cd dev-server
railway login
railway init                    # pick "Empty Project", give it a name

# 2. Deploy
railway up                      # builds the Dockerfile, deploys

# 3. Generate a public domain
railway domain                  # gives you a *.up.railway.app URL

# 4. (Optional) Custom domain
#    a. In Railway dashboard → Settings → Networking → Custom Domain
#    b. Add: code.kevingamez.com
#    c. Add the suggested CNAME at your DNS provider (Cloudflare etc)
#    d. Once verified, the app is live at https://code.kevingamez.com
```

### Environment variables

All optional — defaults work for this repo.

| Variable | Default | Description |
|----------|--------------------|--------------------------------------------------|
| `REPO_URL` | this repo's HTTPS URL | Repo to clone on startup. |
| `REPO_BRANCH` | `main` | Branch to clone. |
| `PORT` | injected by Railway | Bind address port. |

## Local test (optional)

```bash
docker build -t kg-dev-server .
docker run --rm -p 8080:8080 kg-dev-server
# open http://localhost:8080
```

## Notes

- **No auth.** Anyone with the URL can edit. Edits are scoped to the running container; restart wipes everything. Don't extend this with persistent volumes unless you also add password auth.
- **OpenVSX marketplace.** Microsoft's VS Code marketplace isn't redistributable to non-MS clients — code-server uses [open-vsx.org](https://open-vsx.org) by default, which has most popular extensions.
- **Sleep behavior.** Railway auto-sleeps the service after inactivity on the free tier; the next visitor wakes it (~3-5s cold start). To keep it always-on, upgrade or set `RAILWAY_REPLICAS=1` with a paid plan.
- **Cost.** Free $5/month credit covers a small always-on instance; an auto-sleeping one easily fits in the free tier.

## Linking from `/dev`

The portfolio's `/dev` page reads `import.meta.env.PUBLIC_CODE_SERVER_URL` at build time and renders an "Open in VS Code editor →" button pointing there. To wire it up, set `PUBLIC_CODE_SERVER_URL` in your Vercel project's env vars (e.g. `https://code.kevingamez.com`) and redeploy.

If the env var is unset, the button falls back to a placeholder URL and a tooltip noting the editor isn't deployed yet.
