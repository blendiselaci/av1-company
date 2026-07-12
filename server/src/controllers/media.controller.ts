import type { Request, Response } from 'express'
import type { Media } from '@prisma/client'
import * as mediaService from '../services/media.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import { BadRequestError } from '../utils/AppError'
import type { ListMediaQuery, UploadMediaInput } from '../validators/media.validator'

function serializeMedia(media: Media) {
  return { ...media, variants: mediaService.getOptimizedVariants(media) }
}

export const uploadSingleMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file
  if (!file) throw new BadRequestError('No file provided (expected field "file")')
  const { category } = req.body as UploadMediaInput

  const media = await mediaService.createMedia(file, category, req.user!.id)
  sendSuccess(res, serializeMedia(media), 201)
})

export const uploadMultipleMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) throw new BadRequestError('No files provided (expected field "files")')
  const { category } = req.body as UploadMediaInput

  const media = await mediaService.createManyMedia(files, category, req.user!.id)
  sendSuccess(res, media.map(serializeMedia), 201)
})

export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListMediaQuery
  const { items, meta } = await mediaService.listMedia(query)
  sendSuccess(res, items.map(serializeMedia), 200, meta)
})

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.getMediaById(req.params.id as string)
  sendSuccess(res, serializeMedia(media))
})

export const replaceMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file
  if (!file) throw new BadRequestError('No file provided (expected field "file")')

  const media = await mediaService.replaceMedia(req.params.id as string, file)
  sendSuccess(res, serializeMedia(media))
})

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMedia(req.params.id as string)
  sendSuccess(res, { message: 'Media deleted' })
})
