import { apiClient } from './client'
import type { ApiSuccess, ListParams, ListResult } from '../types/api'
import type { ContactMessage, ContactStatus } from '../types/models'

const base = '/contact-messages/admin'

export async function listContactMessages(params: ListParams & { status?: ContactStatus }): Promise<ListResult<ContactMessage>> {
  const response = await apiClient.get<ApiSuccess<ContactMessage[]>>(base, { params })
  return { items: response.data.data, meta: response.data.meta! }
}

export async function updateContactMessageStatus(id: string, status: ContactStatus): Promise<ContactMessage> {
  const response = await apiClient.patch<ApiSuccess<ContactMessage>>(`${base}/${id}/status`, { status })
  return response.data.data
}

export async function deleteContactMessage(id: string): Promise<void> {
  await apiClient.delete(`${base}/${id}`)
}
