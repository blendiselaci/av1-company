import type { NextFunction, Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { verifyAccessToken } from '../utils/jwt'
import { ForbiddenError, UnauthorizedError } from '../utils/AppError'

/** Requires a valid `Authorization: Bearer <accessToken>` header and attaches
 *  the decoded identity to `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or malformed access token'))
    return
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch {
    next(new UnauthorizedError('Access token is invalid or expired'))
  }
}

/** Must run after `authenticate`. Restricts a route to the given roles. */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError())
      return
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to perform this action'))
      return
    }
    next()
  }
}
