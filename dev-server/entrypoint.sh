#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${WORKSPACE:-/home/coder/workspace}"
REPO_URL="${REPO_URL:-https://github.com/kevingamez/personal-site.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
# Railway/Render/Fly inject PORT; default to 8080 for local docker run
PORT="${PORT:-8080}"

cd "$WORKSPACE"

# Wipe any leftover state (no persistent volume → ephemeral playground)
echo "[entrypoint] cleaning workspace…"
find . -mindepth 1 -delete 2>/dev/null || true

echo "[entrypoint] cloning ${REPO_URL} (branch: ${REPO_BRANCH})…"
git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" .

# Make the editor open the repo root by default and pick a sensible entry file
DEFAULT_FILE="README.md"
if [ -f "src/pages/index.astro" ]; then
  DEFAULT_FILE="src/pages/index.astro"
fi

echo "[entrypoint] launching code-server on 0.0.0.0:${PORT} (no auth)…"
exec code-server \
  --bind-addr "0.0.0.0:${PORT}" \
  --auth none \
  --disable-telemetry \
  --disable-update-check \
  --disable-workspace-trust \
  "$WORKSPACE" \
  "$WORKSPACE/$DEFAULT_FILE"
