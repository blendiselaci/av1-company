import { apiClient } from './client'
import type { ApiSuccess } from '../types/api'
import type { Settings } from '../types/models'

export type UpdateSettingsPayload = Partial<
  Pick<Settings, 'companyName' | 'phone' | 'email' | 'address' | 'workingHours' | 'facebookUrl' | 'instagramUrl' | 'mapsUrl'>
>

export async function getSettings(): Promise<Settings> {
  const response = await apiClient.get<ApiSuccess<Settings>>('/settings')
  return response.data.data
}

export async function updateSettings(data: UpdateSettingsPayload): Promise<Settings> {
  const response = await apiClient.patch<ApiSuccess<Settings>>('/settings/admin', data)
  return response.data.data
}
