import { z } from 'zod'
import { optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createTestimonialSchema = z.object({
  clientName: z.string().trim().min(1),
  location: z.string().trim().min(1),
  projectType: z.string().trim().min(1),
  textEn: z.string().trim().min(1),
  textDe: z.string().trim().min(1),
  textSq: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  image: z.string().url().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  date: z.string().trim().min(1),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateTestimonialSchema = createTestimonialSchema.partial()

export const publicListTestimonialsQuerySchema = paginationQuerySchema

export const adminListTestimonialsQuerySchema = paginationQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>
export type PublicListTestimonialsQuery = z.infer<typeof publicListTestimonialsQuerySchema>
export type AdminListTestimonialsQuery = z.infer<typeof adminListTestimonialsQuerySchema>
