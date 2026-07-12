import { z } from 'zod'
import { ContactStatus } from '@prisma/client'
import { paginationQuerySchema } from './common.validator'

export const createContactMessageSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z.string().trim().max(30).optional(),
  service: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, 'Message is required').max(5000),
})

export const updateContactMessageStatusSchema = z.object({
  status: z.nativeEnum(ContactStatus),
})

export const listContactMessagesQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ContactStatus).optional(),
})

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>
export type UpdateContactMessageStatusInput = z.infer<typeof updateContactMessageStatusSchema>
export type ListContactMessagesQuery = z.infer<typeof listContactMessagesQuerySchema>
