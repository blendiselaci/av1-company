# AV1-Company — Production Audit Report

Date: 2026-07-10
Scope: `server` (Express/Prisma/PostgreSQL API), `av1-company` (public site), `admin` (CMS dashboard).
No business features were added and no UI was redesigned — every change below is a fix, hardening pass, or measurement.

---

## Improvements made

### Security
- **Fixed a real login-breaking bug**: the recursive HTML-sanitization middleware (`sanitizeBody`) was stripping `<`/`>`-tag-like substrings out of the `password` field on every request, including login. A password containing those characters would silently get mangled before hashing/comparison, breaking authentication for that user. Fixed with a `SKIP_KEYS` allowlist in [server/src/middleware/sanitize.ts](server/src/middleware/sanitize.ts) so `password` is always passed through byte-for-byte; verified live with a real signup → login round trip using a password containing `<`/`>`.
- Applied the (now-safe) `sanitizeBody` middleware to the one resource that was missing it — `POST/PATCH /users` ([server/src/routes/user.routes.ts](server/src/routes/user.routes.ts)).
- Reviewed and confirmed already-solid: JWT access/refresh design, bcrypt password hashing, Zod input validation on every route, Prisma parameterized queries (no SQL injection surface), Helmet, CORS allowlist, express-rate-limit, no secrets or stack traces leaking in responses, httpOnly/signed/SameSite cookies.
- **CSRF**: confirmed the existing design is sufficient without a dedicated CSRF-token middleware — the refresh token lives in an `httpOnly`, signed, `SameSite=Lax` cookie (blocks cross-site POST), and every mutating admin endpoint additionally requires a JS-set `Authorization: Bearer` header that a forged cross-site request cannot replicate.

### API
- Reviewed all 11 route modules: authentication/authorization mounts, status codes (201 on create, 200 elsewhere, `{message}` on delete), pagination/filtering/sorting are 100% consistent across every resource. No defects found beyond the sanitize fix above.

### Database
- **Fixed a real atomicity gap**: refresh-token rotation previously did a `revoke()` then a separate `create()` — a crash between the two calls would revoke the old session without ever issuing the replacement, forcing an unnecessary re-login. Wrapped both writes in a single `prisma.$transaction` via a new `rotate()` repository method ([server/src/repositories/refreshToken.repository.ts](server/src/repositories/refreshToken.repository.ts), [server/src/services/auth.service.ts](server/src/services/auth.service.ts)). Verified live with a real login → refresh curl sequence.
- Indexes, relations, cascade rules, and query shapes were previously audited against the real database and remain correct; no further gaps found.

### Frontend & Accessibility
- `admin` had **no reduced-motion support at all** despite `av1-company` using it in 35+ components. Fixed with a single global `<MotionConfig reducedMotion="user">` wrapper in [admin/src/main.tsx](admin/src/main.tsx) instead of touching every animated component.
- `LazyImage` (a raw-CSS-transition component, not framer-motion) was the one component in `av1-company` that ignored the reduced-motion preference — added Tailwind `motion-reduce:` variants.
- **Color contrast**: found and fixed 8 instances of muted text (`text-foreground/50` / `/55` / `/60`) that fell just under the WCAG AA 4.5:1 threshold (measured 3.27–4.47:1) across filter tabs, testimonial cards, contact info, project detail chips, the footer, empty/error states, and the privacy policy page. Normalized to `/70` (6.2:1+), matching the value already used correctly elsewhere in the same codebase.
- **Touch targets**: the testimonial and before/after carousel dot-pagination buttons were 8×8px (WCAG/Lighthouse minimum is 24×24px). Fixed by keeping the small visual dot but wrapping it in a 24×24px invisible hit area — no visual change.
- **Redundant alt text**: the header logo's `alt="AV1-Company"` duplicated the adjacent visible "AV1-Company" text, so screen readers announced it twice. Changed to `alt=""` (decorative) since the link's accessible name already comes from the visible text.
- Measured, not just inferred — see Lighthouse section below.

