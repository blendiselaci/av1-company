import type { Media, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class MediaRepository extends BaseRepository<
  Media,
  Prisma.MediaUncheckedCreateInput,
  Prisma.MediaUncheckedUpdateInput,
  Prisma.MediaWhereUniqueInput,
  Prisma.MediaWhereInput,
  Prisma.MediaOrderByWithRelationInput
> {
  constructor() {
    super(prisma.media)
  }

  findByPublicId(publicId: string): Promise<Media | null> {
    return prisma.media.findUnique({ where: { publicId } })
  }
}

export const mediaRepository = new MediaRepository()
