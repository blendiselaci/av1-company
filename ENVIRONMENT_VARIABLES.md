# Environment Variables Guide

Every environment variable used across the three apps, where it's read, and
what it does. Canonical source of truth for each app is its own
`.env.example` / `.env.production.example` file — this page is a consolidated
reference.

## `server/`

Loaded and validated by `src/config/env.ts` (Zod schema) at process startup —
the process refuses to start if a required variable is missing or malformed,
and (in production only) if a JWT/cookie secret is still a known placeholder
value.

| Variable | Required | Dev default (`.env.example`) | Production | Notes |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | yes | `development` | `production` | Also gates the placeholder-secret startup guard |
| `PORT` | no | `4000` | platform-provided or `4000` | |
| `API_PREFIX` | no | `/api/v1` | same | Prefix for every route except `/health` |
| `DATABASE_URL` | yes | local Postgres connection string | Neon direct (non-pooled) connection string | See [DEPLOYMENT.md](DEPLOYMENT.md#3a-database--neon) for why non-pooled |
| `JWT_ACCESS_SECRET` | yes | placeholder | real random value (`openssl rand -hex 64`) | Signs access tokens |
| `JWT_REFRESH_SECRET` | yes | placeholder | real random value, **different** from the access secret | Signs refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | same | |
| `JWT_REFRESH_EXPIRES_IN` | no | `30d` | same | |
| `COOKIE_SECRET` | yes | placeholder | real random value, distinct from both JWT secrets | Signs the refresh-token cookie itself |
| `CORS_ORIGIN` | yes | `http://localhost:5173,http://localhost:3000` | your real frontend origins, comma-separated, no trailing slashes | Never `*` — this API uses `credentials: true` CORS |
| `RATE_LIMIT_WINDOW_MS` | no | `900000` (15 min) | same | General API rate limit window |
| `RATE_LIMIT_MAX` | no | `300` | same | Max requests per window, general API |
| `AUTH_RATE_LIMIT_MAX` | no | `10` | same | Max requests per window, `/auth/login` + `/auth/refresh` |
| `CLOUDINARY_CLOUD_NAME` | yes | placeholder (uploads fail cleanly) | real value from Cloudinary dashboard | |
| `CLOUDINARY_API_KEY` | yes | placeholder | real value | |
| `CLOUDINARY_API_SECRET` | yes | placeholder | real value | |
| `CLOUDINARY_UPLOAD_FOLDER` | no | `av1-company` | same, or your own | Cloudinary subfolder for uploads |
| `SEED_ADMIN_EMAIL` | no | `admin@av1-company.al` | same or your own | Used only by `npm run seed` |
| `SEED_ADMIN_PASSWORD` | no | `ChangeMe123!` | a strong temporary password | **Rotate immediately after first production seed** |
| `SEED_ADMIN_NAME` | no | `AV1 Admin` | same or your own | |
| `SEED_EDITOR_EMAIL` | no | `editor@av1-company.al` | same or your own | |
| `SEED_EDITOR_PASSWORD` | no | `ChangeMe123!` | a strong temporary password | **Rotate immediately after first production seed** |
| `SEED_EDITOR_NAME` | no | `AV1 Editor` | same or your own | |

Full files: [`server/.env.example`](server/.env.example) (dev),
[`server/.env.production.example`](server/.env.production.example) (production template).

## `admin/`

Read by Vite at **build time** — these are baked into the static bundle, not
read at runtime. Changing `VITE_API_URL` requires a rebuild.

| Variable | Required | Dev default | Production | Notes |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | yes | `http://localhost:4000/api/v1` | `https://your-api.example.com/api/v1` | Base URL the admin dashboard calls. Set as a Vercel env var, or `--build-arg VITE_API_URL=...` for Docker (a plain `.env` file isn't read during `docker build`) |

Full files: [`admin/.env.example`](admin/.env.example) (dev),
[`admin/.env.production.example`](admin/.env.production.example) (production template).

## `av1-company/`

Read by Vite at **runtime** (not build time — see below).

| Variable | Required | Dev default | Production | Notes |
| --- | --- | --- | --- | --- |
| `VITE_API_URL` | no | `http://localhost:4000/api/v1` | `https://your-api.example.com/api/v1` | Base URL used to fetch the Gallery from the CMS API. Falls back to the dev default if unset, so it's optional for local dev against a locally-running API |

Most of this site's content still comes from bundled JSON files
(`src/content/locales/*.json`) — only the **Gallery** currently fetches from
the live API, so a gallery image published in `admin` appears here without a
rebuild. Every other section (Projects, Services, Testimonials, FAQs, etc.)
is still static; see [RELEASE_CANDIDATE.md](RELEASE_CANDIDATE.md) for that
known scope boundary.

Full file: [`av1-company/.env.example`](av1-company/.env.example).

## Docker Compose

`docker-compose.yml` (dev) and `docker-compose.prod.yml` read a few
additional host-level variables when building images:

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `av1-company`/`admin` build args (prod compose) | Same as above — baked in at image build time |
| `ADMIN_VITE_API_URL` | `admin` build arg (prod compose) | If you need a different value than the public site's build arg |
| `POSTGRES_PASSWORD` | `postgres` service (prod compose) | Sets the database password for the compose-managed Postgres container |

See [DEPLOYMENT.md](DEPLOYMENT.md#2-docker-setup) for full Docker setup.

## Generating secrets

```bash
openssl rand -hex 64
```

Run this three times for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and
`COOKIE_SECRET` — use a **different** value for each; reusing one across all
three (or across environments) weakens the security guarantees each is meant
to provide independently.
