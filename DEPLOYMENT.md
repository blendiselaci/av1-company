# AV1-Company — Deployment Guide

Three independent apps, deployed independently:

| App | What it is | Local dev port | Deploy target |
| --- | --- | --- | --- |
| `av1-company/` | Public marketing site (static SPA) | 5173 | Vercel |
| `admin/` | CMS admin dashboard (static SPA) | 3000 | Vercel |
| `server/` | Express API + Prisma/PostgreSQL | 4000 | Railway or Render |
| — | PostgreSQL database | 5432 | Neon |

None of them need to be deployed together or on the same host — the frontends talk
to the backend purely over its public HTTPS URL (`VITE_API_URL` / `CORS_ORIGIN`).

---

## 1. Local setup (no Docker)

```bash
# 1. Install dependencies for all three apps
cd server && npm install && cd ..
cd av1-company && npm install && cd ..
cd admin && npm install && cd ..

# 2. Configure the backend's .env
cd server
cp .env.example .env

# 3. Start a database (pick one)
npm run db:dev              # embedded local Postgres, no Docker/system install needed
# — or point DATABASE_URL in .env at your own local/Docker/Neon Postgres —

# 4. Run migrations + seed (new terminal if you used db:dev, which blocks its own)
npm run prisma:migrate
npm run seed

# 5. Start the backend
npm run dev                  # http://localhost:4000

# 6. Start the frontends (each in its own terminal)
cd ../av1-company && npm run dev   # http://localhost:5173
cd ../admin && npm run dev          # http://localhost:3000
```

