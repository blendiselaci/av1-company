import type { TransformationOptions } from 'cloudinary'
import { env } from '../config/env'

/**
 * Reusable Cloudinary transformation step that overlays the AV1-Company logo
 * in the bottom-right corner at 50% opacity — applied at delivery time only.
 * The stored asset and its public_id are never modified; this only changes
 * the URL used to *request* the image, exactly like the existing
 * `fetch_format`/`quality: 'auto'` optimization already applied everywhere.
 *
 * The overlay is sized relative to the base image (`fl_relative` + a
 * fractional `width`) rather than a fixed pixel size, so it reads correctly
 * on both a 320px thumbnail and a full-resolution original.
 *
 * Requires the logo to exist in Cloudinary as its own asset — set
 * `CLOUDINARY_WATERMARK_PUBLIC_ID` to that asset's public_id once it's
 * uploaded. Until then this returns `null` (no-op), so every image URL
 * keeps working exactly as before rather than risk a broken overlay
 * reference breaking every image on the site.
 */
export function watermarkTransformation(): TransformationOptions | null {
  if (!env.CLOUDINARY_WATERMARK_PUBLIC_ID) return null

  return {
    // Cloudinary layer parameters use ':' as the folder separator, not '/'.
    overlay: env.CLOUDINARY_WATERMARK_PUBLIC_ID.replace(/\//g, ':'),
    gravity: 'south_east',
    x: 12,
    y: 12,
    opacity: 50,
    width: 0.18,
    flags: 'relative',
  }
}
