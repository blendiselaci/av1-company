# AV1-Company API

Backend + CMS foundation for the AV1-Company marketing site: Express + TypeScript,
PostgreSQL via Prisma, JWT auth with refresh-token rotation, Zod validation on every
request, and a Cloudinary-backed media management system — uploads tracked in
Prisma, replace-in-place, optimized URL variants — with placeholder credentials
until a real Cloudinary account is wired up.

This is a separate service from the `av1-company` frontend — it doesn't change
anything about the existing UI. The frontend currently reads its content from
static JSON files under `av1-company/src/content/locales`; this API is the
foundation for eventually serving that same content dynamically instead.

**Deploying this?** See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) at the repo root
for Docker, Vercel/Railway/Render/Neon setup, and a full environment variable
reference — this README covers the backend's own architecture, not deployment.

## Stack

| Concern        | Choice                                   |
| --------------- | ----------------------------------------- |
| Runtime         | Node.js 20+, TypeScript (strict)          |
| Framework       | Express 4                                 |
| Database        | PostgreSQL                                |
| ORM             | Prisma                                    |
| Auth            | JWT access tokens + rotating refresh tokens, bcrypt |
| Validation      | Zod (body/params/query on every route)    |
| File storage    | Cloudinary (placeholder credentials — swap before launch) |
| Security        | Helmet, CORS, rate limiting, input sanitization |
| Observability   | Morgan HTTP logging (routed through the app's structured logger), gzip response compression, `/health` with live DB check |
| Testing         | Vitest — unit/integration coverage for the auth and media modules |

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma       # all data models
│   └── seed.ts             # admin user + sample content
└── src/
    ├── config/              # env validation, central constants, Prisma client, Cloudinary config
    ├── controllers/         # thin HTTP layer — parses req, calls a service, sends response
    ├── middleware/           # auth, validation, rate limiting, error handling, morgan logging
    ├── repositories/         # data access (generic BaseRepository + per-entity extras)
    ├── routes/               # route wiring per resource (public + /admin sub-router)
    ├── services/             # business logic
    ├── types/                # Express request augmentation
    ├── utils/                # AppError, JWT, password hashing, pagination, logger
    ├── validators/           # Zod schemas per resource
    ├── app.ts                # Express app assembly (middleware pipeline + routes)
    └── server.ts             # process entry point, graceful shutdown
```

Every content entity (Project, GalleryImage, BeforeAfterProject, Video,
Testimonial, Faq, Service) follows the exact same layering: `validator → repository
→ service → controller → routes`. Look at `project.*` first — every other entity is
the same shape.

Tests are co-located as `*.test.ts` next to the file they cover (e.g.
`src/services/auth.service.test.ts`) rather than in a separate `tests/` tree, and
are excluded from the production build (`tsconfig.json`) while still being
type-checked (`tsconfig.typecheck.json`).

## Getting started

This has been run and verified end-to-end against a real PostgreSQL 16 instance —
migrations applied, seed data inserted, `admin@av1-company.al` logged in
successfully through both the raw API and the admin dashboard UI. See
[Verification](#verification) below for exactly what was checked.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env`

```bash
cp .env.example .env
```

Fill in a real `DATABASE_URL` and generate real `JWT_ACCESS_SECRET` /
`JWT_REFRESH_SECRET` / `COOKIE_SECRET` values (e.g. `openssl rand -hex 64`) before
deploying anywhere — the `.env.example` defaults are placeholders. See
[Required environment variables](#required-environment-variables) below.

**You need a PostgreSQL server to point `DATABASE_URL` at.** Pick one:

- **Docker**: `docker run --name av1-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=av1_company -p 5432:5432 -d postgres:16`
- **A system/managed Postgres install** — create an `av1_company` database and
  point `DATABASE_URL` at it.
- **No Docker and no local Postgres install available** (this is how this
  backend was actually verified, in a sandboxed environment with neither):
  ```bash
  npm run db:dev
  ```
  This downloads and runs a real, local-only PostgreSQL 16 server (via the
  `embedded-postgres` dev dependency — no admin rights or system install
  required) with data persisted in `.pgdata/` (gitignored). It matches
  `.env.example`'s `DATABASE_URL` exactly. **Leave it running** in its own
  terminal and use a second terminal for the rest of these steps. This is a
  local dev convenience only — `server.ts` never imports or depends on it; it
  only ever talks to whatever `DATABASE_URL` points at.

### 3. Run migrations

```bash
npm run prisma:migrate
```

Creates every table, index, and constraint from `prisma/schema.prisma`.

### 4. Seed the database

```bash
npm run seed
```

Inserts 1 `ADMIN` + 1 `EDITOR` user, site settings, and sample projects,
gallery images, before/after entries, videos, testimonials, FAQs, and services.
Safe to run repeatedly — every insert is an `upsert` keyed on a stable
identifier (email, slug, or a fixed seed id), so re-running updates the same
rows instead of duplicating them or wiping unrelated data an admin may have
since added through the dashboard.

### 5. Start the backend

```bash
npm run dev              # http://localhost:4000
```

Watch the startup logs — you should see `Database connected` followed by
`Server listening on port 4000`. If the database isn't reachable, the process
logs the error and exits (code 1) rather than starting in a broken state; check
`DATABASE_URL` and that step 2's Postgres is actually running.

### 6. Start the frontend / admin dashboard

```bash
cd ../admin && npm install && npm run dev    # http://localhost:3000
```

(Or `cd ../av1-company` for the public marketing site, on :5173 — see that
project's own README. Both are already allowed by this API's default
`CORS_ORIGIN`.)

### 7. Log in to the dashboard

Open http://localhost:3000/login and sign in with the seeded admin account:

- **Email**: `admin@av1-company.al`
- **Password**: `ChangeMe123!`

(Or the seeded editor: `editor@av1-company.al` / `ChangeMe123!`, same
password by default — override via `SEED_EDITOR_PASSWORD` before seeding a
real deployment. Change both passwords after first login in anything beyond
local dev.)

### Required environment variables

See `.env.example` for the full list with inline comments. The important ones:

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` — generate real
  random values before deploying (e.g. `openssl rand -hex 64`). The defaults are
  placeholders and will fail Zod's minimum-length check if left too short.
- `CLOUDINARY_*` — placeholder values by default; swap for a real account when
  ready. Every Cloudinary call goes through `src/services/upload.service.ts`, so
  that's the only file that would need to change for a different storage provider.
- `CORS_ORIGIN` — comma-separated list of allowed frontend origins.

## Scripts

| Command                  | What it does                                      |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`              | Start with hot reload (`tsx watch`)                |
| `npm run build`             | Type-check + compile to `dist/`                    |
| `npm start`                | Run the compiled build                             |
| `npm run typecheck`         | Type-check `src/` **and** `prisma/seed.ts`         |
| `npm run lint`               | ESLint                                              |
| `npm test`                   | Run the Vitest suite once                          |
| `npm run prisma:migrate`     | Create/apply a dev migration                       |
| `npm run prisma:deploy`      | Apply migrations in production (no schema drift check) |
| `npm run prisma:studio`      | Prisma's DB browser GUI                             |
| `npm run seed`                | Run `prisma/seed.ts`                                |
| `npm run db:dev`              | Start a local-only embedded PostgreSQL (dev convenience, see [Getting started](#getting-started)) |

## Authentication

- `POST /api/v1/auth/login` — email + password → access token (response body) +
  refresh token (httpOnly, signed, `SameSite=Lax` cookie scoped to `/api/v1/auth`).
- `POST /api/v1/auth/refresh` — rotates the refresh token (the old one is revoked;
  reuse of a revoked token revokes every session for that user as a theft
  precaution) and returns a new access token.
- `POST /api/v1/auth/logout` — revokes the current refresh token, clears the cookie.
- `GET /api/v1/auth/me` — current user, requires `Authorization: Bearer <accessToken>`.

Two roles: `ADMIN` and `EDITOR`. Every admin/write endpoint requires one of them
via the `authenticate` + `authorize(...)` middleware pair
(`src/middleware/auth.ts`). There's no public self-registration — accounts are
created via the seed script (or, if you extend the API later, by an existing admin).

**How it fits together:**

- Passwords are hashed with bcrypt (cost 12, `src/utils/password.ts`) and the hash
  is never sent back in any API response — `auth.service.ts`'s `toPublicUser()` is
  the only place a `User` row is turned into a response body, and it whitelists
  `id`/`email`/`name`/`role`/`createdAt` only.
- Access tokens are short-lived JWTs (`JWT_ACCESS_EXPIRES_IN`, default `15m`),
  signed with `JWT_ACCESS_SECRET`, sent in the response body, and expected back as
  `Authorization: Bearer <token>`.
- Refresh tokens are longer-lived JWTs (`JWT_REFRESH_EXPIRES_IN`, default `30d`),
  signed with a separate `JWT_REFRESH_SECRET`, and never touch client-side
  JavaScript — they're set as an `httpOnly`, `signed`, `SameSite=Lax` cookie scoped
  to `/api/v1/auth`, and only their SHA-256 hash is stored in the `refresh_tokens`
  table (`src/utils/hash.ts`).
- Every refresh **rotates** the token: the presented one is revoked and a new one
  issued. If a client ever presents a token that's already revoked, that's treated
  as a signal the token was stolen and reused — every active session for that user
  is revoked as a precaution (`refreshSession` in `auth.service.ts`).
- `validate({ body: loginSchema })` (Zod) validates the login request; `refresh`
  has no request body to validate — the token itself arrives only via the signed
  cookie, is checked for presence, then verified for signature/expiry, which is the
  equivalent validation step for a bodyless endpoint.
- `authenticate` middleware (401 on a missing/malformed/invalid/expired access
  token) and `authorize(...roles)` (403 on a role that isn't allowed) are separate,
  composable middleware — see `router.get('/me', authenticate, ...)` for the
  simplest example, or any `*.routes.ts` `/admin` sub-router for
  `authenticate, authorize('ADMIN', 'EDITOR')` in combination.
- All of the above funnels through the shared `AppError` hierarchy
  (`src/utils/AppError.ts`) and the global `errorHandler`, so a bad login, an
  expired token, and a wrong role all come back in the same
  `{ success: false, message, errors? }` shape with the appropriate status code
  (401 for authentication failures, 403 for authorization failures, 422 for Zod
  validation failures — see [Error handling & responses](#error-handling--responses)).

**Testing:** `src/services/auth.service.test.ts`, `src/middleware/auth.test.ts`,
`src/utils/jwt.test.ts`, and `src/utils/password.test.ts` cover valid login, wrong
password, unknown/deactivated users, refresh-token rotation, expired tokens, reused
(revoked) refresh tokens triggering a full session revoke, missing/malformed/expired
access tokens on protected routes, and role authorization — all against mocked
repositories, so `npm test` runs without a database. Run it with `npm test`.

## Health check

`GET /health` — deliberately outside `/api/v1` and unauthenticated (load balancers
and uptime monitors hit it directly). Pings the database with `SELECT 1` and
returns:

```jsonc
{ "status": "ok", "uptime": 42.1, "environment": "development", "version": "1.0.0", "database": "connected", "timestamp": "..." }
```

Returns HTTP 200 with `status: "ok"` when the database is reachable, or 503 with
`status: "degraded"` and `database: "disconnected"` otherwise — the status code is
the primary signal, so this isn't wrapped in the usual `{ success, data }` envelope.

## Content API shape

Every content resource is mounted twice under one router file:

- `GET /api/v1/<resource>` and `GET /api/v1/<resource>/:id` — **public**, always
  scoped to `isPublished: true` regardless of query params. This is what the
  marketing site would fetch from.
- `GET|POST|PATCH|DELETE /api/v1/<resource>/admin/...` — **protected**
  (`ADMIN`/`EDITOR`), full CRUD, sees unpublished/draft content too.

Resources: `projects`, `gallery`, `before-after`, `videos`, `testimonials`, `faqs`,
`services`, `settings`. `contact-messages` is the one exception — there's no public
read (only `POST /api/v1/contact-messages` to submit, rate-limited); everything
else is admin-only.

List endpoints accept `page`, `limit`, and (where relevant) `category` and
`search` query params, and return `{ success, data, meta: { page, limit, total,
totalPages } }`.

**Route registration order matters here.** For any resource with a public
`GET /:id` (projects, gallery, videos, before-after), the `/admin` sub-router
must be mounted (`router.use('/admin', admin)`) *before* that public `/:id`
route is registered. If `/:id` is registered first, Express matches a request
to `/api/v1/<resource>/admin` against `:id` (treating "admin" as the literal
id) and 404s before the admin sub-router ever sees it — the admin dashboard's
list/create endpoints for that resource silently break while everything else
keeps working. This was caught during end-to-end verification (the dashboard's
summary cards showed 0 for Projects/Gallery/Videos while Testimonials/FAQs,
which have no public `/:id`, showed correctly) and fixed in all four affected
route files.

## Media management

`src/services/upload.service.ts` holds the low-level Cloudinary primitives
(`uploadAsset`, `deleteAsset`, `replaceAsset`, `getOptimizedUrl`,
`buildResponsiveVariants`) — the only file that would need to change for a
different storage provider. Everything under `/api/v1/media` is a thin, Prisma-
backed layer on top of those primitives: unlike a raw upload proxy, every asset
that comes through this API is tracked in a `Media` row the moment it's uploaded
(who uploaded it, its Cloudinary `publicId`, MIME type, size, and what it's
for), so it can be browsed, replaced, and permanently deleted as a real library —
not just fire-and-forgotten into Cloudinary.

| Endpoint | Role | What it does |
| --- | --- | --- |
| `POST /api/v1/media/upload` | ADMIN, EDITOR | Single file (`file` field) + `category` body field → uploads to Cloudinary, creates a `Media` row |
| `POST /api/v1/media/upload/multiple` | ADMIN, EDITOR | Multiple files (`files` field, max 10) + `category` → one `Media` row per file |
| `GET /api/v1/media` | ADMIN, EDITOR | Paginated list, optional `?category=` filter |
| `GET /api/v1/media/:id` | ADMIN, EDITOR | Single record |
| `PUT /api/v1/media/:id/replace` | ADMIN, EDITOR | Uploads a replacement file, deletes the old Cloudinary asset, updates the same `Media` row in place (the `id` a client already has — e.g. attached to a project — stays valid) |
| `DELETE /api/v1/media/:id` | **ADMIN only** | Permanently deletes the DB row and the Cloudinary asset |

Every response includes a `variants` object (`thumbnail`/`medium`/`original`)
generated by `buildResponsiveVariants()` — a Cloudinary transformation URL built
by naming convention (`f_auto,q_auto` + width), no extra network call, so it's
free to include on every read.

`category` is one of `PROJECT_COVER`, `GALLERY`, `BEFORE_AFTER`, `SERVICE`,
`TESTIMONIAL_AVATAR`, `VIDEO`, `VIDEO_THUMBNAIL` (the `MediaCategory` enum) — it
determines the Cloudinary subfolder an upload lands in and lets the library be
filtered by what an asset is for. A video's thumbnail is just an image upload
with `category: VIDEO_THUMBNAIL`; there's no separate code path for it.

**Attaching an uploaded asset to content:** upload via `/media` first to get back
`{ url, publicId }` (plus variants), then set those on the content record itself
through its own create/update endpoint (e.g. `PATCH /api/v1/projects/admin/:id`
with `{ image, imagePublicId }`) — the same flat-column pattern every content
entity already used before this module existed. `Media` is an independent upload
ledger, not a foreign key every content entity points through; content entities
keep owning their own `image`/`imagePublicId` (or `beforeImage`/`afterImage`,
`thumbnail`, etc.) columns, and each entity's own `delete` already best-effort
cleans up its Cloudinary asset when the record is deleted (see e.g.
`deleteProject` in `project.service.ts`).

**Validation, limits, and roles:** the reusable `upload` multer middleware
(`src/middleware/upload.ts`) enforces a 25MB file size limit and an allowed-MIME
allowlist (`image/jpeg`, `png`, `webp`, `avif`, `gif`, `video/mp4`, `webm`,
`quicktime`) before a file ever reaches a controller. Every `/media` route
requires `authenticate` + `authorize('ADMIN', 'EDITOR')`; the delete route stacks
a second `authorize('ADMIN')` on top, so an EDITOR can upload/replace/browse but
not permanently delete.

## Error handling & responses

Every response has the same envelope:

```jsonc
// success
{ "success": true, "data": ..., "meta": { /* only on list endpoints */ } }
// error
{ "success": false, "message": "...", "errors": { /* optional, e.g. Zod field errors */ } }
```

All errors — thrown `AppError`s, Zod validation failures, Prisma constraint
violations (unique/foreign-key), or anything unexpected — funnel through the single
`errorHandler` middleware (`src/middleware/errorHandler.ts`) and come out in that
shape with the right HTTP status code.

## Adding Swagger/OpenAPI later

Nothing here blocks it — routes are consistently named
(`/api/v1/<resource>[/admin]/...`), every input is already validated with a named
Zod schema per route (which `zod-to-openapi` or similar can introspect), and
response shapes are uniform. Wiring up `swagger-jsdoc` + `swagger-ui-express` (or
generating straight from the Zod schemas) is additive — it wasn't added now to
avoid pulling in tooling that isn't exercised yet.

## Security checklist

- `helmet()` for standard security headers.
- `cors()` restricted to `CORS_ORIGIN`, credentials enabled (needed for the refresh
  cookie).
- Two-tier rate limiting: a general limiter on the whole API, a stricter one on
  `/auth/login` + `/auth/refresh`, and a dedicated one on the public contact form.
- `sanitizeBody` strips HTML out of every string field before it reaches a
  validator (defense-in-depth against stored XSS; Prisma's parameterized queries
  already rule out SQL injection).
- Passwords hashed with bcrypt (cost 12, `bcrypt@^6`); refresh tokens hashed with
  SHA-256 before being stored, so the database never holds a usable raw token.
- Refresh token cookie is `httpOnly`, `signed`, and `secure` in production.
- `config/env.ts` refuses to boot with `NODE_ENV=production` if
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`COOKIE_SECRET` are still set to any
  known `.env*.example` placeholder value — passing Zod's length check isn't
  enough on its own, since the placeholders are deliberately long.
- Multer's own `LIMIT_FILE_SIZE` rejection is translated into a proper `400`
  (`errorHandler.ts`) instead of falling through to a misleading `500`.
- `utils/monitoring.ts`'s `captureException()` is the single integration point
  for a future error-reporting/APM service — every unexpected `500` (from
  `errorHandler`) and every process-level `uncaughtException` /
  `unhandledRejection` (from `server.ts`) already routes through it, so
  wiring in a real provider later is a one-file change.

`npm audit` reports 0 vulnerabilities. `bcrypt` is pinned to `^6` specifically —
`^5` pulled in a `node-tar` dependency chain (via `@mapbox/node-pre-gyp`, used only
at native-module install time) that `npm audit` flagged as high severity; `v6`'s API
is a drop-in match for the `hashPassword`/`comparePassword` wrappers here.

## Verification

Everything below was run against a real PostgreSQL 16.14 instance (not mocked,
not simulated) — via `npm run db:dev` in this sandboxed environment, which has
neither Docker nor a system Postgres install available.

- ✓ **Database connected** — `npm run dev` logs `Database connected` then
  `Server listening on port 4000`; `GET /health` returns
  `"database": "connected"`.
- ✓ **Prisma working** — `prisma generate`, `prisma migrate dev`, `prisma db
  push`, and `prisma studio` all run cleanly against the live database.
- ✓ **Migrations successful** — `20260710212401_init` (full schema, all 12
  models) and a follow-up migration (`Settings.createdAt`) both applied
  without error.
- ✓ **Seed successful** — `npm run seed` inserts 1 `ADMIN` + 1 `EDITOR` user,
  settings, 4 projects, 6 gallery images, 3 before/after entries, 4 videos, 5
  testimonials, 6 FAQs, 5 services. Run twice in a row and verified by direct
  row count afterward — identical counts both times, zero duplicates.
- ✓ **Login functional** — `POST /api/v1/auth/login` with
  `admin@av1-company.al` / `ChangeMe123!` returns `200` with a real JWT and
  sets the refresh cookie; same for the seeded editor account; a wrong
  password correctly returns `401`. Also verified through the actual admin
  dashboard UI (typed credentials into the real login form, submitted,
  landed on the dashboard).
- ✓ **Dashboard connected to backend** — after signing in through the UI, the
  summary cards showed live counts matching the seeded data (4 projects, 6
  gallery images, 4 videos, 5 testimonials, 6 FAQs, 0 contact messages), and
  the Projects list page rendered a real, paginated table ("Showing 1–4 of
  4") from `GET /api/v1/projects/admin`.

**Found and fixed during this pass**, beyond the DB/env/Prisma/seed work
itself:

- A real routing bug in `project.routes.ts`, `gallery.routes.ts`,
  `video.routes.ts`, and `beforeAfter.routes.ts`: the `/admin` sub-router was
  mounted *after* the public `GET /:id` route, so Express matched `/admin`
  itself against `:id` and 404'd before the admin routes ever ran. This is
  exactly what caused the dashboard's summary cards to show 0 for
  Projects/Gallery/Videos on first login — only surfaced by testing against a
  real running database, not by static analysis. See
  [Content API shape](#content-api-shape) for the fix and why it matters.
- `Settings` was the only model missing a `createdAt` timestamp — added for
  consistency with every other model (Prisma schema audit).
- `/health` was missing the `environment` field from its response.
- The seed script's `GalleryImage`/`BeforeAfterProject`/`Video`/
  `Testimonial`/`Faq`/`Service` sections used `deleteMany()` + `create()`,
  which avoided duplicates but wiped the *entire* table on every re-run —
  including any real content an admin had since added through the dashboard.
  Converted all six to `upsert()` keyed on a stable seed id, matching the
  pattern already used for `User`/`Project`/`Settings`.
