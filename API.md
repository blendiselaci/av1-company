# API Documentation

Base URL: `http://localhost:4000/api/v1` (dev) — see
[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for production.

`GET /health` is the one exception — it lives outside `/api/v1` (see
[Health check](#health-check)).

## Response envelope

Every response uses the same shape:

```jsonc
// success
{ "success": true, "data": /* object or array */, "meta": /* only on list endpoints */ }

// list endpoint meta
{ "page": 1, "limit": 20, "total": 42, "totalPages": 3 }

// error
{ "success": false, "message": "Human-readable message", "errors": /* optional, e.g. Zod field errors */ }
```

Status codes: `200` (read/update/list), `201` (create), `204`/`200` with a
`{ message }` body (delete), `400` (bad request), `401` (not authenticated),
`403` (authenticated but wrong role), `404` (not found), `409` (conflict —
e.g. duplicate email), `422` (validation failed), `429` (rate limited), `500`
(unexpected error).

## Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | none | `{ email, password }` → `{ accessToken, user }` + sets refresh-token cookie |
| POST | `/auth/refresh` | refresh cookie | Rotates the refresh token, returns a new `{ accessToken, user }` |
| POST | `/auth/logout` | none | Revokes the current refresh token, clears the cookie |
| GET | `/auth/me` | Bearer token | Returns the current user |

- Access token: short-lived JWT, returned in the response body, sent back as
  `Authorization: Bearer <token>`.
- Refresh token: longer-lived JWT, set as an `httpOnly`, signed,
  `SameSite=Lax` cookie scoped to `/api/v1/auth` — never touches client-side
  JavaScript. Every refresh **rotates** the token (old one revoked, new one
  issued, atomically).
- Roles: `ADMIN`, `EDITOR`. No public self-registration — accounts are
  created via the seed script or the Users API (ADMIN only).

Full design details: [server/README.md § Authentication](server/README.md#authentication).

## Content resources

Every content resource follows the same pattern — two tiers under one router:

- **Public** (`GET /api/v1/<resource>`, and `GET /api/v1/<resource>/:id` where
  noted): no auth required, always scoped to `isPublished: true` regardless of
  query params. This is what the public site would fetch from.
- **Admin** (`/api/v1/<resource>/admin/...`): requires `Authorization: Bearer
  <accessToken>` with role `ADMIN` or `EDITOR` (unless noted otherwise). Full
  CRUD, sees unpublished/draft content too.

List endpoints (both tiers) accept `page` and `limit` query params, plus
`category`/`search` where the resource supports them, and return the list
envelope shown above.

| Resource | Base path | Public `GET /:id`? | Admin CRUD | Extra query params |
| --- | --- | --- | --- | --- |
| Projects | `/projects` | yes | full | `category` |
| Gallery | `/gallery` | yes | full | `category` |
| Before/After | `/before-after` | yes | full | `category` |
| Videos | `/videos` | yes | full | `category` |
| Testimonials | `/testimonials` | no | full | — |
| FAQs | `/faqs` | no | full | — |
| Services | `/services` | no | full | — |
| Settings | `/settings` | n/a (single record) | update only (`PATCH /settings/admin`) | — |
| Contact Messages | `/contact-messages` | write-only (`POST /`, public) | full (list/get/update status/delete) | `status` |
| Users | `/users` | n/a | full, **ADMIN only** (EDITOR cannot access) | — |

Admin CRUD, for every resource marked "full" above:

```
GET    /api/v1/<resource>/admin           list (all statuses, paginated)
GET    /api/v1/<resource>/admin/:id       get one
POST   /api/v1/<resource>/admin           create        → 201
PATCH  /api/v1/<resource>/admin/:id       update
DELETE /api/v1/<resource>/admin/:id       delete         → { message }
```

Every `POST`/`PATCH` body is validated against a per-resource Zod schema
(`server/src/validators/<resource>.validator.ts`) and passed through HTML
sanitization (`sanitizeBody` — strips tags from every string field except
`password`) before it reaches the validator.

### Contact Messages — the one asymmetric resource

```
POST   /api/v1/contact-messages                  public, rate-limited — the site's contact form posts here
GET    /api/v1/contact-messages/admin            list (ADMIN/EDITOR)
GET    /api/v1/contact-messages/admin/:id        get one
PATCH  /api/v1/contact-messages/admin/:id/status  update status only ("NEW" | "READ" | "ARCHIVED")
DELETE /api/v1/contact-messages/admin/:id        delete
```

### Settings — a singleton, not a list

```
GET    /api/v1/settings          public — business info (name, phone, email, address, hours, social links)
PATCH  /api/v1/settings/admin    ADMIN/EDITOR — update the one Settings record
```

### Users — ADMIN only, including read

```
GET    /api/v1/users             list
GET    /api/v1/users/:id         get one
POST   /api/v1/users             create      → 201
PATCH  /api/v1/users/:id         update (name/password/role/isActive)
DELETE /api/v1/users/:id         delete
```

Every route in this router requires role `ADMIN` specifically — an `EDITOR`
gets a `403` on all of them.

## Media

```
GET    /api/v1/media                  list (ADMIN/EDITOR), optional ?category=
GET    /api/v1/media/:id              get one (ADMIN/EDITOR)
POST   /api/v1/media/upload           upload one file (ADMIN/EDITOR)
POST   /api/v1/media/upload/multiple  upload up to 10 files at once (ADMIN/EDITOR)
PUT    /api/v1/media/:id/replace      replace the file on an existing Media row in place (ADMIN/EDITOR)
DELETE /api/v1/media/:id              permanently delete (ADMIN only)
```

- `POST /upload` and `/upload/multiple` are `multipart/form-data`: a `file`
  (or `files[]`) field plus a `category` field (one of `PROJECT_COVER`,
  `GALLERY`, `BEFORE_AFTER`, `SERVICE`, `TESTIMONIAL_AVATAR`, `VIDEO`,
  `VIDEO_THUMBNAIL`).
- 25MB file size limit; allowed MIME types: `image/jpeg`, `png`, `webp`,
  `avif`, `gif`, `video/mp4`, `webm`, `quicktime`.
- Every response includes a `variants` object (`thumbnail`/`medium`/`original`)
  — Cloudinary transformation URLs, no extra network call.
- Attaching an uploaded asset to content is a separate step: upload via
  `/media` to get `{ url, publicId }`, then set those fields on the content
  record itself (e.g. `PATCH /projects/admin/:id` with `{ image,
  imagePublicId }`).

Full design details: [server/README.md § Media management](server/README.md#media-management).

## Health check

```
GET /health
```

Outside `/api/v1`, no auth. Pings the database with `SELECT 1`.

```jsonc
{ "status": "ok", "uptime": 42.1, "environment": "development", "version": "1.0.0", "database": "connected", "timestamp": "..." }
```

Returns `200` with `status: "ok"` when the database is reachable, or `503`
with `status: "degraded"` and `database: "disconnected"` otherwise — the
status code is the primary signal for load balancers/uptime monitors, so this
response is not wrapped in the usual `{ success, data }` envelope.

## Rate limiting

| Scope | Window | Max requests |
| --- | --- | --- |
| General API | 15 min (`RATE_LIMIT_WINDOW_MS`) | 300 (`RATE_LIMIT_MAX`) |
| `/auth/login`, `/auth/refresh` | 15 min | 10 (`AUTH_RATE_LIMIT_MAX`) |
| `POST /contact-messages` (public form) | 15 min | separate, stricter limiter |

## Error responses

All errors — thrown application errors, Zod validation failures, and Prisma
constraint violations — come back in the same envelope shape with the
appropriate status code:

```jsonc
// 422 — Zod validation failure
{ "success": false, "message": "Validation failed", "errors": { "email": ["Invalid email"] } }

// 401 — missing/invalid/expired token
{ "success": false, "message": "Unauthorized" }

// 403 — wrong role
{ "success": false, "message": "Forbidden" }

// 404
{ "success": false, "message": "Project not found" }
```

## Field-level request/response shapes

Exact field names per resource are defined in two places, kept in sync:

- `server/prisma/schema.prisma` — the source of truth for every model's fields.
- `server/src/validators/<resource>.validator.ts` — the Zod schema for what a
  create/update request body accepts (a subset/transform of the model).

This document intentionally doesn't restate every field for all ten
resources — it would drift from those two files immediately. Read the
resource's Prisma model + validator together; they're short and consistently
shaped (every resource carries `titleEn`/`titleDe`/`titleSq`-style localized
trios where content is translatable, plus `isPublished`, `order`, and
timestamps).
