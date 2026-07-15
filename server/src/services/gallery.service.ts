import type { GalleryImage, Prisma } from '@prisma/client'
import { galleryRepository } from '../repositories/gallery.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type {
  AdminListGalleryQuery,
  CreateGalleryImageInput,
  PublicListGalleryQuery,
  UpdateGalleryImageInput,
} from '../validators/gallery.validator'

export type PublicGalleryImage = GalleryImage & { imageVariants?: ResponsiveVariants }

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  `image`/`imagePublicId` columns untouched. */
function toPublic(image: GalleryImage): PublicGalleryImage {
  const { url, variants } = optimizeImage(image.image, image.imagePublicId)
  return { ...image, image: url, imageVariants: variants }
}

function buildWhere(query: AdminListGalleryQuery): Prisma.GalleryImageWhereInput {
  const where: Prisma.GalleryImageWhereInput = {}
  if (query.categoryId) where.categoryId = query.categoryId
  if (query.isPublished !== undefined) where.isPublished = query.isPublished
  if (query.search) {
    where.OR = [
      { titleEn: { contains: query.search, mode: 'insensitive' } },
      { titleDe: { contains: query.search, mode: 'insensitive' } },
      { titleSq: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  return where
}

async function findGalleryImages(query: AdminListGalleryQuery): Promise<{ items: GalleryImage[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    galleryRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    galleryRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function listPublishedGalleryImages(query: PublicListGalleryQuery) {
  const { items, meta } = await findGalleryImages({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

export function listAllGalleryImages(query: AdminListGalleryQuery) {
  return findGalleryImages(query)
}

export async function getGalleryImageById(id: string): Promise<GalleryImage> {
  const image = await galleryRepository.findUnique({ id })
  if (!image) throw new NotFoundError('Gallery image')
  return image
}

export async function getPublishedGalleryImageById(id: string): Promise<PublicGalleryImage> {
  const image = await getGalleryImageById(id)
  if (!image.isPublished) throw new NotFoundError('Gallery image')
  return toPublic(image)
}

export function createGalleryImage(input: CreateGalleryImageInput): Promise<GalleryImage> {
  return galleryRepository.create(input)
}

export async function updateGalleryImage(id: string, input: UpdateGalleryImageInput): Promise<GalleryImage> {
  await getGalleryImageById(id)
  return galleryRepository.update({ id }, input)
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const image = await getGalleryImageById(id)
  await galleryRepository.delete({ id })

  if (image.imagePublicId) {
    await deleteAsset(image.imagePublicId, 'image').catch(() => undefined)
  }
}
