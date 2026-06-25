# syntax=docker/dockerfile:1

# ─── Build stage: produce the static Storybook ──────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# The whole project is copied before installing because the root `prepare`
# lifecycle script runs `tsup`, which needs the source tree to be present
# (and the stories import straight from ./src, not the built dist).
COPY . .

# Reproducible install. Runs dependency post-install scripts (esbuild needs
# its platform binary for Vite) and the project's `prepare`/tsup build.
RUN npm ci

# Outputs the static site to /app/storybook-static
RUN npm run build-storybook

# ─── Serve stage: nginx serving the static files ────────────────────────
FROM nginx:1.27-alpine AS serve

COPY docker/storybook.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/storybook-static /usr/share/nginx/html

# Dokploy: set the application's port to 80 (matches the EXPOSE below).
EXPOSE 80

# nginx:alpine's base image already starts with `nginx -g 'daemon off;'`.
