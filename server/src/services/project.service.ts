import type { Prisma, Project } from '@prisma/client'
import { projectRepository } from '../repositories/project.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { ConflictError, NotFoundError } from '../utils/AppError'
import { optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type { AdminListProjectsQuery, CreateProjectInput, PublicListProjectsQuery, UpdateProjectInput } from '../validators/project.validator'

export type PublicProject = Project & { imageVariants?: ResponsiveVariants }

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  `image`/`imagePublicId` columns untouched. The `gallery` string[] has no
 *  per-item publicId tracking, so it's left as-is (nothing to optimize from). */
function toPublic(project: Project): PublicProject {
  const { url, variants } = optimizeImage(project.image, project.imagePublicId)
  return { ...project, image: url, imageVariants: variants }
}

function buildWhere(query: AdminListProjectsQuery): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {}
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

async function findProjects(query: AdminListProjectsQuery): Promise<{ items: Project[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    projectRepository.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      ...toSkipTake(query),
    }),
    projectRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

/** Public/frontend-facing — always scoped to published content, regardless of
 *  what the caller sends. */
export async function listPublishedProjects(query: PublicListProjectsQuery) {
  const { items, meta } = await findProjects({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

/** Admin-facing — sees everything, optionally filtered by isPublished. */
export function listAllProjects(query: AdminListProjectsQuery) {
  return findProjects(query)
}

export async function getProjectById(id: string): Promise<Project> {
  const project = await projectRepository.findUnique({ id })
  if (!project) throw new NotFoundError('Project')
  return project
}

export async function getPublishedProjectById(id: string): Promise<PublicProject> {
  const project = await getProjectById(id)
  if (!project.isPublished) throw new NotFoundError('Project')
  return toPublic(project)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const existing = await projectRepository.findBySlug(input.slug)
  if (existing) throw new ConflictError(`A project with slug "${input.slug}" already exists`)

  return projectRepository.create(input)
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  await getProjectById(id)

  if (input.slug) {
    const existing = await projectRepository.findBySlug(input.slug)
    if (existing && existing.id !== id) {
      throw new ConflictError(`A project with slug "${input.slug}" already exists`)
    }
  }

  return projectRepository.update({ id }, input)
}

export async function deleteProject(id: string): Promise<void> {
  const project = await getProjectById(id)
  await projectRepository.delete({ id })

  if (project.imagePublicId) {
    await deleteAsset(project.imagePublicId, 'image').catch(() => undefined)
  }
}
