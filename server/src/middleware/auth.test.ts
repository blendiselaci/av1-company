import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { authenticate, authorize } from './auth'
import { signAccessToken } from '../utils/jwt'
import { ForbiddenError, UnauthorizedError } from '../utils/AppError'

function buildRequest(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

describe('authenticate middleware', () => {
  it('rejects a request with no Authorization header', () => {
    const next = vi.fn()
    authenticate(buildRequest(), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })

  it('rejects a header that is not a Bearer token', () => {
    const next = vi.fn()
    authenticate(buildRequest({ authorization: 'Basic dXNlcjpwYXNz' }), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })

  it('rejects an invalid or expired access token', () => {
    const next = vi.fn()
    authenticate(buildRequest({ authorization: 'Bearer not-a-real-token' }), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })

  it('attaches req.user and calls next() with no error for a valid token', () => {
    const token = signAccessToken({ sub: 'user_1', email: 'editor@av1-company.al', role: 'EDITOR' })
    const req = buildRequest({ authorization: `Bearer ${token}` })
    const next = vi.fn()

    authenticate(req, {} as Response, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toEqual({ id: 'user_1', email: 'editor@av1-company.al', role: 'EDITOR' })
  })
})

describe('authorize middleware', () => {
  it('rejects when called before authenticate (no req.user)', () => {
    const next = vi.fn()
    authorize('ADMIN')(buildRequest(), {} as Response, next)
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })

  it('rejects a role that is not in the allowed list', () => {
    const req = buildRequest()
    req.user = { id: 'user_1', email: 'editor@av1-company.al', role: 'EDITOR' }
    const next = vi.fn()

    authorize('ADMIN')(req, {} as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError))
  })

  it('calls next() with no error for an allowed role', () => {
    const req = buildRequest()
    req.user = { id: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' }
    const next = vi.fn()

    authorize('ADMIN', 'EDITOR')(req, {} as Response, next)

    expect(next).toHaveBeenCalledWith()
  })
})
