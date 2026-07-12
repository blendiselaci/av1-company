import { z } from 'zod'

export const updateSettingsSchema = z.object({
  companyName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().min(1).optional(),
  workingHours: z.string().trim().min(1).optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  mapsUrl: z.string().url().optional().or(z.literal('')),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
