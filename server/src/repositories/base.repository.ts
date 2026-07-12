/**
 * Minimal structural contract every Prisma model delegate satisfies
 * (`prisma.project`, `prisma.galleryImage`, ...). Declaring it ourselves —
 * rather than importing Prisma's generated per-model delegate types — lets one
 * generic repository work across every entity without a wall of type gymnastics.
 */
interface CrudDelegate<Entity, CreateArgs, UpdateArgs, WhereUniqueArgs, WhereArgs, OrderByArgs> {
  findMany(args?: {
    where?: WhereArgs
    orderBy?: OrderByArgs | OrderByArgs[]
    skip?: number
    take?: number
  }): Promise<Entity[]>
  findUnique(args: { where: WhereUniqueArgs }): Promise<Entity | null>
  create(args: { data: CreateArgs }): Promise<Entity>
  update(args: { where: WhereUniqueArgs; data: UpdateArgs }): Promise<Entity>
  delete(args: { where: WhereUniqueArgs }): Promise<Entity>
  count(args?: { where?: WhereArgs }): Promise<number>
}

/**
 * Generic CRUD data-access layer shared by every content entity (Project,
 * GalleryImage, Video, Testimonial, Faq, Service, ...). Entity-specific
 * repositories extend this and add only what's genuinely different for that
 * model (e.g. `findBySlug` on ProjectRepository) instead of re-implementing
 * findMany/create/update/delete/count eight times over.
 */
export class BaseRepository<Entity, CreateArgs, UpdateArgs, WhereUniqueArgs, WhereArgs, OrderByArgs> {
  constructor(
    protected readonly delegate: CrudDelegate<Entity, CreateArgs, UpdateArgs, WhereUniqueArgs, WhereArgs, OrderByArgs>,
  ) {}

  findMany(args?: {
    where?: WhereArgs
    orderBy?: OrderByArgs | OrderByArgs[]
    skip?: number
    take?: number
  }): Promise<Entity[]> {
    return this.delegate.findMany(args)
  }

  findUnique(where: WhereUniqueArgs): Promise<Entity | null> {
    return this.delegate.findUnique({ where })
  }

  create(data: CreateArgs): Promise<Entity> {
    return this.delegate.create({ data })
  }

  update(where: WhereUniqueArgs, data: UpdateArgs): Promise<Entity> {
    return this.delegate.update({ where, data })
  }

  delete(where: WhereUniqueArgs): Promise<Entity> {
    return this.delegate.delete({ where })
  }

  count(where?: WhereArgs): Promise<number> {
    return this.delegate.count({ where })
  }
}
