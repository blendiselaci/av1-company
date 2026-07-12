import type { Prisma, Testimonial } from '@prisma/client'
import { testimonialRepository } from '../repositories/testimonial.repository'
import { deleteAsset } from './upload.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { optimizeImage, type ResponsiveVariants } from '../utils/cloudinary-response'
import type {
  AdminListTestimonialsQuery,
  CreateTestimonialInput,
  PublicListTestimonialsQuery,
  UpdateTestimonialInput,
} from '../validators/testimonial.validator'

export type PublicTestimonial = Testimonial & { imageVariants?: ResponsiveVariants }

/** Public-response shaping only — admin reads/writes still see the raw stored
 *  `image`/`imagePublicId` columns untouched. `image` itself is optional
 *  (not every testimonial has a client photo), so this is a no-op when null. */
function toPublic(testimonial: Testimonial): PublicTestimonial {
  if (!testimonial.image) return testimonial
  const { url, variants } = optimizeImage(testimonial.image, testimonial.imagePublicId)
  return { ...testimonial, image: url, imageVariants: variants }
}

function buildWhere(query: AdminListTestimonialsQuery): Prisma.TestimonialWhereInput {
  const where: Prisma.TestimonialWhereInput = {}
  if (query.isPublished !== undefined) where.isPublished = query.isPublished
  return where
}

async function findTestimonials(query: AdminListTestimonialsQuery): Promise<{ items: Testimonial[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    testimonialRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    testimonialRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function listPublishedTestimonials(query: PublicListTestimonialsQuery) {
  const { items, meta } = await findTestimonials({ ...query, isPublished: true })
  return { items: items.map(toPublic), meta }
}

export function listAllTestimonials(query: AdminListTestimonialsQuery) {
  return findTestimonials(query)
}

export async function getTestimonialById(id: string): Promise<Testimonial> {
  const testimonial = await testimonialRepository.findUnique({ id })
  if (!testimonial) throw new NotFoundError('Testimonial')
  return testimonial
}

export function createTestimonial(input: CreateTestimonialInput): Promise<Testimonial> {
  return testimonialRepository.create(input)
}

export async function updateTestimonial(id: string, input: UpdateTestimonialInput): Promise<Testimonial> {
  await getTestimonialById(id)
  return testimonialRepository.update({ id }, input)
}

export async function deleteTestimonial(id: string): Promise<void> {
  const testimonial = await getTestimonialById(id)
  await testimonialRepository.delete({ id })

  if (testimonial.imagePublicId) {
    await deleteAsset(testimonial.imagePublicId, 'image').catch(() => undefined)
  }
}
