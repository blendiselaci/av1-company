import type { ContactMessage, Prisma } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class ContactRepository extends BaseRepository<
  ContactMessage,
  Prisma.ContactMessageCreateInput,
  Prisma.ContactMessageUpdateInput,
  Prisma.ContactMessageWhereUniqueInput,
  Prisma.ContactMessageWhereInput,
  Prisma.ContactMessageOrderByWithRelationInput
> {
  constructor() {
    super(prisma.contactMessage)
  }
}

export const contactRepository = new ContactRepository()
