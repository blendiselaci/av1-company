import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { MulterError } from 'multer'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError'
import { sendError } from '../utils/apiResponse'
import { isProduction } from '../config/env'
import { captureException } from '../utils/monitoring'

/** Translates a known Prisma error into an AppError-shaped (status, message, details) tuple. */
function fromPrismaError(err: Prisma.PrismaClientKnownRequestError): { status: number; message: string; details?: unknown } {
  switch (err.code) {
    case 'P2002': {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field'
      return { status: 409, message: `A record with this ${target} already exists` }
    }
    case 'P2025':
      return { status: 404, message: 'Record not found' }
    case 'P2003':
      return { status: 409, message: 'This action would violate a related record constraint' }
    default:
      return { status: 400, message: 'Database request error', details: isProduction ? undefined : err.message }
  }
}

/** Must be registered last, after all routes. Express recognizes it as an error
 *  handler by its 4-argument signature. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) captureException(err, { path: req.originalUrl })
    sendError(res, err.statusCode, err.message, err.details)
    return
  }

  if (err instanceof ZodError) {
    sendError(res, 422, 'Validation failed', err.flatten())
    return
  }

  // Thrown directly by multer (e.g. LIMIT_FILE_SIZE) before a request ever
  // reaches a controller — a client mistake, not a server fault, so this
  // must not fall through to the generic 500 branch below.
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message
    sendError(res, 400, message)
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message, details } = fromPrismaError(err)
    sendError(res, status, message, details)
    return
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, 'Invalid database query')
    return
  }

  const error = err instanceof Error ? err : new Error('Unknown error')
  captureException(error, { path: req.originalUrl })
  sendError(res, 500, isProduction ? 'Internal server error' : error.message)
}
