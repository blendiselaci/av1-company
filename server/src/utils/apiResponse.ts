import type { Response } from 'express'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ApiSuccessBody<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

interface ApiErrorBody {
  success: false
  message: string
  errors?: unknown
}

/** Every 2xx response in the API goes through this — same envelope shape everywhere. */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta): Response {
  const body: ApiSuccessBody<T> = { success: true, data }
  if (meta) body.meta = meta
  return res.status(statusCode).json(body)
}

/** Used by the global error handler (and available directly if a controller ever
 *  needs to short-circuit with a custom error shape). */
export function sendError(res: Response, statusCode: number, message: string, errors?: unknown): Response {
  const body: ApiErrorBody = { success: false, message }
  if (errors !== undefined) body.errors = errors
  return res.status(statusCode).json(body)
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
