import { apiClient } from './client'
import type { ApiSuccess, ListParams, ListResult } from '../types/api'

/** Generic CRUD client for a resource mounted the same way every content
 *  entity is on the backend (`GET/POST /<base>[/admin]`, `GET/PATCH/DELETE
 *  /<base>[/admin]/:id`). Mirrors the backend's own generic BaseRepository —
 *  one implementation, reused by every resource feature instead of 9 near-
 *  identical hand-written API modules. */
export function createResourceApi<TItem, TCreate, TUpdate = Partial<TCreate>>(basePath: string, nested = true) {
  const base = nested ? `${basePath}/admin` : basePath

  return {
    list: async (params: ListParams): Promise<ListResult<TItem>> => {
      const response = await apiClient.get<ApiSuccess<TItem[]>>(base, { params })
      return { items: response.data.data, meta: response.data.meta! }
    },
    get: async (id: string): Promise<TItem> => {
      const response = await apiClient.get<ApiSuccess<TItem>>(`${base}/${id}`)
      return response.data.data
    },
    create: async (data: TCreate): Promise<TItem> => {
      const response = await apiClient.post<ApiSuccess<TItem>>(base, data)
      return response.data.data
    },
    update: async (id: string, data: TUpdate): Promise<TItem> => {
      const response = await apiClient.patch<ApiSuccess<TItem>>(`${base}/${id}`, data)
      return response.data.data
    },
    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`${base}/${id}`)
    },
  }
}
