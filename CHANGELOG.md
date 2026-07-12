# Changelog

All notable changes to the AV1-Company project are documented in this file.

## [1.0.0] — 2026-07-10

First production release candidate. AV1-Company is a full-stack landscaping/outdoor-design company platform: a public marketing site, a headless CMS admin dashboard, and the Express/PostgreSQL API that powers both.

### Public website (`av1-company`)

- Full one-page marketing site (Hero, About, Company Stats, Services, Projects, Before/After transformations, Gallery, Video showcase, Testimonials, Trust signals, FAQ, CTA, Contact) plus dedicated `/projektet`, `/transformimet`, `/galeria`, `/video`, `/sherbimet`, `/kontakt`, `/rreth-nesh`, `/politika-e-privatesise` routes.
- Trilingual content (Albanian, English, German) via i18next, with a language switcher.
- Dark mode with system-preference detection and manual toggle.
- Full SEO layer: per-route `<title>`/meta/canonical/Open Graph/Twitter tags, JSON-LD structured data, `robots.txt`, `sitemap.xml`.
- Route-level code splitting and lazy loading; masonry gallery with lightbox; before/after image slider; video modal.
- Accessibility: skip link, semantic landmarks, keyboard navigation, ARIA labeling, WCAG AA color contrast, `prefers-reduced-motion` support throughout, 24×24px minimum touch targets.
- Measured Lighthouse scores (production build, mobile profile): Performance 87, Accessibility 100, Best Practices 100, SEO 100.

### Admin dashboard (`admin`)

- Full CMS for every public-site content type: Projects, Gallery, Before/After Transformations, Videos, Services, Testimonials, FAQs, Contact Messages, Settings, and Users (ADMIN-only).
- JWT authentication (access + refresh token rotation) with role-based access control (ADMIN / EDITOR).
- Generic, reusable `DataTable` (search, sort, pagination, bulk delete) and form system (React Hook Form + Zod) shared across every resource.
- Image upload widgets backed by Cloudinary: upload-on-select, in-place replace, non-destructive remove.
- Dashboard home with live content counts; profile page for self-service password/name changes.
- Full keyboard/reduced-motion/contrast accessibility parity with the public site.
- Automated test suite: 25 tests covering authentication, CRUD/table behavior, media uploads, and form validation.

### Backend API (`server`)

- Express + TypeScript + Prisma/PostgreSQL, organized in a strict controller → service → repository layering with a generic base repository shared across all ten content resources.
- JWT access/refresh authentication with atomic (transactional) refresh-token rotation; bcrypt password hashing.
- Zod request validation, Helmet, CORS allowlist, rate limiting, HTML sanitization (XSS defense-in-depth) on every mutating endpoint, secure `httpOnly`/signed/`SameSite` cookies.
- Cloudinary-backed media module (upload, replace, optimized URL generation) shared by every content type that carries images.
- Structured JSON logging, gzip compression, and a `/health` endpoint reporting DB connectivity, uptime, environment, and version.
- 57 automated tests (Vitest) covering auth, media, and the sanitize/security middleware.
- Zero `npm audit` vulnerabilities.

### Database

- PostgreSQL via Prisma: 10 content models plus Users, RefreshTokens, and ContactMessages, with indexes, cascade rules, and constraints reviewed for correctness.
- Idempotent seed script (ADMIN + EDITOR accounts, sample content).

### DevOps & deployment

- Dockerfiles for all three apps plus a multi-service `docker-compose.yml` (dev) and `docker-compose.prod.yml`, fronted by nginx (gzip, immutable asset caching, security headers, SPA fallback routing).
- Deployment configs for Vercel (frontends), Railway/Render (API), and Neon (managed Postgres).
- Environment variables fully separated between development and production, documented in per-app `.env.example` files.

### Quality

- Zero TypeScript errors, zero ESLint warnings, and zero `any` usage across all three apps, with `strict` mode enabled in every `tsconfig`.
- Two full production audit passes covering security, API contracts, database integrity, frontend/accessibility/performance review, and dead-code cleanup — see [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md).
