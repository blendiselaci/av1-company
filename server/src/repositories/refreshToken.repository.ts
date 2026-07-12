import type { Prisma, RefreshToken } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class RefreshTokenRepository extends BaseRepository<
  RefreshToken,
  Prisma.RefreshTokenCreateInput,
  Prisma.RefreshTokenUpdateInput,
  Prisma.RefreshTokenWhereUniqueInput,
  Prisma.RefreshTokenWhereInput,
  Prisma.RefreshTokenOrderByWithRelationInput
> {
  constructor() {
    super(prisma.refreshToken)
  }

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } })
  }

  revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
  }

  revokeAllForUser(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  /** Atomically revokes the presented token and issues its replacement — if the
   *  process crashed between two separate revoke-then-create calls, a refresh
   *  could revoke the old session without ever issuing the new one, forcing an
   *  unnecessary re-login. Wrapping both writes in one transaction makes token
   *  rotation all-or-nothing. */
  rotate(oldTokenId: string, newToken: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({ where: { id: oldTokenId }, data: { revokedAt: new Date() } })
      return tx.refreshToken.create({ data: newToken })
    })
  }
}

export const refreshTokenRepository = new RefreshTokenRepository()
