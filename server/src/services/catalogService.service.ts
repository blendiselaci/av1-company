// Manages the "Service" content entity (e.g. "Garden Design", "Hardscaping") shown
// on the site's Services page — named catalogService.service.ts to avoid clashing
// with the generic notion of an application "service" module.
import type { Prisma, Service } from '@prisma/client'
import { serviceRepository } from '../repositories/service.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type {
  AdminListServicesQuery,
  CreateServiceInput,
  PublicListServicesQuery,
  UpdateServiceInput,
} from '../validators/service.validator'

export type PublicService = Service & { imageVariants?: ResponsiveVariants }

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  `image`/`imagePublicId` columns untouched. `image` itself is optional, so
 *  this is a no-op when null. */
function toPublic(service: Service): PublicService {
  if (!service.image) return service
  const { url, variants } = optimizeImage(service.image, service.imagePublicId)
  return { ...service, image: url, imageVariants: variants }
}

function buildWhere(query: AdminListServicesQuery): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {}
  if (query.isPublished !== undefined) where.isPublished = query.isPublished
  return where
}

async function findServices(query: AdminListServicesQuery): Promise<{ items: Service[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    serviceRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    serviceRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function listPublishedServices(query: PublicListServicesQuery) {
  const { items, meta } = await findServices({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

export function listAllServices(query: AdminListServicesQuery) {
  return findServices(query)
}

export async function getServiceById(id: string): Promise<Service> {
  const service = await serviceRepository.findUnique({ id })
  if (!service) throw new NotFoundError('Service')
  return service
}

export function createService(input: CreateServiceInput): Promise<Service> {
  return serviceRepository.create(input)
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<Service> {
  await getServiceById(id)
  return serviceRepository.update({ id }, input)
}

export async function deleteService(id: string): Promise<void> {
  const service = await getServiceById(id)
  await serviceRepository.delete({ id })

  if (service.imagePublicId) {
    await deleteAsset(service.imagePublicId, 'image').catch(() => undefined)
  }
}
