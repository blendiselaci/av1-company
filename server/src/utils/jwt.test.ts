import { describe, expect, it } from 'vitest'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt'

describe('jwt utils', () => {
  it('round-trips a valid access token', () => {
    const token = signAccessToken({ sub: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' })
    const payload = verifyAccessToken(token)
    expect(payload).toMatchObject({ sub: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' })
  })

  it('round-trips a valid refresh token', () => {
    const token = signRefreshToken({ sub: 'user_1', jti: 'nonce-1' })
    const payload = verifyRefreshToken(token)
    expect(payload).toMatchObject({ sub: 'user_1', jti: 'nonce-1' })
  })

  it('rejects an expired access token', () => {
    const expired = jwt.sign({ sub: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' }, env.JWT_ACCESS_SECRET, {
      expiresIn: -10,
    })
    expect(() => verifyAccessToken(expired)).toThrow()
  })

  it('rejects an expired refresh token', () => {
    const expired = jwt.sign({ sub: 'user_1', jti: 'nonce-2' }, env.JWT_REFRESH_SECRET, { expiresIn: -10 })
    expect(() => verifyRefreshToken(expired)).toThrow()
  })

  it('rejects a token signed with the wrong secret', () => {
    const forged = jwt.sign({ sub: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' }, 'not-the-real-access-secret-12345')
    expect(() => verifyAccessToken(forged)).toThrow()
  })

  it('rejects an access token verified as a refresh token and vice versa', () => {
    const accessToken = signAccessToken({ sub: 'user_1', email: 'admin@av1-company.al', role: 'ADMIN' })
    const refreshToken = signRefreshToken({ sub: 'user_1', jti: 'nonce-3' })
    expect(() => verifyRefreshToken(accessToken)).toThrow()
    expect(() => verifyAccessToken(refreshToken)).toThrow()
  })

  it('rejects a malformed token string', () => {
    expect(() => verifyAccessToken('this.is-not.a-jwt')).toThrow()
  })
})
