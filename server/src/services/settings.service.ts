import type { Settings } from '@prisma/client'
import { settingsRepository } from '../repositories/settings.repository'
import type { UpdateSettingsInput } from '../validators/settings.validator'

/** Used to auto-provision the singleton row if a fresh database hasn't been
 *  seeded yet, so `GET /settings` never 404s on a brand-new deployment. */
const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
  companyName: 'AV1-Company',
  phone: '+383 45 644 102',
  email: 'av1.company10@gmail.com',
  address: 'Rruga e Kavajës, Peja 1001, Kosovo',
  workingHours: 'Mon – Sat: 08:00 – 18:00',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61573610664993',
  instagramUrl: null,
  mapsUrl: null,
}

export async function getSettings(): Promise<Settings> {
  const settings = await settingsRepository.find()
  if (settings) return settings
  return settingsRepository.upsert(DEFAULT_SETTINGS)
}

export async function updateSettings(input: UpdateSettingsInput): Promise<Settings> {
  const current = await getSettings()

  return settingsRepository.upsert({
    companyName: input.companyName ?? current.companyName,
    phone: input.phone ?? current.phone,
    email: input.email ?? current.email,
    address: input.address ?? current.address,
    workingHours: input.workingHours ?? current.workingHours,
    facebookUrl: input.facebookUrl || current.facebookUrl,
    instagramUrl: input.instagramUrl || current.instagramUrl,
    mapsUrl: input.mapsUrl || current.mapsUrl,
  })
}
