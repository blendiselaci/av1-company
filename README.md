# AV1-Company

A full-stack platform for AV1-Company, an outdoor landscaping/design company: a
public marketing site, a CMS admin dashboard, and the API that powers both.

**Version 1.0.0 — Release Candidate.** See [CHANGELOG.md](CHANGELOG.md) for what
shipped and [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md) for the production
readiness audit this release is built on.

## Apps

This is a monorepo of three independent apps — each has its own `package.json`,
build, and deploy target. None of them need to run on the same host; the
frontends talk to the backend purely over its public HTTPS URL.

| App | What it is | Stack | Local port | Docs |
| --- | --- | --- | --- | --- |
| [`av1-company/`](av1-company/) | Public marketing site | React 19, Vite, TailwindCSS v4, Framer Motion, i18next (sq/en/de) | 5173 | [av1-company/README.md](av1-company/README.md) |
| [`admin/`](admin/) | CMS admin dashboard | React 19, Vite, TanStack Query, React Hook Form + Zod | 3000 | [admin/README.md](admin/README.md) |
| [`server/`](server/) | REST API | Express 4, TypeScript (strict), Prisma/PostgreSQL, JWT auth | 4000 | [server/README.md](server/README.md) |

## Documentation

| Guide | What it covers |
| --- | --- |
| [INSTALLATION.md](INSTALLATION.md) | First-time setup: prerequisites, install, database, first run |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Day-to-day dev workflow, project conventions, testing, linting |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker, Vercel/Railway/Render/Neon production deployment |
| [API.md](API.md) | Every API endpoint: method, path, auth, request/response shape |
| [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) | Every environment variable, per app, dev vs. production |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Using the admin dashboard — content editing, media, users |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common problems and fixes |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md) | Security/performance/accessibility audit findings |
| [RELEASE_CANDIDATE.md](RELEASE_CANDIDATE.md) | v1.0.0 release readiness report |

## Quick start

```bash
# 1. Install dependencies for all three apps
cd server && npm install && cd ..
cd av1-company && npm install && cd ..
cd admin && npm install && cd ..

# 2. Configure and start the database (see server/README.md for alternatives)
cd server
cp .env.example .env
npm run db:dev              # embedded local Postgres, no Docker/system install needed

# 3. In a second terminal: run migrations, seed, and start the API
cd server
npm run prisma:migrate
npm run seed
npm run dev                 # http://localhost:4000

# 4. In two more terminals: start the frontends
cd av1-company && npm run dev   # http://localhost:5173
cd admin && npm run dev         # http://localhost:3000
```

Log in to the dashboard at http://localhost:3000/login with the seeded admin
account (`admin@av1-company.al` / `ChangeMe123!`). Full walkthrough:
[INSTALLATION.md](INSTALLATION.md).

## Architecture at a glance

```
┌──────────────────┐     ┌──────────────────┐
│  av1-company      │     │  admin            │
│  (public site)    │     │  (CMS dashboard)  │
│  static content   │     │  JWT-authenticated │
└──────────────────┘     └─────────┬─────────┘
                                     │ REST (JSON)
                                     ▼
                          ┌───────────────────┐
                          │  server             │
                          │  Express + Prisma    │
                          │  controller→service→ │
                          │  repository layering  │
                          └─────────┬───────────┘
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                            ▼
              ┌─────────────────┐         ┌──────────────────┐
              │  PostgreSQL       │         │  Cloudinary        │
              │  (Prisma ORM)      │         │  (media storage)    │
              └─────────────────┘         └──────────────────┘
```

`av1-company` is currently a fully static site — it reads content from local
JSON files (`src/content/locales/*.json`), not from the API. `server` is the
foundation for eventually serving that same content dynamically; `admin`
already manages that data live today.

## License

Private, unpublished. All rights reserved.
