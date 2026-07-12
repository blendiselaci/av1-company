# syntax=docker/dockerfile:1

# ── Base ────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app

# ── deps: install once, reused by both the builder and dev targets ──
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── builder: generate the Prisma client and compile TypeScript ──────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── dev: hot-reload target used by docker-compose.yml ────────────────
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── migrator: has the Prisma CLI, used as a one-off job to run
#    `prisma migrate deploy` against production — never runs the server ──
FROM builder AS migrator
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

# ── production: slim runtime image, no dev dependencies ─────────────
FROM base AS production
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The generated Prisma client lives in node_modules/.prisma — `npm ci --omit=dev`
# installs the @prisma/client package itself but not its generated output, so
# it's copied in from the builder stage instead of running `prisma generate`
# again here (which would need the Prisma CLI, a devDependency, in this image).
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN addgroup -S nodejs && adduser -S expressjs -G nodejs
USER expressjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
