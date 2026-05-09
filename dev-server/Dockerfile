# Ephemeral code-server playground — clones the repo on each startup,
# launches code-server with --auth none. No persistent volume, no real save:
# every container restart wipes edits.
#
# Built for Railway (auto-detects Dockerfile). PORT is provided by Railway at
# runtime — code-server binds to 0.0.0.0:$PORT.

FROM codercom/code-server:latest

# code-server runs as the `coder` user. We need root briefly to install git +
# clone, then drop back.
USER root

# git is needed to clone the repo on each cold start
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Workspace lives in /home/coder/workspace and is fresh on every container start
ENV WORKSPACE=/home/coder/workspace
RUN mkdir -p ${WORKSPACE} && chown -R coder:coder /home/coder

# Repository to surface in the editor — overridable at deploy time
ENV REPO_URL=https://github.com/kevingamez/personal-site.git
ENV REPO_BRANCH=main

# Pre-install a few useful VS Code extensions from the OpenVSX marketplace
# (Microsoft marketplace is licensed for VS Code only, not redistributable
# servers — code-server uses OpenVSX by default which is fine for these.)
USER coder
RUN code-server \
    --install-extension astro-build.astro-vscode \
    --install-extension esbenp.prettier-vscode \
    --install-extension dbaeumer.vscode-eslint \
    --install-extension pkief.material-icon-theme \
    || true

# Entry script clones the repo fresh, then hands off to code-server
USER root
COPY --chown=coder:coder entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER coder
WORKDIR ${WORKSPACE}

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
