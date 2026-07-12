import type { Settings } from '@prisma/client'
import { prisma } from '../config/database'

const SETTINGS_ID = 1

type SettingsData = Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>

/** Settings is a singleton (always id = 1) — a plain repository rather than
 *  BaseRepository, since "list/paginate/delete a singleton" isn't meaningful. */
class SettingsRepository {
  find(): Promise<Settings | null> {
    return prisma.settings.findUnique({ where: { id: SETTINGS_ID } })
  }

  upsert(data: SettingsData): Promise<Settings> {
    return prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...data },
    })
  }
}

export const settingsRepository = new SettingsRepository()
