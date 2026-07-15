import type { Prisma, Service } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class ServiceRepository extends BaseRepository<
  Service,
  Prisma.ServiceCreateInput,
  Prisma.ServiceUpdateInput,
  Prisma.ServiceWhereUniqueInput,
  Prisma.ServiceWhereInput,
  Prisma.ServiceOrderByWithRelationInput
> {
  constructor() {
    super(prisma.service)
  }

  findBySlug(slug: string): Promise<Service | null> {
    return prisma.service.findUnique({ where: { slug } })
  }
}

export const serviceRepository = new ServiceRepository()
