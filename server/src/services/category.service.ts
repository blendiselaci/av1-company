import type { Category, Prisma } from '@prisma/client'
import { categoryRepository } from '../repositories/category.repository'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { ConflictError, NotFoundError } from '../utils/AppError'
import { slugify } from '../utils/slug'
import type {
  AdminListCategoriesQuery,
  CreateCategoryInput,
  PublicListCategoriesQuery,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from '../validators/category.validator'

async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(base) || 'category'
  let slug = baseSlug
  let suffix = 2
  // Small, fixed taxonomy — a linear uniqueness probe is simple and plenty fast.
  while (true) {
    const existing = await categoryRepository.findBySlug(slug)
    if (!existing || existing.id === excludeId) return slug
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

async function assertNamesNotDuplicated(
  input: { nameSq?: string; nameEn?: string; nameDe?: string },
  excludeId?: string,
): Promise<void> {
  const checks: { field: 'nameSq' | 'nameEn' | 'nameDe'; label: string }[] = [
    { field: 'nameSq', label: 'Albanian' },
    { field: 'nameEn', label: 'English' },
    { field: 'nameDe', label: 'German' },
  ]

  for (const { field, label } of checks) {
    const value = input[field]
    if (!value) continue
    const matches = await categoryRepository.findMany({
      where: { [field]: { equals: value, mode: 'insensitive' } } as Prisma.CategoryWhereInput,
    })
    if (matches.some((m) => m.id !== excludeId)) {
      throw new ConflictError(`A category with this ${label} name already exists`)
    }
  }
}

function buildWhere(query: AdminListCategoriesQuery): Prisma.CategoryWhereInput {
  const where: Prisma.CategoryWhereInput = {}
  if (query.isActive !== undefined) where.isActive = query.isActive
  return where
}

async function findCategories(query: AdminListCategoriesQuery): Promise<{ items: Category[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    categoryRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], ...toSkipTake(query) }),
    categoryRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export function listActiveCategories(query: PublicListCategoriesQuery) {
  return findCategories({ ...query, isActive: true })
}

export function listAllCategories(query: AdminListCategoriesQuery) {
  return findCategories(query)
}

export async function getCategoryById(id: string): Promise<Category> {
  const category = await categoryRepository.findUnique({ id })
  if (!category) throw new NotFoundError('Category')
  return category
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  await assertNamesNotDuplicated(input)

  const slugBase = input.slug && input.slug.length > 0 ? input.slug : input.nameEn
  const slug = await generateUniqueSlug(slugBase)

  return categoryRepository.create({ ...input, slug })
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  await getCategoryById(id)
  await assertNamesNotDuplicated(input, id)

  let slug = input.slug
  if (slug !== undefined) {
    slug = slug.length > 0 ? await generateUniqueSlug(slug, id) : undefined
  }

  return categoryRepository.update({ id }, { ...input, ...(slug !== undefined ? { slug } : {}) })
}

/** Deleting a category leaves any content that used it uncategorized (the
 *  categoryId foreign key is ON DELETE SET NULL) rather than failing —
 *  existing projects/gallery/videos/before-after entries are never lost. */
export async function deleteCategory(id: string): Promise<void> {
  await getCategoryById(id)
  await categoryRepository.delete({ id })
}

export async function reorderCategories(input: ReorderCategoriesInput): Promise<Category[]> {
  await Promise.all(input.items.map((item) => categoryRepository.update({ id: item.id }, { order: item.order })))
  return categoryRepository.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
}
