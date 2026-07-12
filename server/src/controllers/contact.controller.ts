import type { Request, Response } from 'express'
import * as contactService from '../services/contact.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  CreateContactMessageInput,
  ListContactMessagesQuery,
  UpdateContactMessageStatusInput,
} from '../validators/contact.validator'

export const submitContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.submitContactMessage(req.body as CreateContactMessageInput)
  sendSuccess(res, { message: 'Thank you — we will be in touch shortly.', id: message.id }, 201)
})

export const listContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListContactMessagesQuery
  const { items, meta } = await contactService.listContactMessages(query)
  sendSuccess(res, items, 200, meta)
})

export const getContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.getAndMarkContactMessageRead(req.params.id as string)
  sendSuccess(res, message)
})

export const updateContactMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.updateContactMessageStatus(
    req.params.id as string,
    req.body as UpdateContactMessageStatusInput,
  )
  sendSuccess(res, message)
})

export const deleteContactMessage = asyncHandler(async (req: Request, res: Response) => {
  await contactService.deleteContactMessage(req.params.id as string)
  sendSuccess(res, { message: 'Contact message deleted' })
})
