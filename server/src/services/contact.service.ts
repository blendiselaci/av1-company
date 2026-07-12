import type { ContactMessage, Prisma } from '@prisma/client'
import { contactRepository } from '../repositories/contact.repository'
import { sendContactNotification } from './email.service'
import { buildPaginationMeta, type PaginationMeta } from '../utils/apiResponse'
import { toSkipTake } from '../utils/pagination'
import { NotFoundError } from '../utils/AppError'
import { captureException } from '../utils/monitoring'
import type {
  CreateContactMessageInput,
  ListContactMessagesQuery,
  UpdateContactMessageStatusInput,
} from '../validators/contact.validator'

export async function submitContactMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
  const created = await contactRepository.create(input)

  // Fire-and-forget: the message is already durably stored, so a failed or
  // unconfigured email provider must never turn a successful submission into
  // an error response.
  sendContactNotification(created).catch((error: unknown) => captureException(error, { context: 'contact-notification' }))

  return created
}

export async function listContactMessages(
  query: ListContactMessagesQuery,
): Promise<{ items: ContactMessage[]; meta: PaginationMeta }> {
  const where: Prisma.ContactMessageWhereInput = {}
  if (query.status) where.status = query.status

  const [items, total] = await Promise.all([
    contactRepository.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    contactRepository.count(where),
  ])
  return { items, meta: buildPaginationMeta(query.page, query.limit, total) }
}

export async function getContactMessageById(id: string): Promise<ContactMessage> {
  const message = await contactRepository.findUnique({ id })
  if (!message) throw new NotFoundError('Contact message')
  return message
}

/** Fetching a message marks it read if it was still new — mirrors the common
 *  "open to mark as read" inbox pattern admins expect. */
export async function getAndMarkContactMessageRead(id: string): Promise<ContactMessage> {
  const message = await getContactMessageById(id)
  if (message.status === 'NEW') {
    return contactRepository.update({ id }, { status: 'READ' })
  }
  return message
}

export async function updateContactMessageStatus(id: string, input: UpdateContactMessageStatusInput): Promise<ContactMessage> {
  await getContactMessageById(id)
  return contactRepository.update({ id }, input)
}

export async function deleteContactMessage(id: string): Promise<void> {
  await getContactMessageById(id)
  await contactRepository.delete({ id })
}
