import type { Faq, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class FaqRepository extends BaseRepository<
  Faq,
  Prisma.FaqCreateInput,
  Prisma.FaqUpdateInput,
  Prisma.FaqWhereUniqueInput,
  Prisma.FaqWhereInput,
  Prisma.FaqOrderByWithRelationInput
> {
  constructor() {
    super(prisma.faq)
  }
}

export const faqRepository = new FaqRepository()
