# AV1-Company — Production Deployment Guide

A condensed, launch-day checklist. For full detail on any step (Docker
alternative, self-hosting, troubleshooting), see [DEPLOYMENT.md](DEPLOYMENT.md).

## 1. Environment variables

### Frontend — `av1-company/` (public site)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | No | Falls back to `http://localhost:4000/api/v1`. Set to `https://api.yourdomain.com/api/v1` in production. |
| `VITE_WHATSAPP_NUMBER` | No | Digits only, country code first, no `+`. Falls back to the placeholder number in `src/lib/seo.ts` — **set a real number before launch**. |
| `VITE_GA_MEASUREMENT_ID` | No | Google Analytics 4 ID. Analytics stays fully inert until set. |

### Frontend — `admin/` (dashboard)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes (prod) | No fallback — must point at the real backend URL. |

### Backend — `server/`

All required in production; see `server/.env.example` for the full commented list.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon (or other Postgres) connection string — use the **direct**, non-pooled variant. |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` | Generate distinct random values: `openssl rand -hex 64`. **The app refuses to boot in production if any of these are still placeholders.** |
| `CORS_ORIGIN` | Comma-separated real frontend origins, no trailing slash. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Real Cloudinary account credentials — placeholders make uploads fail cleanly but everything else still works. |
| `SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD` | Set a strong temporary password, **rotate immediately after first seed**. |
| `EMAIL_PROVIDER` | Stays `none` (logs only) until a real provider (`resend`/`smtp`) is wired — contact form still saves to the database either way. |

## 2. Deploy the backend

1. Provision Postgres on [Neon](https://neon.tech) — copy the **direct** connection string.
2. Deploy `server/` to [Railway](https://railway.app) or [Render](https://render.com) (both already have config files committed: `railway.json` / `render.yaml`). Root directory = `server`.
3. Set every env var from the table above with real values.
4. Deploy, then run the one-time migration manually (not an auto pre-deploy hook):
   ```bash
   npx prisma migrate deploy
   ```
5. Verify: `curl https://your-api-domain/health` → `"database": "connected"`.

## 3. Deploy the frontends

1. Two separate [Vercel](https://vercel.com) projects, same GitHub repo — root directory `av1-company` and `admin` respectively. Both already have `vercel.json` committed (SPA rewrites, security headers).
2. Set `VITE_API_URL` on both to the backend's real URL.
3. Deploy both, note the resulting URLs.
4. Go back to the backend and set `CORS_ORIGIN` to those two real origins, redeploy.

## 4. Configure the database

- Migrations: `npx prisma migrate deploy` (production) — never `migrate dev` against production.
- First-time data: `npm run seed` (idempotent — safe to re-run) creates the admin/editor accounts and demo content. **Delete or replace the demo Projects/Gallery/Testimonials/FAQs through the admin panel before going live** — they currently point at placeholder image URLs.
- After the first seed: rotate `SEED_ADMIN_PASSWORD` / `SEED_EDITOR_PASSWORD`, either by re-seeding with new values or changing them via the dashboard's Users page.

## 5. Configure the domain

1. Add your domain in each Vercel project (Settings → Domains) — one for the public site, one for the admin dashboard (e.g. a subdomain like `admin.yourdomain.com`).
2. Add the custom domain on Railway/Render for the API (e.g. `api.yourdomain.com`).
3. Update `CORS_ORIGIN` on the backend to the real domains (not the `*.vercel.app` preview URLs), redeploy.
4. Update `VITE_API_URL` on both frontends to the real API domain, redeploy.
5. Update `SITE_URL` in `av1-company/src/lib/seo.ts` to the real domain — it feeds canonical URLs, Open Graph tags, and JSON-LD structured data.

## 6. Cloudinary storage

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy Cloud Name / API Key / API Secret from the dashboard into the backend's env vars.
3. No code changes needed — every upload already targets whatever these three env vars point at.

## 7. Final pre-launch checks

- [ ] Real Cloudinary credentials set (not placeholders)
- [ ] Real `SITE_URL`, phone number (`VITE_WHATSAPP_NUMBER` / `COMPANY_INFO.phone`), and social links filled in
- [ ] Seed/demo content replaced with real content via the admin panel
- [ ] `SEED_ADMIN_PASSWORD` / `SEED_EDITOR_PASSWORD` rotated
- [ ] `CORS_ORIGIN` set to real production domains only
- [ ] `NODE_ENV=production` on the backend
- [ ] `curl https://api-domain/health` returns `"database": "connected"`
- [ ] Test the contact form and WhatsApp button on the live domain
