import { z } from 'zod'
import { optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createServiceSchema = z.object({
  titleEn: z.string().trim().min(1),
  titleDe: z.string().trim().min(1),
  titleSq: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  descriptionDe: z.string().trim().min(1),
  descriptionSq: z.string().trim().min(1),
  slug: z.string().trim().toLowerCase().optional(),
  icon: z.string().trim().min(1),
  image: z.string().trim().url().nullable().optional(),
  imagePublicId: z.string().trim().min(1).nullable().optional(),
  benefitsEn: z.array(z.string().trim().min(1)).default([]),
  benefitsDe: z.array(z.string().trim().min(1)).default([]),
  benefitsSq: z.array(z.string().trim().min(1)).default([]),
  galleryImages: z.array(z.string().trim().url()).default([]),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateServiceSchema = createServiceSchema.partial()

export const publicListServicesQuerySchema = paginationQuerySchema

export const adminListServicesQuerySchema = paginationQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export const serviceSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type PublicListServicesQuery = z.infer<typeof publicListServicesQuerySchema>
export type AdminListServicesQuery = z.infer<typeof adminListServicesQuerySchema>
