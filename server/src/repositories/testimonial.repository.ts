import type { Prisma, Testimonial } from '@prisma/client'
import { prisma } from '../config/database'
import { BaseRepository } from './base.repository'

class TestimonialRepository extends BaseRepository<
  Testimonial,
  Prisma.TestimonialCreateInput,
  Prisma.TestimonialUpdateInput,
  Prisma.TestimonialWhereUniqueInput,
  Prisma.TestimonialWhereInput,
  Prisma.TestimonialOrderByWithRelationInput
> {
  constructor() {
    super(prisma.testimonial)
  }
}

export const testimonialRepository = new TestimonialRepository()
