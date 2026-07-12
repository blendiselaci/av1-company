import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'

interface ValidationSchemas {
  body?: ZodTypeAny
  params?: ZodTypeAny
  query?: ZodTypeAny
}

/** Validates (and coerces/defaults) req.body/params/query against the given Zod
 *  schemas before the route handler runs. Parse errors are forwarded to the
 *  global error handler, which formats ZodError into a consistent 422 response. */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body)
      if (schemas.params) req.params = schemas.params.parse(req.params)
      if (schemas.query) req.query = schemas.query.parse(req.query)
      next()
    } catch (error) {
      next(error)
    }
  }
}
