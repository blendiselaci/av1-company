import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_OG_IMAGE, OG_LOCALE_MAP, SITE_NAME, SUPPORTED_LOCALES, absoluteUrl } from '@/lib/seo'

interface PageMetaProps {
  title: string
  description: string
  keywords?: string
  image?: string
  noIndex?: boolean
}

/**
 * Per-route <title>/<meta>/<link> tags. React 19 hoists any of these rendered
 * anywhere in the tree into <head> automatically (deduped by tag + key attrs),
 * so this can simply be dropped at the top of each page component — no
 * head-management library needed.
 *
 * Language alternates: every locale renders the same URL (language is a
 * client-side switch, not a routed path — see lib/i18n.ts), so hreflang here
 * is intentionally self-referencing for all three locales plus x-default.
 * That's still a correct, honest signal to crawlers ("this URL is available
 * in sq/en/de") without requiring a localized-routing rearchitecture.
 */
export function PageMeta({ title, description, keywords, image = DEFAULT_OG_IMAGE, noIndex = false }: PageMetaProps) {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const url = absoluteUrl(pathname)

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {SUPPORTED_LOCALES.map((locale) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={OG_LOCALE_MAP[i18n.language] ?? OG_LOCALE_MAP.sq} />
      {SUPPORTED_LOCALES.filter((locale) => locale !== i18n.language).map((locale) => (
        <meta key={locale} property="og:locale:alternate" content={OG_LOCALE_MAP[locale]} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}
