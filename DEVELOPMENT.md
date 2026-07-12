# Development Guide

Day-to-day workflow for working on AV1-Company. For first-time setup, see
[INSTALLATION.md](INSTALLATION.md).

## Running everything locally

Four terminals (or a `db:dev` you leave running plus three):

```bash
cd server && npm run db:dev     # if you're not using Docker/a system Postgres
cd server && npm run dev        # http://localhost:4000
cd av1-company && npm run dev   # http://localhost:5173
cd admin && npm run dev         # http://localhost:3000
```

All three dev servers hot-reload: Vite HMR for both frontends, `tsx watch`
for the backend.

## Project conventions

### Backend (`server/`)

Every content resource (Projects, Gallery, Before/After, Videos,
Testimonials, FAQs, Services) follows the exact same layering:

```
validator → repository → service → controller → routes
```

Look at `project.*` first — every other resource is the same shape, just
with different fields. A generic `BaseRepository` (`src/repositories/base.repository.ts`)
backs every entity-specific repository, so CRUD plumbing isn't repeated.

Tests are co-located as `*.test.ts` next to the file they cover (e.g.
`src/services/auth.service.test.ts`), not in a separate `tests/` tree.

### Frontends (`av1-company/`, `admin/`)

Both use a feature-folder structure: `src/features/<name>/` holds everything
specific to one domain area, while `src/components/ui/` holds genuinely
cross-cutting primitives (buttons, inputs, modals, tables).

In `admin`, every resource feature follows the same `*ListPage.tsx` +
`*FormPage.tsx` pair, built on a shared generic `DataTable` and a shared set
of form field components (`TextField`, `LocalizedTextField`, `SwitchField`,
`ImageUploadField`, ...). Look at `features/projects` first.

In `av1-company`, every homepage section is a `features/<name>/` folder
driven by a matching `content/locales/<locale>/<name>.json` file.

### Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for everything else.
- One component per file, file name matches the exported component/function name.
- Backend routes: `/api/v1/<resource>` (public) and `/api/v1/<resource>/admin/...`
  (protected CRUD) — see [API.md](API.md).

## Testing

```bash
cd server && npm test    # Vitest — 57 tests (auth, media, sanitize middleware)
cd admin && npm test     # Vitest + React Testing Library — 25 tests
```

`av1-company` has no test suite — it's a fully static presentational site with
no business logic to unit test; correctness there is verified via `tsc`,
`eslint`, and manual/browser QA (see [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md)).

`admin`'s test stack: Vitest + `@testing-library/react` + `happy-dom`. New
test files go next to the code they test (`Component.test.tsx`). See
`admin/src/test/setup.ts` for the shared RTL cleanup wiring.

## Linting and type-checking

```bash
cd server && npm run typecheck && npm run lint
cd av1-company && npx tsc -b && npm run lint
cd admin && npx tsc -b && npm run lint
```

All three run with TypeScript `strict` mode and zero ESLint warnings as the
baseline — a change that introduces either is not ready to merge.

## Database changes

```bash
cd server
# 1. Edit prisma/schema.prisma
# 2. Create + apply a migration
npx prisma migrate dev --name <short-description>
# 3. Regenerate the typed client (usually automatic after migrate dev)
npx prisma generate
```

Never run `prisma migrate dev` against a production database — use
`prisma migrate deploy` there (see [DEPLOYMENT.md](DEPLOYMENT.md)).

If you add a new content resource, mirror an existing one end-to-end:
Prisma model → validator → repository → service → controller → routes
(backend), then API client module → `*ListPage`/`*FormPage` (admin).

## Working with media uploads locally

Uploads need real Cloudinary credentials to actually store a file — with the
placeholder credentials in `.env.example`, the upload request will reach
Cloudinary and fail there (not a bug in this app). To test uploads for real,
create a free Cloudinary account and set `CLOUDINARY_CLOUD_NAME` /
`CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in `server/.env`.

## Before opening a PR / finishing a change

1. `npm run build` succeeds in every app you touched.
2. `npm run lint` is clean in every app you touched.
3. `npm test` passes in `server`/`admin` if you touched them.
4. No new `console.log`/debug statements, no leftover TODOs describing
   unfinished work.
5. If you touched the public site or admin UI, sanity-check it in a browser —
   static checks don't catch everything (see [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
   and [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if something looks off).
