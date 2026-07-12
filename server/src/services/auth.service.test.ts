import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RefreshToken, Role, User } from '@prisma/client'

const { mockUserRepository, mockRefreshTokenRepository } = vi.hoisted(() => ({
  mockUserRepository: {
    findByEmail: vi.fn(),
    findUnique: vi.fn(),
  },
  mockRefreshTokenRepository: {
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
    rotate: vi.fn(),
  },
}))

vi.mock('../repositories/user.repository', () => ({ userRepository: mockUserRepository }))
vi.mock('../repositories/refreshToken.repository', () => ({ refreshTokenRepository: mockRefreshTokenRepository }))

import { getCurrentUser, login, logout, refreshSession } from './auth.service'
import { hashPassword } from '../utils/password'
import { signRefreshToken } from '../utils/jwt'
import { hashToken } from '../utils/hash'
import { UnauthorizedError } from '../utils/AppError'

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user_1',
    email: 'admin@av1-company.al',
    passwordHash: '',
    name: 'AV1 Admin',
    role: 'ADMIN' as Role,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function buildStoredToken(rawRefreshToken: string, overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    id: 'rt_1',
    tokenHash: hashToken(rawRefreshToken),
    userId: 'user_1',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date(),
    createdByIp: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('returns a token pair and a public user (no password hash) for valid credentials', async () => {
    const passwordHash = await hashPassword('ChangeMe123!')
    const user = buildUser({ passwordHash })
    mockUserRepository.findByEmail.mockResolvedValue(user)
    mockRefreshTokenRepository.create.mockResolvedValue({})

    const result = await login('admin@av1-company.al', 'ChangeMe123!', '127.0.0.1')

    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    expect(result.user).not.toHaveProperty('passwordHash')
  })

  it('rejects an email that does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    await expect(login('nobody@example.com', 'whatever', undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects an incorrect password', async () => {
    const passwordHash = await hashPassword('ChangeMe123!')
    mockUserRepository.findByEmail.mockResolvedValue(buildUser({ passwordHash }))
    await expect(login('admin@av1-company.al', 'WrongPassword!', undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects a deactivated account even with the correct password', async () => {
    const passwordHash = await hashPassword('ChangeMe123!')
    mockUserRepository.findByEmail.mockResolvedValue(buildUser({ passwordHash, isActive: false }))
    await expect(login('admin@av1-company.al', 'ChangeMe123!', undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })
})

describe('refreshSession', () => {
  it('rejects a malformed/invalid refresh token', async () => {
    await expect(refreshSession('not-a-real-jwt', undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rotates a valid, non-revoked, non-expired token', async () => {
    const user = buildUser()
    const rawRefreshToken = signRefreshToken({ sub: user.id, jti: 'jti-1' })
    const storedToken = buildStoredToken(rawRefreshToken)

    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken)
    mockUserRepository.findUnique.mockResolvedValue(user)
    mockRefreshTokenRepository.rotate.mockResolvedValue({ ...storedToken, id: 'rt_2' })

    const result = await refreshSession(rawRefreshToken, '127.0.0.1')

    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
    // Rotation must be a single atomic call — not a separate revoke() + create()
    // that could leave the session half-rotated if the process crashed in between.
    expect(mockRefreshTokenRepository.rotate).toHaveBeenCalledWith(
      storedToken.id,
      expect.objectContaining({ tokenHash: expect.any(String) }),
    )
    expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled()
    expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled()
  })

  it('rejects an expired stored refresh token', async () => {
    const user = buildUser()
    const rawRefreshToken = signRefreshToken({ sub: user.id, jti: 'jti-2' })
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
      buildStoredToken(rawRefreshToken, { expiresAt: new Date(Date.now() - 1000) }),
    )

    await expect(refreshSession(rawRefreshToken, undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('treats a reused, already-revoked token as theft and revokes every session for that user', async () => {
    const user = buildUser()
    const rawRefreshToken = signRefreshToken({ sub: user.id, jti: 'jti-3' })
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
      buildStoredToken(rawRefreshToken, { revokedAt: new Date() }),
    )

    await expect(refreshSession(rawRefreshToken, undefined)).rejects.toBeInstanceOf(UnauthorizedError)
    expect(mockRefreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(user.id)
  })

  it('rejects a token for a user that no longer exists or is deactivated', async () => {
    const rawRefreshToken = signRefreshToken({ sub: 'ghost_user', jti: 'jti-4' })
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(
      buildStoredToken(rawRefreshToken, { userId: 'ghost_user' }),
    )
    mockUserRepository.findUnique.mockResolvedValue(null)

    await expect(refreshSession(rawRefreshToken, undefined)).rejects.toBeInstanceOf(UnauthorizedError)
  })
})

describe('logout', () => {
  it('resolves silently when no refresh token cookie is present', async () => {
    await expect(logout(undefined)).resolves.toBeUndefined()
    expect(mockRefreshTokenRepository.revoke).not.toHaveBeenCalled()
  })

  it('revokes the matching stored token', async () => {
    const rawRefreshToken = signRefreshToken({ sub: 'user_1', jti: 'jti-5' })
    const storedToken = buildStoredToken(rawRefreshToken)
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken)
    mockRefreshTokenRepository.revoke.mockResolvedValue({ ...storedToken, revokedAt: new Date() })

    await logout(rawRefreshToken)

    expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(storedToken.id)
  })
})

describe('getCurrentUser', () => {
  it('returns the public profile for an active user', async () => {
    const user = buildUser()
    mockUserRepository.findUnique.mockResolvedValue(user)

    const result = await getCurrentUser(user.id)

    expect(result).toEqual({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt })
  })

  it('rejects when the user no longer exists', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null)
    await expect(getCurrentUser('missing')).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects when the user has been deactivated', async () => {
    mockUserRepository.findUnique.mockResolvedValue(buildUser({ isActive: false }))
    await expect(getCurrentUser('user_1')).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
