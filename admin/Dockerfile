# syntax=docker/dockerfile:1

# ── Base ────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app

# ── deps ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── dev: Vite dev server with HMR, used by docker-compose.yml ───────
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

# ── builder: static production build ─────────────────────────────────
# Vite inlines VITE_* env vars into the bundle at build time, not runtime —
# pass the real backend URL as a build arg: `docker build --build-arg
# VITE_API_URL=https://api.example.com/api/v1 ...`
FROM base AS builder
ARG VITE_API_URL=http://localhost:4000/api/v1
ENV VITE_API_URL=$VITE_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── production: nginx serving the static build ───────────────────────
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