Log in to the dashboard at http://localhost:3000/login — see
[Admin login](#6-admin-login) below for credentials.

---

## 2. Docker setup

Two compose files at the repo root; each app also has its own standalone
`Dockerfile` if you only want to build one image at a time.

### Development (hot reload, all four services)

```bash
docker compose up
docker compose exec server npx prisma migrate dev
docker compose exec server npm run seed
```

- Site → http://localhost:5173, Admin → http://localhost:3000, API →
  http://localhost:4000
- Source is bind-mounted into each container, so edits on the host hot-reload
  inside it (Vite HMR for the frontends, `tsx watch` for the backend).
- Postgres data persists in the named volume `postgres_data` across restarts;
  `docker compose down -v` removes it if you want a clean slate.

### Production (self-hosted alternative to Vercel/Railway/Render)

Built, optimized images; no bind mounts; restart policies. This is a second,
independent deployment *option* — most people will use section 3 instead,
but this is here if you're self-hosting on your own box/VPS.

```bash
# Frontend build-time API URL(s) — Vite bakes these into the static bundle
export VITE_API_URL=https://api.example.com/api/v1
export ADMIN_VITE_API_URL=https://api.example.com/api/v1
export POSTGRES_PASSWORD=<a real password>

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml up -d
```

- `server/.env.production` must exist (copy from `.env.production.example`
  and fill in real values) — the `server` and `migrate` services both read it.
- Site → :8080, Admin → :8081, API → :4000. Put the optional
  `nginx/nginx.conf` (subdomain-routed reverse proxy) in front of all three if
  you want one public entrypoint on :80/:443 instead of three exposed ports —
  see the comment at the top of that file for the DNS setup it expects.
- Postgres is **not** exposed to the host in this file (only reachable by the
  other containers) — that's deliberate; add a `ports:` mapping yourself if
  you need direct external access.

---

## 3. Production deployment (managed platforms)

This is the recommended path — no servers to patch, no Docker required.

### 3a. Database — Neon

1. Create a project at [neon.tech](https://neon.tech), database name
   `av1_company`.
2. Copy the connection string from the dashboard. Neon gives you two
   variants — **use the direct (non-pooled) one** for `DATABASE_URL`:
   ```
   postgresql://user:password@ep-example-12345.us-east-2.aws.neon.tech/av1_company?sslmode=require
   ```
   The pooled variant (hostname contains `-pooler`) goes through PgBouncer in
   transaction mode, which Prisma Migrate can't reliably use for schema
   changes (no advisory locks/prepared statements). Since this backend is a
   normal long-running Express process (not serverless), there's no need for
   connection pooling on Neon's side at all — the direct URL works for both
   migrations and everyday queries. (If you later move the API to a
   serverless/edge runtime, that's when you'd split this into `DATABASE_URL`
   pooled + `directUrl` in `schema.prisma` for migrations only — not needed
   here.)
3. `sslmode=require` is already in the string Neon gives you — don't remove it.

### 3b. Backend — Railway or Render

Both read `server/Dockerfile`'s `production` target directly; pick one.

**Railway** (`server/railway.json` is already configured):
1. New Project → Deploy from GitHub repo → set the service's **root directory**
   to `server`.
2. Railway detects `railway.json` and builds the `production` Docker target.
3. Add every variable from `server/.env.production.example` in Settings →
   Variables (real values — `DATABASE_URL` from Neon, generated secrets, real
   Cloudinary keys, `CORS_ORIGIN` set to your two Vercel URLs).
4. Deploy. Then run the one-time migration (Railway CLI, from your machine):
   ```bash
   railway run --service <your-service-name> npx prisma migrate deploy
   ```

**Render** (`server/render.yaml` is already configured as a Blueprint):
1. New → Blueprint → point at this repo. Render reads `server/render.yaml`.
2. `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` are marked
   `generateValue: true` — Render generates strong random values for you
   automatically. Fill in the `sync: false` ones (`DATABASE_URL`,
   `CORS_ORIGIN`, Cloudinary keys, seed credentials) in the dashboard.
3. Deploy. Then run the one-time migration from Render's **Shell** tab (the
   Prisma CLI is available — it's a regular dependency, not a dev-only one):
   ```bash
   npx prisma migrate deploy
   ```

Either way: **`prisma migrate deploy` is a deliberate manual step, not an
automatic pre-deploy hook.** Auto-migrating on every deploy is a debated
practice even among Prisma's own docs — with multiple replicas, or an app
still handling in-flight requests against the old schema, an automatic
migration can be more dangerous than a 60-second manual step. Run it
yourself, once, whenever a deploy actually changes `prisma/schema.prisma`.

Once the backend is live, verify: `curl https://your-api.example.com/health`
should return `"database": "connected"`.

### 3c. Frontends — Vercel

Both `av1-company/vercel.json` and `admin/vercel.json` are already configured
(SPA rewrites, cache headers, security headers).

1. Two separate Vercel projects, same GitHub repo:
   - Project 1: **Root Directory** = `av1-company`
   - Project 2: **Root Directory** = `admin`
2. Vercel auto-detects Vite; the committed `vercel.json` in each covers the
   rest (build command, output dir, SPA fallback).
3. For **both** projects: add environment variable
   `VITE_API_URL=https://your-api.example.com/api/v1` (Production
   environment). `av1-company` uses it to fetch the Gallery from the CMS API
   (falls back to `http://localhost:4000/api/v1` if unset, so it's optional
   for local dev only — see [Environment variables](#5-environment-variables)).
4. Deploy both. Take note of the two resulting `*.vercel.app` URLs (or your
   custom domains) — you need them for the next step.
5. Back on the backend: set `CORS_ORIGIN` to exactly those two origins
   (comma-separated, no trailing slashes), redeploy the backend.

### 3d. Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Dashboard → copy Cloud Name, API Key, API Secret.
3. Set `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
   on the backend (Railway/Render env vars). `CLOUDINARY_UPLOAD_FOLDER` can
   stay `av1-company`.
4. That's it — every upload call in `upload.service.ts` already targets
   whatever these three point at; nothing else changes.

### 3e. Custom domain

1. **Frontends (Vercel)** — in each Vercel project → Settings → Domains, add
   your domain (e.g. `www.av1-company.al` for the public site,
   `admin.av1-company.al` for the dashboard). Vercel shows the exact DNS
   record to add (usually a `CNAME` to `cname.vercel-dns.com`, or an `A`
   record if you're pointing the apex domain). Add it at your registrar/DNS
   provider and wait for propagation — Vercel auto-issues the TLS
   certificate once DNS resolves.
2. **Backend (Railway/Render)** — both support custom domains under the
   service's Settings → Domains (or Networking) tab the same way: add the
   domain (e.g. `api.av1-company.al`), add the CNAME record it gives you.
3. **Update `CORS_ORIGIN`** on the backend to the real custom-domain origins
   once DNS is live (not the `*.vercel.app` preview URLs) — comma-separated,
   no trailing slash, e.g. `https://www.av1-company.al,https://admin.av1-company.al`.
4. **Update `VITE_API_URL`** on both frontend Vercel projects to the
   backend's custom domain (`https://api.av1-company.al/api/v1`), redeploy.
5. Update `SITE_URL` in `av1-company/src/lib/seo.ts` to match the real
   domain — it's currently a placeholder (`https://www.av1-company.al`) used
   for canonical URLs, Open Graph tags, and JSON-LD.

---

## 4. Database migration reference

| Command | When |
| --- | --- |
| `npx prisma migrate dev --name <description>` | Local development, whenever you change `schema.prisma` — creates a new migration file and applies it. |
| `npx prisma migrate deploy` | Production/staging — applies any migrations not yet run, creates none. Never run `migrate dev` against a production database. |
| `npx prisma generate` | After any schema change or fresh `npm install` — regenerates the typed client. Runs automatically as part of both `npm run build` (see `Dockerfile`) and `migrate dev`. |
| `npx prisma studio` | A local GUI for browsing the connected database. |

---

## 5. Environment variables

### `server/.env` (development) / `.env.production` (production)

See `.env.example` and `.env.production.example` for the full commented
list. Summary:

| Variable | Dev default | Production |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` — **also enables a startup guard that refuses to boot if any JWT/cookie secret is still a placeholder value** (see `config/env.ts`) |
| `PORT` | `4000` | Whatever the platform expects (Railway/Render both set/read `PORT` automatically in most cases; `4000` is a safe explicit default) |
| `DATABASE_URL` | local Postgres | Neon direct connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` | placeholders (fine for dev) | real, distinct random values — `openssl rand -hex 64` each |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | your two real Vercel origins |
| `CLOUDINARY_*` | placeholders (uploads will fail cleanly, everything else works) | real account credentials |
| `SEED_ADMIN_*` / `SEED_EDITOR_*` | `ChangeMe123!` | a strong temporary password — **rotate both immediately after the first production seed**, from inside the dashboard (Users page) or by re-seeding with new `SEED_*_PASSWORD` values |

### `admin/.env` (development) / build-time env (production)

| Variable | Dev | Production |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:4000/api/v1` | `https://your-api.example.com/api/v1` — set as a Vercel env var (or `--build-arg` for Docker) since Vite bakes it in at build time, not runtime |

### `av1-company/`

| Variable | Dev | Production |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:4000/api/v1` (optional — this is already the fallback) | `https://your-api.example.com/api/v1` |

Most content still comes from `src/content/locales/*.json`, not the API —
only the Gallery fetches live from `VITE_API_URL` at runtime (not build
time, unlike `admin`).

---

## 6. Admin login

Seeded by `npm run seed` (`prisma/seed.ts`), idempotent — safe to re-run:

- **Admin** — `admin@av1-company.al` / `ChangeMe123!` (or your
  `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` if overridden)
- **Editor** — `editor@av1-company.al` / `ChangeMe123!`

**Change both passwords after the first production seed** — either through
the dashboard's Users page (Admin role required) or by setting new
`SEED_ADMIN_PASSWORD` / `SEED_EDITOR_PASSWORD` values and re-running
`npm run seed` (the upsert updates the existing row's password rather than
creating a duplicate).

---

## 7. Final QA checklist

Everything below was verified against a real, running stack (PostgreSQL
16.14, local backend, local admin dashboard) as part of preparing this
deployment guide — not just "should work":

- ✓ **Frontend builds** — `av1-company` and `admin` both `npm run build`
  clean (Vite production build, code-split per route).
- ✓ **Backend builds** — `npm run build` (`tsc`) clean; `prisma generate`
  clean.
- ✓ **Database connects** — `/health` returns `"database": "connected"`;
  `prisma migrate deploy` runs cleanly against the live database.
- ✓ **Authentication works** — `POST /auth/login` verified for both the
  seeded admin and editor accounts; wrong password correctly rejected (401).
- ✓ **CRUD works** — verified live: created, updated, and deleted a real FAQ
  record through the authenticated admin API in this session.
- ✓ **Uploads work** — verified the full code path: unauthenticated request
  correctly rejected (401), authenticated request correctly passes multer's
  validation and reaches Cloudinary. The actual asset storage itself needs
  real Cloudinary credentials (placeholders are configured in this sandbox,
  same as `CLOUDINARY_*` everywhere else in this repo) — set real ones per
  [3d](#3d-cloudinary) and this is the last mile, not a code gap.
- ✓ **Dashboard works** — signed in through the real login form, summary
  cards and resource tables render live data from the API.
- ✓ **Production ready** — strict TypeScript throughout, 57 backend tests
  and 25 admin tests passing, Helmet + CORS + rate limiting + input
  sanitization, secrets validated at boot (and rejected if left as
  placeholders in production), structured JSON logging, graceful shutdown on
  `SIGTERM`/`SIGINT`, and process-level crash reporting
  (`uncaughtException` / `unhandledRejection`) all in place — see
  `server/README.md` for the full security/architecture writeup this guide
  builds on top of, and [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md) for the
  full production audit (measured Lighthouse scores, security review, dead
  code cleanup).

See also: [INSTALLATION.md](INSTALLATION.md) for first-time local setup,
[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for the full variable
reference, and [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if a deploy step
doesn't behave as expected.
