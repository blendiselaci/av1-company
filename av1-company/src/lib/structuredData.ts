import { COMPANY_INFO, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, SOCIAL_LINKS, absoluteUrl } from '@/lib/seo'

// Real service categories offered — kept in sync with the copy in
// content/locales/*/seo.json's "services" description.
const BUSINESS_SERVICES = [
  'Garden Design',
  'Hardscaping & Paving',
  'Pool Construction',
  'Terrace & Outdoor Living Spaces',
  'Greenery Maintenance',
]

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY_INFO.phone,
      email: COMPANY_INFO.email,
      contactType: 'customer service',
      areaServed: 'AL',
      availableLanguage: ['sq', 'en', 'de'],
    },
  }
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: SITE_NAME,
    description:
      'Premium landscaping and outdoor design studio in Kosovo — gardens, pools, terraces and outdoor living spaces.',
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Landscaping Services',
      itemListElement: BUSINESS_SERVICES.map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
    ...(SOCIAL_LINKS.length > 0 ? { sameAs: SOCIAL_LINKS } : {}),
  }
}

interface GalleryImageEntry {
  url: string
  title: string
  description?: string
}

/** ImageGallery + associatedMedia ImageObject list for image-heavy pages
 *  (currently the Gallery page) — helps images surface in Google Image
 *  search / rich results. */
export function buildImageGallerySchema(name: string, description: string, images: GalleryImageEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    description,
    url: absoluteUrl('/galeria'),
    associatedMedia: images.map((image) => ({
      '@type': 'ImageObject',
      contentUrl: image.url,
      name: image.title,
      ...(image.description ? { description: image.description } : {}),
    })),
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

interface BreadcrumbEntry {
  name: string
  path: string
}

export function buildBreadcrumbSchema(items: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