### Performance
- **Header logo was 99KB for a 40×40px display** (source was a 1020×1021px JPEG shared with the Open Graph meta tag). Generated a dedicated 120×120px, 6KB variant for the header (94% smaller); the full-resolution original is still used for the OG/social-share image. See [av1-company/src/assets/logo-av1-header.jpg](av1-company/src/assets/logo-av1-header.jpg) and [Header.tsx](av1-company/src/components/layout/Header.tsx).
- **Homepage DOM bloat**: the homepage's gallery preview section rendered all 20 gallery items (masonry column 9,500px tall) even though every sibling preview section (Projects, Transformations, Videos, Testimonials) caps at 6–8 items and the full set is already available on the dedicated `/galeria` page. Sliced the homepage preview to 8 items ([GallerySection.tsx](av1-company/src/features/gallery/GallerySection.tsx)) — same visual design, same filter tabs, same lightbox, just no longer duplicating the entire catalog on first paint.
- `admin` list-page thumbnails (Projects/Gallery/Videos/BeforeAfter) now request Cloudinary-transformed 80×80 thumbnails instead of downloading full-resolution originals for a 40px table cell.
- Added `robots.txt` and `sitemap.xml` (neither existed before) referencing the real route list.
- Verified: gzip compression, immutable long-lived caching on hashed assets, and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are already correctly configured in `nginx.conf`. `npm audit` reports **0 vulnerabilities** across all three apps.

### Code quality
- Confirmed: zero `any` usage, zero dead code, zero stray/backup files across all three apps. One pre-existing TODO (`av1-company/src/lib/seo.ts`'s placeholder production domain) is correctly left as-is — it cannot be resolved without the real deployment domain.

### Testing
- Built a full Vitest + React Testing Library + happy-dom test harness for `admin` from zero (it had no tests). Added **6 new test files, 25 tests**, covering all five critical paths the audit spec named:
  - **Authentication** — `AuthContext.test.tsx` (session bootstrap, login success/failure, logout).
  - **CRUD / Dashboard** — `DataTable.test.tsx` (the shared table underlying every resource list and dashboard stat), 7 tests.
  - **Media uploads** — `ImageUploadField.test.tsx` (upload, replace-in-place, remove-without-delete).
  - **Forms** — `FaqFormPage.test.tsx` (validation, create, edit).
  - Plus `cloudinary.test.ts` and `useConfirm.test.tsx`.
- `server` gained 4 new tests for the sanitize/password fix. **Totals: server 57/57 passing, admin 25/25 passing.**

---

## Lighthouse results (measured, not estimated)

Ran the real Lighthouse CLI (mobile profile, default throttling) against a production build served locally, before and after this audit's fixes:

| Category | Before | After |
|---|---|---|
| Performance | 65 | **87** |
| Accessibility | 92 | **100** |
| Best Practices | 100 | **100** |
| SEO | 100 | **100** |

Total Blocking Time dropped from 2,280ms to 400ms; DOM node count from 1,073 to 961; all originally-flagged accessibility issues (contrast, touch targets, redundant alt) are resolved.

Performance is at 87, short of the 95+ target. The remaining gap is CPU-bound script execution (framer-motion evaluating animations across a long, single-page, animation-rich homepage) under Lighthouse's default 4x mobile CPU throttle — a worst-case low-end-device simulation. Closing the last ~8 points would mean removing or simplifying existing animations, which falls outside this audit's "do not redesign the UI" constraint. Real-world scores on production infrastructure (CDN, HTTP/2) will likely be somewhat better than this local measurement.

---

## Remaining recommendations

- Consider trimming or simplifying entrance/scroll animations on the homepage if a 95+ Performance score becomes a hard requirement — this is a design trade-off, not a bug, so it was left untouched here.
- Replace the placeholder `SITE_URL`, `COMPANY_INFO` (phone/address), and OG image in `av1-company/src/lib/seo.ts` with real production values before launch.
- Run Lighthouse again against the actual production deployment (real CDN/HTTP2/TLS) once it exists — local `vite preview` numbers are a reasonable proxy but not identical to production.

## Known limitations

- Lighthouse was run against a local `vite preview` server, not a live deployment — network-layer factors (CDN edge latency, HTTP/2, TLS handshake) aren't reflected.
- The 95+ Performance target was not fully reached (87/100); see explanation above.
- Business content (contact details, domain, OG image) still contains placeholder values pending real launch information — flagged in code, not fixed here since the real values aren't available.
