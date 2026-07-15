import { ImageOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Single generic placeholder icon shown when a photo/thumbnail fails to
 *  load. Categories are dynamic CMS content now (not a fixed enum), so there
 *  is no longer a stable set of keys to map to per-category icons — a new
 *  category created in admin must render correctly with zero code changes. */
export const CATEGORY_FALLBACK_ICON: LucideIcon = ImageOff
