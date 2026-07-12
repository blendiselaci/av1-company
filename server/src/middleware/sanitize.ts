import type { NextFunction, Request, Response } from 'express'
import sanitizeHtml from 'sanitize-html'

/** Field names that must reach the validator/service byte-for-byte — sanitizing
 *  a credential before it's hashed or compared would silently corrupt it (e.g.
 *  a password containing a literal "<" or ">" would have that substring
 *  stripped, so a correct password would stop authenticating). These are never
 *  rendered as HTML, so there's no XSS reason to sanitize them anyway. */
const SKIP_KEYS = new Set(['password'])

/** Strips all HTML/script markup from string values, recursively, in an object. */
function sanitizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim() as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as unknown as T
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SKIP_KEYS.has(key) ? val : sanitizeValue(val)
    }
    return result as T
  }
  return value
}

/** Defense-in-depth against stored XSS: strips HTML out of every string field in
 *  the request body before it ever reaches a validator or the database. Prisma's
 *  parameterized queries already prevent SQL injection on their own. */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }
  next()
}
