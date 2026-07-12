import { z } from 'zod'
import { MediaCategory } from '@prisma/client'
import { paginationQuerySchema } from './common.validator'

export const mediaCategorySchema = z.nativeEnum(MediaCategory)

export const uploadMediaBodySchema = z.object({
  category: mediaCategorySchema,
})

export const listMediaQuerySchema = paginationQuerySchema.extend({
  category: mediaCategorySchema.optional(),
})

export type UploadMediaInput = z.infer<typeof uploadMediaBodySchema>
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>
