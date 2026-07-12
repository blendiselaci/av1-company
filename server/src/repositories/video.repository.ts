import type { Prisma, Video } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

// "Unchecked" variants — see gallery.repository.ts for why (flat `projectId` scalar
// rather than nested relation-connect syntax).
class VideoRepository extends BaseRepository<
  Video,
  Prisma.VideoUncheckedCreateInput,
  Prisma.VideoUncheckedUpdateInput,
  Prisma.VideoWhereUniqueInput,
  Prisma.VideoWhereInput,
  Prisma.VideoOrderByWithRelationInput
> {
  constructor() {
    super(prisma.video)
  }
}

export const videoRepository = new VideoRepository()
