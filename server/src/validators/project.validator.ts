import { z } from 'zod'
import { categoryQuerySchema, optionalBooleanQuery, paginationQuerySchema } from './common.validator'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createProjectSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, 'Slug must be lowercase, alphanumeric and hyphen-separated'),
  titleEn: z.string().trim().min(1),
  titleDe: z.string().trim().min(1),
  titleSq: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  descriptionDe: z.string().trim().min(1),
  descriptionSq: z.string().trim().min(1),
  categoryId: z.string().min(1, 'Category is required'),
  location: z.string().trim().min(1),
  year: z.coerce.number().int().min(1900).max(2100),
  image: z.string().url('image must be a valid URL'),
  imagePublicId: z.string().nullable().optional(),
  gallery: z.array(z.string().url()).default([]),
  services: z.array(z.string().trim().min(1)).default([]),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateProjectSchema = createProjectSchema.partial()

const searchField = { search: z.string().trim().optional() }

/** Public callers can never request unpublished content — `isPublished` simply
 *  isn't a field they can send, rather than a filter that needs to be defended against. */
export const publicListProjectsQuerySchema = paginationQuerySchema.merge(categoryQuerySchema).extend(searchField)

export const adminListProjectsQuerySchema = publicListProjectsQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type PublicListProjectsQuery = z.infer<typeof publicListProjectsQuerySchema>
export type AdminListProjectsQuery = z.infer<typeof adminListProjectsQuerySchema>
