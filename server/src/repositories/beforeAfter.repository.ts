import type { BeforeAfterProject, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class BeforeAfterRepository extends BaseRepository<
  BeforeAfterProject,
  Prisma.BeforeAfterProjectCreateInput,
  Prisma.BeforeAfterProjectUpdateInput,
  Prisma.BeforeAfterProjectWhereUniqueInput,
  Prisma.BeforeAfterProjectWhereInput,
  Prisma.BeforeAfterProjectOrderByWithRelationInput
> {
  constructor() {
    super(prisma.beforeAfterProject)
  }
}

export const beforeAfterRepository = new BeforeAfterRepository()
