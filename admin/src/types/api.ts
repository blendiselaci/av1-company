export interface ApiListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: ApiListMeta
}

export interface ListResult<T> {
  items: T[]
  meta: ApiListMeta
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}
