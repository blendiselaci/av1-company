import { z } from 'zod'
import { ProjectCategory } from '@prisma/client'
import { PAGINATION } from '../config/constants'

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
})

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
})

/** `true`/`false` as query strings, coerced to a real boolean; omitted means "no filter". */
export const optionalBooleanQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'))

export const categoryQuerySchema = z.object({
  category: z.nativeEnum(ProjectCategory).optional(),
})
