import type { Prisma, User } from '@prisma/client'
import { userRepository } from '../repositories/user.repository'
import { hashPassword } from '../utils/password'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { BadRequestError, ConflictError, NotFoundError } from '../utils/AppError'
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '../validators/user.validator'
import type { PublicUser } from './auth.service'

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
}

function buildWhere(query: ListUsersQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}
  if (query.role) where.role = query.role
  if (query.isActive !== undefined) where.isActive = query.isActive
  return where
}

export async function listUsers(query: ListUsersQuery): Promise<{ items: PublicUser[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    userRepository.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    userRepository.count(where),
  ])
  return { items: items.map(toPublicUser), meta: buildPaginationMeta(query.page, query.limit, total) }
}

async function findUserOr404(id: string): Promise<User> {
  const user = await userRepository.findUnique({ id })
  if (!user) throw new NotFoundError('User')
  return user
}

export async function getUserById(id: string): Promise<PublicUser> {
  return toPublicUser(await findUserOr404(id))
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const existing = await userRepository.findByEmail(input.email)
  if (existing) throw new ConflictError(`A user with email "${input.email}" already exists`)

  const passwordHash = await hashPassword(input.password)
  const user = await userRepository.create({
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role,
    isActive: input.isActive,
  })
  return toPublicUser(user)
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<PublicUser> {
  await findUserOr404(id)

  const { password, ...rest } = input
  const data: Prisma.UserUpdateInput = { ...rest }
  if (password) data.passwordHash = await hashPassword(password)

  const user = await userRepository.update({ id }, data)
  return toPublicUser(user)
}

export async function deleteUser(id: string, requestedById: string): Promise<void> {
  if (id === requestedById) {
    throw new BadRequestError('You cannot delete your own account')
  }
  await findUserOr404(id)
  await userRepository.delete({ id })
}
