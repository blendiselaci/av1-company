import type { Media, MediaCategory, Prisma } from '@prisma/client'
import { mediaRepository } from '../repositories/media.repository'
import {
  buildResponsiveVariants,
  deleteAsset,
  replaceAsset,
  uploadAsset,
  type AssetResourceType,
  type ResponsiveVariants,
} from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import type { ListMediaQuery } from '../validators/media.validator'

/** Cloudinary subfolder per category, so the media library stays browsable
 *  directly in the Cloudinary dashboard too, not just through this API. */
const CATEGORY_SUBFOLDER: Record<MediaCategory, string> = {
  PROJECT_COVER: 'projects',
  GALLERY: 'gallery',
  BEFORE_AFTER: 'before-after',
  SERVICE: 'services',
  TESTIMONIAL_AVATAR: 'testimonials',
  VIDEO: 'videos',
  VIDEO_THUMBNAIL: 'videos/thumbnails',
}

function resourceTypeFromMimetype(mimetype: string): AssetResourceType {
  return mimetype.startsWith('video/') ? 'video' : 'image'
}

type UploadedFile = Pick<Express.Multer.File, 'buffer' | 'mimetype' | 'size'>

export async function createMedia(file: UploadedFile, category: MediaCategory, uploadedById: string): Promise<Media> {
  const resourceType = resourceTypeFromMimetype(file.mimetype)
  const result = await uploadAsset(file.buffer, resourceType, CATEGORY_SUBFOLDER[category])

  return mediaRepository.create({
    url: result.url,
    publicId: result.publicId,
    resourceType: resourceType === 'video' ? 'VIDEO' : 'IMAGE',
    category,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    uploadedById,
  })
}

export function createManyMedia(files: UploadedFile[], category: MediaCategory, uploadedById: string): Promise<Media[]> {
  return Promise.all(files.map((file) => createMedia(file, category, uploadedById)))
}

export async function getMediaById(id: string): Promise<Media> {
  const media = await mediaRepository.findUnique({ id })
  if (!media) throw new NotFoundError('Media')
  return media
}

function buildWhere(query: ListMediaQuery): Prisma.MediaWhereInput {
  const where: Prisma.MediaWhereInput = {}
  if (query.category) where.category = query.category
  return where
}

export async function listMedia(query: ListMediaQuery): Promise<{ items: Media[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    mediaRepository.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    mediaRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

/** Uploads a replacement asset into the same category's subfolder, deletes the
 *  old Cloudinary asset, and updates the existing Media row in place — the
 *  Media `id` a client already has stays valid. */
export async function replaceMedia(id: string, file: UploadedFile): Promise<Media> {
  const existing = await getMediaById(id)
  const resourceType = resourceTypeFromMimetype(file.mimetype)
  const result = await replaceAsset(file.buffer, existing.publicId, resourceType, CATEGORY_SUBFOLDER[existing.category])

  return mediaRepository.update(
    { id },
    {
      url: result.url,
      publicId: result.publicId,
      resourceType: resourceType === 'video' ? 'VIDEO' : 'IMAGE',
      mimeType: file.mimetype,
      sizeBytes: file.size,
    },
  )
}

/** Permanent delete: removes the Prisma record and the Cloudinary asset. The DB
 *  row is dropped first — if the Cloudinary call then fails, the asset is merely
 *  orphaned in storage rather than a "deleted" record pointing at a live file. */
export async function deleteMedia(id: string): Promise<void> {
  const media = await getMediaById(id)
  await mediaRepository.delete({ id })
  await deleteAsset(media.publicId, media.resourceType === 'VIDEO' ? 'video' : 'image').catch(() => undefined)
}

export function getOptimizedVariants(media: Pick<Media, 'publicId' | 'resourceType'>): ResponsiveVariants {
  return buildResponsiveVariants(media.publicId, media.resourceType === 'VIDEO' ? 'video' : 'image')
}
