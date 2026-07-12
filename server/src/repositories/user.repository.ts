import type { Prisma, User } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput
> {
  constructor() {
    super(prisma.user)
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }
}

export const userRepository = new UserRepository()
