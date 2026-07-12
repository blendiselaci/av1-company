import type { Prisma, Video } from '@prisma/client'
import { videoRepository } from '../repositories/video.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { optimizeAssetUrl, optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type { AdminListVideosQuery, CreateVideoInput, PublicListVideosQuery, UpdateVideoInput } from '../validators/video.validator'

export type PublicVideo = Video & { thumbnailVariants?: ResponsiveVariants }

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  columns untouched. `thumbnail` is an image (gets size variants);
 *  `videoUrl` is a video asset (optimized in place, no size variants — a
 *  video doesn't have a meaningful "thumbnail/medium/original" split). */
function toPublic(video: Video): PublicVideo {
  const thumb = optimizeImage(video.thumbnail, video.thumbnailPublicId)
  return {
    ...video,
    thumbnail: thumb.url,
    thumbnailVariants: thumb.variants,
    videoUrl: optimizeAssetUrl(video.videoUrl, video.videoPublicId, 'video'),
  }
}

function buildWhere(query: AdminListVideosQuery): Prisma.VideoWhereInput {
  const where: Prisma.VideoWhereInput = {}
  if (query.category) where.category = query.category
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

async function findVideos(query: AdminListVideosQuery): Promise<{ items: Video[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    videoRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    videoRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function listPublishedVideos(query: PublicListVideosQuery) {
  const { items, meta } = await findVideos({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

export function listAllVideos(query: AdminListVideosQuery) {
  return findVideos(query)
}

export async function getVideoById(id: string): Promise<Video> {
  const video = await videoRepository.findUnique({ id })
  if (!video) throw new NotFoundError('Video')
  return video
}

export async function getPublishedVideoById(id: string): Promise<PublicVideo> {
  const video = await getVideoById(id)
  if (!video.isPublished) throw new NotFoundError('Video')
  return toPublic(video)
}

export function createVideo(input: CreateVideoInput): Promise<Video> {
  return videoRepository.create(input)
}

export async function updateVideo(id: string, input: UpdateVideoInput): Promise<Video> {
  await getVideoById(id)
  return videoRepository.update({ id }, input)
}

export async function deleteVideo(id: string): Promise<void> {
  const video = await getVideoById(id)
  await videoRepository.delete({ id })

  await Promise.all([
    video.thumbnailPublicId ? deleteAsset(video.thumbnailPublicId, 'image').catch(() => undefined) : null,
    video.videoPublicId ? deleteAsset(video.videoPublicId, 'video').catch(() => undefined) : null,
  ])
}
