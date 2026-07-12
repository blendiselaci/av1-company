import type { Request, Response } from 'express'
import { sendError } from '../utils/apiResponse'

/** Registered after all routes but before the error handler — catches any
 *  request that didn't match a route. */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, `No route found for ${req.method} ${req.originalUrl}`)
}
