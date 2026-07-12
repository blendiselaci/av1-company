import type { GalleryImage, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

// "Unchecked" variants are used because the validated input is a flat object with a
// plain `projectId` scalar rather than Prisma's nested `project: { connect: { id } }`
// relation syntax.
class GalleryRepository extends BaseRepository<
  GalleryImage,
  Prisma.GalleryImageUncheckedCreateInput,
  Prisma.GalleryImageUncheckedUpdateInput,
  Prisma.GalleryImageWhereUniqueInput,
  Prisma.GalleryImageWhereInput,
  Prisma.GalleryImageOrderByWithRelationInput
> {
  constructor() {
    super(prisma.galleryImage)
  }
}

export const galleryRepository = new GalleryRepository()
