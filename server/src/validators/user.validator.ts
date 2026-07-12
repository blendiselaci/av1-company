import { z } from 'zod'
import { Role } from '@prisma/client'
import { optionalBooleanQuery, paginationQuerySchema } from './common.validator'

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  name: z.string().trim().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(Role).default(Role.EDITOR),
  isActive: z.boolean().default(true),
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
})

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.nativeEnum(Role).optional(),
  isActive: optionalBooleanQuery,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
