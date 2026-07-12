import logoImage from '@/assets/logo-av1.jpg'

// TODO: replace with the real production domain before launch.
export const SITE_URL = 'https://www.av1-company.al'
export const SITE_NAME = 'AV1-Company'

// Vite resolves this to the built asset's public URL, so the OG image tag
// always points at a real, working file instead of a made-up path.
export const DEFAULT_OG_IMAGE = `${SITE_URL}${logoImage}`

// Keep in sync with lib/i18n.ts's configured languages.
export const SUPPORTED_LOCALES = ['sq', 'en', 'de'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const OG_LOCALE_MAP: Record<string, string> = {
  sq: 'sq_AL',
  en: 'en_US',
  de: 'de_DE',
}

// Placeholder business details — swap for the real registered contact info before launch.
export const COMPANY_INFO = {
  phone: '+355691234567',
  phoneDisplay: '+355 69 123 4567',
  email: 'info@av1-company.al',
  streetAddress: 'Rruga e Kavajës',
  addressLocality: 'Tirana',
  postalCode: '1001',
  addressCountry: 'AL',
} as const

// Real social profile URLs, once created — populates LocalBusiness `sameAs` in
// structuredData.ts. Left empty rather than filled with placeholder links.
export const SOCIAL_LINKS: readonly string[] = []

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}
