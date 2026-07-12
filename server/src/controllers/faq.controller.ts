import type { Request, Response } from 'express'
import * as faqService from '../services/faq.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type { AdminListFaqsQuery, CreateFaqInput, PublicListFaqsQuery, UpdateFaqInput } from '../validators/faq.validator'

export const listPublicFaqs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListFaqsQuery
  const { items, meta } = await faqService.listPublishedFaqs(query)
  sendSuccess(res, items, 200, meta)
})

export const listFaqs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListFaqsQuery
  const { items, meta } = await faqService.listAllFaqs(query)
  sendSuccess(res, items, 200, meta)
})

export const getFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.getFaqById(req.params.id as string)
  sendSuccess(res, faq)
})

export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.createFaq(req.body as CreateFaqInput)
  sendSuccess(res, faq, 201)
})

export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.updateFaq(req.params.id as string, req.body as UpdateFaqInput)
  sendSuccess(res, faq)
})

export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  await faqService.deleteFaq(req.params.id as string)
  sendSuccess(res, { message: 'FAQ deleted' })
})
