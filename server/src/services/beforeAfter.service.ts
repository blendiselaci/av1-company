import type { BeforeAfterProject, Prisma } from '@prisma/client'
import { beforeAfterRepository } from '../repositories/beforeAfter.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type {
  AdminListBeforeAfterQuery,
  CreateBeforeAfterInput,
  PublicListBeforeAfterQuery,
  UpdateBeforeAfterInput,
} from '../validators/beforeAfter.validator'

export type PublicBeforeAfterProject = BeforeAfterProject & {
  beforeImageVariants?: ResponsiveVariants
  afterImageVariants?: ResponsiveVariants
}

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  image/publicId columns untouched. */
function toPublic(project: BeforeAfterProject): PublicBeforeAfterProject {
  const before = optimizeImage(project.beforeImage, project.beforeImagePublicId)
  const after = optimizeImage(project.afterImage, project.afterImagePublicId)
  return {
    ...project,
    beforeImage: before.url,
    beforeImageVariants: before.variants,
    afterImage: after.url,
    afterImageVariants: after.variants,
  }
}

function buildWhere(query: AdminListBeforeAfterQuery): Prisma.BeforeAfterProjectWhereInput {
  const where: Prisma.BeforeAfterProjectWhereInput = {}
  if (query.category) where.category = query.category
  if (query.isPublished !== undefined) where.isPublished = query.isPublished
  if (query.search) {
    where.OR = [
      { titleEn: { contains: query.search, mode: 'insensitive' } },
      { titleDe: { contains: query.search, mode: 'insensitive' } },
      { titleSq: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  return where
}

async function findBeforeAfterProjects(
  query: AdminListBeforeAfterQuery,
): Promise<{ items: BeforeAfterProject[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    beforeAfterRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    beforeAfterRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function listPublishedBeforeAfterProjects(query: PublicListBeforeAfterQuery) {
  const { items, meta } = await findBeforeAfterProjects({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

export function listAllBeforeAfterProjects(query: AdminListBeforeAfterQuery) {
  return findBeforeAfterProjects(query)
}

export async function getBeforeAfterProjectById(id: string): Promise<BeforeAfterProject> {
  const project = await beforeAfterRepository.findUnique({ id })
  if (!project) throw new NotFoundError('Before/after project')
  return project
}

export async function getPublishedBeforeAfterProjectById(id: string): Promise<PublicBeforeAfterProject> {
  const project = await getBeforeAfterProjectById(id)
  if (!project.isPublished) throw new NotFoundError('Before/after project')
  return toPublic(project)
}

export function createBeforeAfterProject(input: CreateBeforeAfterInput): Promise<BeforeAfterProject> {
  return beforeAfterRepository.create(input)
}

export async function updateBeforeAfterProject(id: string, input: UpdateBeforeAfterInput): Promise<BeforeAfterProject> {
  await getBeforeAfterProjectById(id)
  return beforeAfterRepository.update({ id }, input)
}

export async function deleteBeforeAfterProject(id: string): Promise<void> {
  const project = await getBeforeAfterProjectById(id)
  await beforeAfterRepository.delete({ id })

  await Promise.all([
    project.beforeImagePublicId ? deleteAsset(project.beforeImagePublicId, 'image').catch(() => undefined) : null,
    project.afterImagePublicId ? deleteAsset(project.afterImagePublicId, 'image').catch(() => undefined) : null,
  ])
}
