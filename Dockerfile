# syntax=docker/dockerfile:1

# Node is pinned by digest so every build uses the identical toolchain.
# To bump: `docker pull node:<ver>-bookworm-slim` and copy the new RepoDigest here.
FROM node:22.23.4-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# Final stage holds only the static site, so `docker build --target dist --output dist .`
# writes the finished site to ./dist without leaving node_modules on the host.
FROM scratch AS dist
COPY --from=build /app/dist /
