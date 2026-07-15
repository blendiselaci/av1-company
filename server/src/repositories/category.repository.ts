import type { Category, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput,
  Prisma.CategoryWhereUniqueInput,
  Prisma.CategoryWhereInput,
  Prisma.CategoryOrderByWithRelationInput
> {
  constructor() {
    super(prisma.category)
  }

  findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } })
  }
}

export const categoryRepository = new CategoryRepository()
