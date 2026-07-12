import { z } from 'zod'
import { ProjectCategory } from '@prisma/client'
import { categoryQuerySchema, optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createBeforeAfterSchema = z.object({
  titleEn: z.string().trim().min(1),
  titleDe: z.string().trim().min(1),
  titleSq: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  descriptionDe: z.string().trim().min(1),
  descriptionSq: z.string().trim().min(1),
  workCompletedEn: z.string().trim().min(1),
  workCompletedDe: z.string().trim().min(1),
  workCompletedSq: z.string().trim().min(1),
  completionTimeEn: z.string().trim().min(1),
  completionTimeDe: z.string().trim().min(1),
  completionTimeSq: z.string().trim().min(1),
  location: z.string().trim().min(1),
  category: z.nativeEnum(ProjectCategory),
  beforeImage: z.string().url('beforeImage must be a valid URL'),
  beforeImagePublicId: z.string().nullable().optional(),
  afterImage: z.string().url('afterImage must be a valid URL'),
  afterImagePublicId: z.string().nullable().optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateBeforeAfterSchema = createBeforeAfterSchema.partial()

const searchField = { search: z.string().trim().optional() }

export const publicListBeforeAfterQuerySchema = paginationQuerySchema.merge(categoryQuerySchema).extend(searchField)

export const adminListBeforeAfterQuerySchema = publicListBeforeAfterQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateBeforeAfterInput = z.infer<typeof createBeforeAfterSchema>
export type UpdateBeforeAfterInput = z.infer<typeof updateBeforeAfterSchema>
export type PublicListBeforeAfterQuery = z.infer<typeof publicListBeforeAfterQuerySchema>
export type AdminListBeforeAfterQuery = z.infer<typeof adminListBeforeAfterQuerySchema>
