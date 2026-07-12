import type { Request, Response } from 'express'
import * as testimonialService from '../services/testimonial.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  AdminListTestimonialsQuery,
  CreateTestimonialInput,
  PublicListTestimonialsQuery,
  UpdateTestimonialInput,
} from '../validators/testimonial.validator'

export const listPublicTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListTestimonialsQuery
  const { items, meta } = await testimonialService.listPublishedTestimonials(query)
  sendSuccess(res, items, 200, meta)
})

export const listTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListTestimonialsQuery
  const { items, meta } = await testimonialService.listAllTestimonials(query)
  sendSuccess(res, items, 200, meta)
})

export const getTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.getTestimonialById(req.params.id as string)
  sendSuccess(res, testimonial)
})

export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.createTestimonial(req.body as CreateTestimonialInput)
  sendSuccess(res, testimonial, 201)
})

export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.updateTestimonial(req.params.id as string, req.body as UpdateTestimonialInput)
  sendSuccess(res, testimonial)
})

export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  await testimonialService.deleteTestimonial(req.params.id as string)
  sendSuccess(res, { message: 'Testimonial deleted' })
})
