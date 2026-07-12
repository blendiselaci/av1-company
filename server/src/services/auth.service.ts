import type { Prisma, User } from '@prisma/client'
import { env } from '../config/env'
import { userRepository } from '../repositories/user.repository'
import { refreshTokenRepository } from '../repositories/refreshToken.repository'
import { comparePassword } from '../utils/password'
import { generateRandomToken, hashToken } from '../utils/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { parseDurationToMs } from '../utils/duration'
import { UnauthorizedError } from '../utils/AppError'

export { REFRESH_COOKIE_NAME } from '../config/constants'
export const REFRESH_COOKIE_MAX_AGE_MS = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)

export type PublicUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

function buildTokenPair(user: User, createdByIp?: string): { tokens: TokenPair; createData: Prisma.RefreshTokenCreateInput } {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })

  const jti = generateRandomToken(16)
  const refreshToken = signRefreshToken({ sub: user.id, jti })

  const createData: Prisma.RefreshTokenCreateInput = {
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS),
    createdByIp,
    user: { connect: { id: user.id } },
  }

  return { tokens: { accessToken, refreshToken }, createData }
}

async function issueTokenPair(user: User, createdByIp?: string): Promise<TokenPair> {
  const { tokens, createData } = buildTokenPair(user, createdByIp)
  await refreshTokenRepository.create(createData)
  return tokens
}

export async function login(email: string, password: string, ip?: string): Promise<TokenPair & { user: PublicUser }> {
  const user = await userRepository.findByEmail(email)

  // Same error for "no such user" and "wrong password" — don't reveal which one it was.
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const passwordMatches = await comparePassword(password, user.passwordHash)
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const tokens = await issueTokenPair(user, ip)
  return { ...tokens, user: toPublicUser(user) }
}

/** Verifies the presented refresh token, rotates it (revoke old, issue new), and
 *  returns a fresh token pair. Rotation limits the damage if a refresh token is
 *  ever stolen — a reused, already-revoked token is treated as suspicious. */
export async function refreshSession(rawRefreshToken: string, ip?: string): Promise<TokenPair & { user: PublicUser }> {
  let payload
  try {
    payload = verifyRefreshToken(rawRefreshToken)
  } catch {
    throw new UnauthorizedError('Refresh token is invalid or expired')
  }

  const tokenHash = hashToken(rawRefreshToken)
  const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash)

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    // Token reuse after revocation is a strong signal of theft — revoke every
    // active session for this user as a precaution.
    if (storedToken?.revokedAt) {
      await refreshTokenRepository.revokeAllForUser(payload.sub)
    }
    throw new UnauthorizedError('Refresh token is invalid or expired')
  }

  const user = await userRepository.findUnique({ id: payload.sub })
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Refresh token is invalid or expired')
  }

  const { tokens, createData } = buildTokenPair(user, ip)
  await refreshTokenRepository.rotate(storedToken.id, createData)
  return { ...tokens, user: toPublicUser(user) }
}

export async function logout(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return

  const tokenHash = hashToken(rawRefreshToken)
  const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash)
  if (storedToken && !storedToken.revokedAt) {
    await refreshTokenRepository.revoke(storedToken.id)
  }
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await userRepository.findUnique({ id: userId })
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Session is no longer valid')
  }
  return toPublicUser(user)
}
