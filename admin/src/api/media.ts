import { apiClient } from './client'
import type { ApiSuccess } from '../types/api'
import type { Media, MediaCategory } from '../types/models'

export async function uploadMedia(file: File, category: MediaCategory): Promise<Media> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', category)
  const response = await apiClient.post<ApiSuccess<Media>>('/media/upload', form)
  return response.data.data
}

export async function uploadMultipleMedia(files: File[], category: MediaCategory): Promise<Media[]> {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  form.append('category', category)
  const response = await apiClient.post<ApiSuccess<Media[]>>('/media/upload/multiple', form)
  return response.data.data
}

export async function replaceMedia(id: string, file: File): Promise<Media> {
  const form = new FormData()
  form.append('file', file)
  const response = await apiClient.put<ApiSuccess<Media>>(`/media/${id}/replace`, form)
  return response.data.data
}
