import { z } from 'zod'
import { categoryQuerySchema, optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createVideoSchema = z.object({
  titleEn: z.string().trim().min(1),
  titleDe: z.string().trim().min(1),
  titleSq: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  descriptionDe: z.string().trim().min(1),
  descriptionSq: z.string().trim().min(1),
  categoryId: z.string().min(1, 'Category is required'),
  duration: z.string().trim().min(1),
  thumbnail: z.string().url('thumbnail must be a valid URL'),
  thumbnailPublicId: z.string().nullable().optional(),
  videoUrl: z.string().url('videoUrl must be a valid URL'),
  videoPublicId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateVideoSchema = createVideoSchema.partial()

const searchField = { search: z.string().trim().optional() }

export const publicListVideosQuerySchema = paginationQuerySchema.merge(categoryQuerySchema).extend(searchField)

export const adminListVideosQuerySchema = publicListVideosQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateVideoInput = z.infer<typeof createVideoSchema>
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>
export type PublicListVideosQuery = z.infer<typeof publicListVideosQuerySchema>
export type AdminListVideosQuery = z.infer<typeof adminListVideosQuerySchema>
