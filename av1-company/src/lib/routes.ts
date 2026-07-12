import type { NavItem } from '@/types'

export const ROUTES = {
  home: '/',
  about: '/rreth-nesh',
  services: '/sherbimet',
  projects: '/projektet',
  transformations: '/transformimet',
  gallery: '/galeria',
  video: '/video',
  contact: '/kontakt',
  privacy: '/politika-e-privatesise',
} as const

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', path: ROUTES.home },
  { labelKey: 'nav.about', path: ROUTES.about },
  { labelKey: 'nav.services', path: ROUTES.services },
  { labelKey: 'nav.projects', path: ROUTES.projects },
  { labelKey: 'nav.transformations', path: ROUTES.transformations },
  { labelKey: 'nav.gallery', path: ROUTES.gallery },
  { labelKey: 'nav.video', path: ROUTES.video },
  { labelKey: 'nav.contact', path: ROUTES.contact },
]

/** Primary header navigation — a curated subset of NAV_ITEMS (footer keeps the full site map). */
export const HEADER_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', path: ROUTES.home },
  { labelKey: 'nav.about', path: ROUTES.about },
  { labelKey: 'nav.services', path: ROUTES.services },
  { labelKey: 'nav.projects', path: ROUTES.projects },
  { labelKey: 'nav.gallery', path: ROUTES.gallery },
  { labelKey: 'nav.contact', path: ROUTES.contact },
]
