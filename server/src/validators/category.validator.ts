import { z } from 'zod'
import { optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createCategorySchema = z.object({
  nameSq: z.string().trim().min(1, 'Albanian name is required'),
  nameEn: z.string().trim().min(1, 'English name is required'),
  nameDe: z.string().trim().min(1, 'German name is required'),
  slug: z.string().trim().toLowerCase().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

export const reorderCategoriesSchema = z.object({
  items: z
    .array(z.object({ id: z.string().min(1), order: z.coerce.number().int() }))
    .min(1, 'At least one category is required'),
})

export const publicListCategoriesQuerySchema = paginationQuerySchema

export const adminListCategoriesQuerySchema = paginationQuerySchema.extend({
  isActive: optionalBooleanQuery,
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>
export type PublicListCategoriesQuery = z.infer<typeof publicListCategoriesQuerySchema>
export type AdminListCategoriesQuery = z.infer<typeof adminListCategoriesQuerySchema>
