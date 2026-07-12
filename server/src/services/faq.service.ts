import type { Faq, Prisma } from '@prisma/client'
import { faqRepository } from '../repositories/faq.repository'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import type { AdminListFaqsQuery, CreateFaqInput, PublicListFaqsQuery, UpdateFaqInput } from '../validators/faq.validator'

function buildWhere(query: AdminListFaqsQuery): Prisma.FaqWhereInput {
  const where: Prisma.FaqWhereInput = {}
  if (query.isPublished !== undefined) where.isPublished = query.isPublished
  return where
}

async function findFaqs(query: AdminListFaqsQuery): Promise<{ items: Faq[]; meta: PaginationMeta }> {
  const where = buildWhere(query)
  const [items, total] = await Promise.all([
    faqRepository.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], ...toSkipTake(query) }),
    faqRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export function listPublishedFaqs(query: PublicListFaqsQuery) {
  return findFaqs({ ...query, isPublished: true })
}

export function listAllFaqs(query: AdminListFaqsQuery) {
  return findFaqs(query)
}

export async function getFaqById(id: string): Promise<Faq> {
  const faq = await faqRepository.findUnique({ id })
  if (!faq) throw new NotFoundError('FAQ')
  return faq
}

export function createFaq(input: CreateFaqInput): Promise<Faq> {
  return faqRepository.create(input)
}

export async function updateFaq(id: string, input: UpdateFaqInput): Promise<Faq> {
  await getFaqById(id)
  return faqRepository.update({ id }, input)
}

export async function deleteFaq(id: string): Promise<void> {
  await getFaqById(id)
  await faqRepository.delete({ id })
}
