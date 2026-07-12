import type { Prisma, Project } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class ProjectRepository extends BaseRepository<
  Project,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput,
  Prisma.ProjectWhereUniqueInput,
  Prisma.ProjectWhereInput,
  Prisma.ProjectOrderByWithRelationInput
> {
  constructor() {
    super(prisma.project)
  }

  findBySlug(slug: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { slug } })
  }
}

export const projectRepository = new ProjectRepository()
