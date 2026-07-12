# Installation Guide

First-time setup for all three apps. For day-to-day development after this,
see [DEVELOPMENT.md](DEVELOPMENT.md). For production deployment, see
[DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- **Node.js 20+** (the backend's `package.json` pins `engines.node >= 20`)
- **npm** (ships with Node)
- A **PostgreSQL** database — three options, pick one:
  - A local/system PostgreSQL install
  - Docker (`docker run --name av1-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=av1_company -p 5432:5432 -d postgres:16`)
  - No Docker and no local install: the backend has a built-in embedded-Postgres
    dev mode (`npm run db:dev`), covered in step 3 below
- A **Cloudinary** account for media uploads to work end-to-end (optional for
  everything else — placeholder credentials let the rest of the app run fine;
  see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md))

## 1. Clone and install dependencies

Each app has its own `package.json` — install all three separately:

```bash
git clone <repo-url> av1-company-project
cd av1-company-project

cd server && npm install && cd ..
cd av1-company && npm install && cd ..
cd admin && npm install && cd ..
```

## 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

The defaults in `.env.example` work as-is for local development (including
placeholder JWT/cookie secrets and Cloudinary credentials — uploads will fail
cleanly until you add real Cloudinary keys, everything else works). See
[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for what every variable
does.

```bash
cd ../admin
cp .env.example .env
```

`admin/.env.example` already points at `http://localhost:4000/api/v1`,
matching the backend's default port — no changes needed for local dev.

`av1-company` needs no environment variables at all.

## 3. Start a database

Pick whichever applies to you:

**Option A — you have Docker:**
```bash
docker run --name av1-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=av1_company -p 5432:5432 -d postgres:16
```

**Option B — you have a local/system PostgreSQL install:** create a database
named `av1_company` and make sure `server/.env`'s `DATABASE_URL` points at it.

**Option C — neither of the above:**
```bash
cd server
npm run db:dev
```
This downloads and runs a real, local-only PostgreSQL 16 server (via the
`embedded-postgres` dev dependency — no admin rights or system install
required), with data persisted in `server/.pgdata/` (gitignored). It matches
`.env.example`'s `DATABASE_URL` exactly. **Leave this running** in its own
terminal — use a second terminal for the rest of these steps.

## 4. Run database migrations

```bash
cd server
npm run prisma:migrate
```

Creates every table, index, and constraint from `prisma/schema.prisma`.

## 5. Seed the database

```bash
npm run seed
```

Inserts one `ADMIN` and one `EDITOR` user, site settings, and sample content
(projects, gallery images, before/after entries, videos, testimonials, FAQs,
services). Safe to run repeatedly — every insert is an `upsert`, so re-running
updates the same rows instead of duplicating them.

Seeded accounts:

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@av1-company.al` | `ChangeMe123!` |
| EDITOR | `editor@av1-company.al` | `ChangeMe123!` |

(Override via `SEED_ADMIN_*` / `SEED_EDITOR_*` env vars before seeding a real
deployment — see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).)

## 6. Start the backend

```bash
npm run dev
```

Watch the startup logs — you should see `Database connected` followed by
`Server listening on port 4000`. If the database isn't reachable, the process
logs the error and exits rather than starting in a broken state.

Verify: `curl http://localhost:4000/health` should return
`"database": "connected"`.

## 7. Start the frontends

In two more terminals:

```bash
cd av1-company && npm run dev   # http://localhost:5173
cd admin && npm run dev         # http://localhost:3000
```

## 8. Log in

Open http://localhost:3000/login and sign in with the seeded admin account
from step 5. You should land on the dashboard with live counts (4 projects,
6 gallery images, etc.) matching the seed data.

## Verifying the install

- `curl http://localhost:4000/health` → `{ "status": "ok", "database": "connected", ... }`
- http://localhost:5173 → the public site loads with seeded content
- http://localhost:3000/login → sign in succeeds, dashboard shows live data

If any of these fail, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Next steps

- Day-to-day workflow, testing, and conventions: [DEVELOPMENT.md](DEVELOPMENT.md)
- Using the admin dashboard: [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- API reference: [API.md](API.md)
- Deploying to production: [DEPLOYMENT.md](DEPLOYMENT.md)
