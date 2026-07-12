# Troubleshooting Guide

Common problems and how to fix them, organized by area.

## Database

### `Can't reach database server` / backend won't start

- Confirm something is actually listening on `DATABASE_URL`'s host/port. If
  you're using `npm run db:dev`, make sure that terminal is still running —
  it's a foreground process, not a background service.
- Check `server/.env`'s `DATABASE_URL` matches whatever you actually started
  (Docker container, system Postgres, or `db:dev`'s default).
- If using Docker: `docker ps` — is the `av1-postgres` container actually up?

### `relation "X" does not exist` / schema out of date

Migrations haven't been applied. Run:

```bash
cd server
npm run prisma:migrate
```

### Prisma engine file lock error on Windows (`EPERM: operation not permitted, rename ... query_engine-windows.dll.node.tmp...`)

A running `tsx watch` dev server holds the Prisma query engine binary open,
which blocks `prisma generate` from replacing it. Stop the dev server first,
run `npx prisma generate`, then restart `npm run dev`.

### Seed script fails or seems to duplicate data

It shouldn't — every insert in `prisma/seed.ts` is an `upsert` keyed on a
stable id (email, slug, or fixed seed id), so re-running is safe. If you see
duplicates, check whether a resource's seed entry was changed to `create()`
instead of `upsert()` (this exact bug existed once — see
[server/README.md § Verification](server/README.md#verification) for the
history) — it should not be, in the current codebase.

## Authentication

### Login returns 401 with correct credentials

- Check the account is seeded: `admin@av1-company.al` / `ChangeMe123!` (or
  your own `SEED_ADMIN_*` values) — re-run `npm run seed` if unsure.
- Check the user's `isActive` flag hasn't been turned off (an Admin can check
  this on the Users page).
- If the password contains `<` or `>` characters: this was a real bug, fixed
  in this release — `sanitizeBody` no longer touches the `password` field
  (see [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md)). If you're running an
  older build, upgrade.

### Logged out unexpectedly / session doesn't persist across a refresh

This is by design for a hard refresh in some cases — the access token lives
in memory only (never `localStorage`), so it's gone after a full page
reload. On boot, the app silently calls `/auth/refresh` using the `httpOnly`
cookie to restore the session; if *that* fails too, you're sent to `/login`.
Check:

- The refresh cookie is being set at all — inspect cookies in devtools after
  logging in; you should see one scoped to `/api/v1/auth`.
- `CORS_ORIGIN` on the backend includes the exact origin the frontend is
  served from, and the frontend's request includes credentials (already
  configured in `admin/src/api/client.ts` — only relevant if you've modified it).
- Cookie `secure` flag: in production this requires HTTPS. Testing production
  config over plain HTTP will silently drop the cookie.

### CORS errors in the browser console

`CORS_ORIGIN` on the backend must exactly match the frontend's origin
(scheme + host + port, no trailing slash). Comma-separate multiple origins,
no spaces. Restart the backend after changing it — it's read once at
startup.

## Media uploads

### Upload fails / hangs

- With placeholder `CLOUDINARY_*` credentials (the `.env.example` defaults),
  uploads will reach Cloudinary and fail there — this is expected until you
  set real credentials. Everything else in the app works fine with
  placeholders.
- Check the file is under 25MB and an accepted type (JPEG/PNG/WebP/AVIF/GIF
  for images, MP4/WebM/MOV for video) — anything else is rejected before it
  reaches Cloudinary.
- A 403 on upload/replace for an otherwise-logged-in user: they're
  authenticated but the request needs `ADMIN` or `EDITOR` — check their role
  on the Users page. Permanent delete (`DELETE /media/:id`) additionally
  requires `ADMIN` specifically.

### Removed an image but the old file is still in Cloudinary

This is intentional — "Remove" on an image field only detaches it from that
record; it never calls the permanent-delete endpoint (which is `ADMIN`-only,
while uploading/replacing is `ADMIN` **and** `EDITOR`). See
[admin/README.md § Scope decisions](admin/README.md#scope-decisions-made-building-this).

## Frontend / build issues

### `npm run build` fails with TypeScript errors

Run `npx tsc -b` directly (frontends) or `npm run typecheck` (backend) to see
the full error without Vite's output interleaved. All three apps run with
`strict: true` — if you're adding code, this is expected to catch real type
gaps, not a false positive to suppress.

### ESLint errors on files you didn't touch

Make sure `node_modules` is up to date (`npm install`) — a stale
`typescript-eslint` version can produce spurious errors on otherwise-valid
code.

### Vitest / admin test suite fails to start with a jsdom-related error

If you see `Error: require() of ES Module ... not supported` from inside
`@asamuzakjp/css-color` or similar — that's a known `jsdom` v27 ESM/CJS
interop bug. This project already uses `happy-dom` instead of `jsdom` for
exactly this reason (`admin/vitest.config.mts`); if you've swapped it back to
`jsdom`, swap it back.

### Admin test file has duplicate elements / "Found multiple elements with role X"

React Testing Library isn't auto-cleaning up between tests. This project
doesn't use Vitest's `globals: true`, so RTL's automatic cleanup registration
doesn't fire on its own — it's wired up explicitly in
`admin/src/test/setup.ts` via an `afterEach(cleanup)`. If you added a new
test file, make sure `vitest.config.mts`'s `setupFiles` still points at it.

## Docker

### `docker compose up` fails to connect to the database

The `server` service needs `DATABASE_URL` pointed at the compose network's
Postgres hostname (`postgres`, the service name), not `localhost` — check
`docker-compose.yml`'s `environment:` block for the `server` service rather
than your local `.env`, which isn't used inside the container.

### Frontend container serves stale content after a code change

Production Docker builds bake the app at build time — you need to rebuild
the image (`docker compose -f docker-compose.prod.yml build`), not just
restart the container. The dev compose file bind-mounts source for hot
reload instead; if that's also stale, confirm the bind mount paths in
`docker-compose.yml` match your checkout.

### `VITE_API_URL` seems to have no effect

It's a **build-time** variable for both frontends — Vite inlines it into the
static bundle. Changing it requires a rebuild (`--build-arg` for Docker,
redeploy for Vercel), not just a container/process restart.

## Deployment

### Backend boots locally but refuses to start in production

`config/env.ts` deliberately refuses to boot with `NODE_ENV=production` if
`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` are still set to
their `.env.example` placeholder values — this is a guardrail, not a bug.
Generate real values (`openssl rand -hex 64`, one each) and set them on your
deploy platform.

### 404s on every admin/gallery/video/before-after route except the public list

This was a real bug, fixed in this release: the `/admin` sub-router must be
mounted *before* the public `GET /:id` route in each affected route file, or
Express matches `/admin` itself against `:id`. If you're seeing this on a
resource, check that route file's mount order against
`server/src/routes/project.routes.ts` (the reference implementation).

## Still stuck?

Check [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md) and the relevant per-app
README ([server](server/README.md), [admin](admin/README.md),
[av1-company](av1-company/README.md)) — most non-obvious behavior in this
codebase is documented with the reasoning behind it, not just the "what."
