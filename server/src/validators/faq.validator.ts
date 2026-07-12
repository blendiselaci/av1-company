import { z } from 'zod'
import { optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createFaqSchema = z.object({
  questionEn: z.string().trim().min(1),
  questionDe: z.string().trim().min(1),
  questionSq: z.string().trim().min(1),
  answerEn: z.string().trim().min(1),
  answerDe: z.string().trim().min(1),
  answerSq: z.string().trim().min(1),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

export const updateFaqSchema = createFaqSchema.partial()

export const publicListFaqsQuerySchema = paginationQuerySchema

export const adminListFaqsQuerySchema = paginationQuerySchema.extend({
  isPublished: optionalBooleanQuery,
})

export type CreateFaqInput = z.infer<typeof createFaqSchema>
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>
export type PublicListFaqsQuery = z.infer<typeof publicListFaqsQuerySchema>
export type AdminListFaqsQuery = z.infer<typeof adminListFaqsQuerySchema>
