/** Rewrites a Cloudinary delivery URL to request a small, auto-optimized
 *  thumbnail instead of the full original — table row thumbnails render at
 *  40–80px, so there's no reason to ship a multi-megabyte original image
 *  just to shrink it in CSS. Pure string manipulation on the existing stored
 *  URL (Cloudinary's transformation segment slots in right after
 *  `/upload/`) — no extra request, no backend/schema change.
 *
 *  Safe no-op for anything that isn't a Cloudinary `/upload/` URL (a
 *  non-Cloudinary placeholder, a relative path, etc.) — returns it
 *  unchanged rather than risk producing a broken URL. */
export function cloudinaryThumbnail(url: string, size = 80): string {
  const marker = '/upload/'
  const index = url.indexOf(marker)
  if (index === -1) return url

  const insertAt = index + marker.length
  const transformation = `w_${size},h_${size},c_fill,f_auto,q_auto/`
  return url.slice(0, insertAt) + transformation + url.slice(insertAt)
}
