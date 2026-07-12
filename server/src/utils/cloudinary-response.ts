import { buildResponsiveVariants, getOptimizedUrl, type AssetResourceType, type ResponsiveVariants } from '../services/upload.service'

export type { ResponsiveVariants }

export interface OptimizedImage {
  url: string
  variants?: ResponsiveVariants
}

/**
 * Read-time Cloudinary optimization for a single stored image field —
 * derives thumbnail/medium/original URLs (fetch_format: auto, quality: auto)
 * from the asset's publicId, without touching the stored `url`/`publicId`
 * columns themselves.
 *
 * Backwards compatible by design: rows created before publicId tracking
 * existed have `publicId: null`, so this simply returns the raw stored URL
 * unchanged with no `variants` — never throws, never requires a publicId.
 */
export function optimizeImage(url: string, publicId: string | null | undefined): OptimizedImage {
  if (!publicId) return { url }
  const variants = buildResponsiveVariants(publicId, 'image')
  return { url: variants.original, variants }
}

/** Same fallback contract as optimizeImage, for a single non-image asset URL
 *  (e.g. a video file) where per-size variants don't apply — just upgrades
 *  the URL in place. */
export function optimizeAssetUrl(url: string, publicId: string | null | undefined, resourceType: AssetResourceType = 'image'): string {
  if (!publicId) return url
  return getOptimizedUrl(publicId, resourceType)
}
