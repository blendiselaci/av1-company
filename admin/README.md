# AV1-Company Admin

The CMS admin dashboard for the AV1-Company marketing site: React + TypeScript,
TailwindCSS, React Router, Framer Motion, TanStack Query, React Hook Form + Zod.
It's a separate app from `av1-company` (the public site) and `server` (the API) —
same monorepo, independent build/deploy, so there's zero risk of this dashboard's
code ever shipping to public visitors.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript (strict), Vite 8 |
| Routing | React Router 7, route-level lazy-loading |
| Styling | Tailwind v4, brand palette + dark mode mirrored from the public site |
| Server state | TanStack Query (caching, pagination, mutations) |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Animation | Framer Motion (modals, mobile sidebar, toasts) |
| Auth | In-memory access token + httpOnly refresh cookie, silent refresh on boot, 401-triggered refresh-and-retry |

## Getting started

```bash
npm install
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:4000/api/v1
npm run dev                 # http://localhost:3000
```

Requires the `server` API running (see `../server/README.md`) — this app has no
data or auth logic of its own beyond the API client.

## Project structure

```
src/
├── api/            # axios client + typed endpoint modules (one per resource, plus a generic factory)
├── auth/           # AuthProvider, ProtectedRoute, RoleGuard
├── components/
│   ├── ui/           # Button, Input, Select, Modal, Toast, Skeleton, EmptyState, ErrorState, ...
│   ├── layout/        # DashboardLayout, Sidebar (desktop + mobile), Topbar, Breadcrumbs, UserMenu
│   ├── table/          # DataTable — one generic, config-driven table for every resource
│   ├── form/             # TextField, LocalizedTextField (En/De/Sq trio), SelectField, SwitchField, ...
│   └── media/              # ImageUploadField, MultiImageUploadField, VideoUploadField
├── features/         # one folder per resource: a ListPage + FormPage pair
├── hooks/              # useDarkMode, useConfirm, useToast, useOnClickOutside, useModalA11y
├── pages/               # LoginPage, UnauthorizedPage, NotFoundPage
├── types/                # models.ts (mirrors backend Prisma models), api.ts (envelope shapes)
└── App.tsx                # routes, lazily-loaded
```

Every resource feature follows the same shape: a `*ListPage.tsx` (DataTable +
filters + bulk delete) and a `*FormPage.tsx` (React Hook Form + Zod, shared field
components). Look at `features/projects` first — every other resource is the
same pattern with different fields.

## Authentication

- The access token lives in memory only (never `localStorage`) — it's attached
  to every request via an axios interceptor and is gone on a hard refresh by
  design, since the refresh token (httpOnly, signed cookie, set by the API) is
  the thing that's actually meant to persist a session.
- On boot, `AuthProvider` calls `POST /auth/refresh` once, silently. If the
  cookie is still valid, the user is signed back in without seeing the login
  screen; if not, they land on `/login`.
- Any request that gets a 401 triggers one shared refresh-and-retry (concurrent
  401s all await the same in-flight refresh, so a burst of requests right after
  token expiry doesn't fire a refresh storm). If the refresh itself fails, every
  page redirects to `/login`.
- `ProtectedRoute` gates the whole dashboard; `RoleGuard` additionally restricts
  `/users/*` to `ADMIN`.

## Scope decisions made building this

The brief said the backend/auth/media system were already complete and this
turn was frontend-only. Two real gaps blocked named requirements, so two small,
additive backend changes were made (both new files, neither touches the
existing auth module):

- **`GET/POST/PATCH/DELETE /api/v1/users`** (ADMIN-only) — didn't exist at all;
  the "Users (ADMIN only)" sidebar item needed something to call.
- **Profile** stays read-only (name/email/role/member-since via the existing
  `GET /auth/me`) — there's no update-own-profile or change-password endpoint,
  and adding one felt like it crossed from "fill an obvious gap" into "extend
  the auth module," which the brief explicitly said was done.

A few other honest scope boundaries, so nothing here overclaims:

- **Search and column sorting in `DataTable` are client-side**, over whatever
  page is currently loaded. The backend's list endpoints don't expose a sort
  parameter (they always order by `order`/`createdAt`), and not every
  resource's query schema accepts `search`. Pagination and the category/status
  filter dropdowns are real server-side calls.
- **"Delete image" only detaches the image from the record being edited** — it
  clears the field, it doesn't call the media library's permanent-delete
  endpoint. That endpoint (`DELETE /api/v1/media/:id`) is ADMIN-only, but
  uploading/replacing images on a record is ADMIN **and** EDITOR — so a delete
  button wired to that endpoint would 403 for half of this dashboard's users
  the moment they tried to clear an optional image field. The asset is
  orphaned in Cloudinary rather than deleted, which is the same trade-off the
  backend's own `replaceAsset` already makes elsewhere (best-effort cleanup,
  not a hard guarantee).
- **"Homepage content" isn't editable from Settings.** The `Settings` model
  only covers business info (name/phone/email/address/hours/social links) —
  the public site's homepage copy still lives in `av1-company`'s static locale
  JSON files, not in the database. Editing that would mean designing new
  backend fields for arbitrary page content, which is a real feature, not a
  gap-fill.
- **Media replace vs. delete-then-upload:** `ImageUploadField` calls the
  in-place `PUT /media/:id/replace` endpoint when it knows the asset's Media
  id (i.e. it was uploaded through this dashboard), and falls back to a plain
  new upload when it doesn't (e.g. editing a seed-data record whose image
  predates the media library). Both give the same result to the user — a new
  image replaces the old one in the form — just via a different API call.

## Verification

`npm run build` (`tsc -b && vite build`) and `npm run lint` are clean. Browser-
verified: unauthenticated redirect to `/login`, client-side Zod validation,
network-error handling on a failed login (shows an inline error, resets the
loading state, doesn't hang), dark mode (fixed during this pass — see below),
mobile-width layout, and the 404 catch-all.

**What isn't verified**: a real authenticated session. This sandbox has no
PostgreSQL instance, so the API can't actually start against a live database
(confirmed — `npm run dev` in `../server` fails at boot with a connection
error). Every page that talks to the API (all of them past `/login`) is
implemented against the real endpoints and typechecked against the real
response shapes, but hasn't been exercised end-to-end with real data. Once a
database is available: `cd ../server && npm run prisma:migrate && npm run seed`
gives you `admin@av1-company.al` / `ChangeMe123!` to sign in with.

**Bug found and fixed during verification:** dark mode was only ever applied
by an effect inside `Topbar`, so `/login` (and any route rendered before the
dashboard layout mounts) always ignored the stored/system theme preference and
rendered light regardless. Fixed by applying the theme class synchronously in
`main.tsx` before React mounts (`applyInitialTheme()` in `hooks/useDarkMode.ts`),
so every route reflects the correct theme from first paint.
