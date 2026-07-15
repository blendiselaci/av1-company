/** Shared slug helper used by any content type that needs a unique,
 *  URL-safe identifier generated automatically from a display name
 *  (Category, Service, ...). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics (ë, ç, ...)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
