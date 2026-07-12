import type { CookieOptions, Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_NAME } from '../services/auth.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { UnauthorizedError } from '../utils/AppError'
import { isProduction } from '../config/env'
import type { LoginInput } from '../validators/auth.validator'

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  signed: true,
  path: '/api/v1/auth',
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE_MS })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS)
}

function readRefreshCookie(req: Request): string | undefined {
  return req.signedCookies?.[REFRESH_COOKIE_NAME]
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput
  const { accessToken, refreshToken, user } = await authService.login(email, password, req.ip)

  setRefreshCookie(res, refreshToken)
  sendSuccess(res, { accessToken, user })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = readRefreshCookie(req)
  if (!rawRefreshToken) {
    throw new UnauthorizedError('No refresh token provided')
  }

  const { accessToken, refreshToken, user } = await authService.refreshSession(rawRefreshToken, req.ip)

  setRefreshCookie(res, refreshToken)
  sendSuccess(res, { accessToken, user })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = readRefreshCookie(req)
  await authService.logout(rawRefreshToken)

  clearRefreshCookie(res)
  sendSuccess(res, { message: 'Logged out successfully' })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  // `authenticate` middleware guarantees req.user is set before this runs.
  const user = await authService.getCurrentUser(req.user!.id)
  sendSuccess(res, { user })
})
