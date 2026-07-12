# AV1-Company — Public Site

The public marketing site for AV1-Company: React + TypeScript, Vite, TailwindCSS
v4, Framer Motion, trilingual (Albanian/English/German) via i18next. It's a
separate app from `admin` (the CMS dashboard) and `server` (the API) — same
monorepo, independent build/deploy.

Most content (projects, services, testimonials, FAQs, etc.) still lives in
`src/content/locales/*.json`, not in a database. The **Gallery** is the one
exception — it fetches published images live from `../server`'s API
(`GET /gallery`), so a photo published in the admin dashboard appears here on
the next page load, no rebuild needed. `../server`'s content API is the
foundation for eventually moving every other section onto the same model.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript (strict), Vite 8 |
| Routing | React Router 7, route-level lazy-loading |
| Styling | Tailwind v4, dark mode via a `.dark` class on `<html>` |
| i18n | i18next / react-i18next — `sq` (default), `en`, `de` |
| Animation | Framer Motion, with `prefers-reduced-motion` respected throughout |
| SEO | Per-route `<title>`/meta/canonical/OG/Twitter tags, JSON-LD structured data, `robots.txt` + `sitemap.xml` |

## Getting started

```bash
npm install
cp .env.example .env    # optional for local dev — VITE_API_URL already defaults to localhost:4000
npm run dev              # http://localhost:5173
```

The Gallery page needs `../server` running locally to show real data — see
[Environment variables](#environment-variables) below.

## Project structure

```
src/
├── app/              # router setup, root layout, route-level error boundary
├── assets/            # bundled images (logo)
├── components/
│   ├── ui/              # Button, Container, SectionHeading, LazyImage, EmptyState, ...
│   ├── layout/            # Header, Footer, MobileMenu
│   └── seo/                # PageMeta, JsonLd
├── content/locales/         # sq/en/de JSON — static content (all sections except Gallery)
├── features/                  # one folder per homepage section / domain (hero, gallery, testimonials, ...)
│   └── gallery/                  # the one section that fetches from the API — see useGalleryItems.ts
├── hooks/                       # useDarkMode, useScrolled, useMediaOverlay, ...
├── lib/                          # routes, i18n setup, seo helpers, utils, api.ts (fetch wrapper)
├── pages/                         # route-level page components
└── styles/                         # globals.css (Tailwind entry + theme tokens)
```

Every homepage section follows the same shape: a `features/<name>/` folder
with the section component plus any sub-components it needs, driven by a
matching `content/locales/<locale>/<name>.json` file. Look at `features/faq`
first — it's the simplest complete example.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

## Environment variables

`VITE_API_URL` — base URL of `server`'s API, used only by the Gallery.
Defaults to `http://localhost:4000/api/v1` if unset, so it's optional for
local dev. See [`../ENVIRONMENT_VARIABLES.md`](../ENVIRONMENT_VARIABLES.md).

## Adding or editing content

Every piece of copy **except the Gallery** lives in
`src/content/locales/<locale>/<section>.json` (one file per homepage section,
per language — `sq`/`en`/`de`). Edit all three language files together to
keep them in sync; there's no fallback between languages if a key is missing
in one.

**Gallery images** are managed in the admin dashboard (`../admin`, Gallery
section) — create/edit/publish there, and they appear here automatically via
`GET /gallery`. There's nothing to edit in this app's source for gallery
content; `src/features/gallery/useGalleryItems.ts` fetches and localizes it,
picking the `titleEn`/`titleDe`/`titleSq` (etc.) field matching the current
language.

## Deployment

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) at the repo root — this app
deploys as a static SPA to Vercel. `VITE_API_URL` only needs to be set there
if you want the Gallery to point at a non-default API URL in production.
