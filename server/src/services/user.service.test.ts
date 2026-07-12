import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@prisma/client'

const { mockUserRepository } = vi.hoisted(() => ({
  mockUserRepository: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}))

vi.mock('../repositories/user.repository', () => ({ userRepository: mockUserRepository }))

import { createUser, deleteUser, getUserById, listUsers, updateUser } from './user.service'
import { BadRequestError, ConflictError, NotFoundError } from '../utils/AppError'

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user_1',
    email: 'editor@av1-company.al',
    passwordHash: '$2b$12$hash',
    name: 'Editor One',
    role: 'EDITOR',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listUsers', () => {
  it('never includes passwordHash in the results', async () => {
    mockUserRepository.findMany.mockResolvedValue([buildUser()])
    mockUserRepository.count.mockResolvedValue(1)

    const { items } = await listUsers({ page: 1, limit: 20 })

    expect(items[0]).not.toHaveProperty('passwordHash')
    expect(items[0]).toEqual({
      id: 'user_1',
      email: 'editor@av1-company.al',
      name: 'Editor One',
      role: 'EDITOR',
      createdAt: expect.any(Date),
    })
  })
})

describe('getUserById', () => {
  it('throws NotFoundError when missing', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null)
    await expect(getUserById('missing')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('createUser', () => {
  it('hashes the password and never returns it', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockUserRepository.create.mockResolvedValue(buildUser())

    const result = await createUser({
      email: 'editor@av1-company.al',
      name: 'Editor One',
      password: 'ChangeMe123!',
      role: 'EDITOR',
      isActive: true,
    })

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: expect.not.stringMatching('ChangeMe123!') }),
    )
    expect(result).not.toHaveProperty('passwordHash')
  })

  it('rejects a duplicate email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(buildUser())
    await expect(
      createUser({ email: 'editor@av1-company.al', name: 'Dup', password: 'ChangeMe123!', role: 'EDITOR', isActive: true }),
    ).rejects.toBeInstanceOf(ConflictError)
  })
})

describe('updateUser', () => {
  it('re-hashes the password only when one is provided', async () => {
    mockUserRepository.findUnique.mockResolvedValue(buildUser())
    mockUserRepository.update.mockResolvedValue(buildUser({ name: 'Renamed' }))

    await updateUser('user_1', { name: 'Renamed' })

    expect(mockUserRepository.update).toHaveBeenCalledWith({ id: 'user_1' }, { name: 'Renamed' })
  })

  it('throws NotFoundError when the user does not exist', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null)
    await expect(updateUser('missing', { name: 'X' })).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('deleteUser', () => {
  it('prevents an admin from deleting their own account', async () => {
    await expect(deleteUser('user_1', 'user_1')).rejects.toBeInstanceOf(BadRequestError)
    expect(mockUserRepository.delete).not.toHaveBeenCalled()
  })

  it('deletes a different user', async () => {
    mockUserRepository.findUnique.mockResolvedValue(buildUser())
    mockUserRepository.delete.mockResolvedValue(buildUser())

    await deleteUser('user_1', 'admin_1')

    expect(mockUserRepository.delete).toHaveBeenCalledWith({ id: 'user_1' })
  })

  it('throws NotFoundError when the target user does not exist', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null)
    await expect(deleteUser('missing', 'admin_1')).rejects.toBeInstanceOf(NotFoundError)
  })
})
