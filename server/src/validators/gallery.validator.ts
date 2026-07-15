import { z } from 'zod'
import { categoryQuerySchema, optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createGalleryImageSchema = z.object({
  titleEn: z.string().trim().min(1),
  titleDe: z.string().trim().min(1),
  titleSq: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  descriptionDe: z.string().trim().min(1),
  descriptionSq: z.string().trim().min(1),
  categoryId: z.string().min(1, 'Category is required'),
  image: z.string().url('image must be a valid URL'),
  imagePublicId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateGalleryImageSchema = createGalleryImageSchema.partial()

const searchField = { search: z.string().trim().optional() }

export const publicListGalleryQuerySchema = paginationQuerySchema.merge(categoryQuerySchema).extend(searchField)

export const adminListGalleryQuerySchema = publicListGalleryQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>
export type PublicListGalleryQuery = z.infer<typeof publicListGalleryQuerySchema>
export type AdminListGalleryQuery = z.infer<typeof adminListGalleryQuerySchema>
