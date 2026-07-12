import type { Request, Response } from 'express'
import * as galleryService from '../services/gallery.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  AdminListGalleryQuery,
  CreateGalleryImageInput,
  PublicListGalleryQuery,
  UpdateGalleryImageInput,
} from '../validators/gallery.validator'

export const listPublicGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListGalleryQuery
  const { items, meta } = await galleryService.listPublishedGalleryImages(query)
  sendSuccess(res, items, 200, meta)
})

export const getPublicGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await galleryService.getPublishedGalleryImageById(req.params.id as string)
  sendSuccess(res, image)
})

export const listGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListGalleryQuery
  const { items, meta } = await galleryService.listAllGalleryImages(query)
  sendSuccess(res, items, 200, meta)
})

export const getGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await galleryService.getGalleryImageById(req.params.id as string)
  sendSuccess(res, image)
})

export const createGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await galleryService.createGalleryImage(req.body as CreateGalleryImageInput)
  sendSuccess(res, image, 201)
})

export const updateGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await galleryService.updateGalleryImage(req.params.id as string, req.body as UpdateGalleryImageInput)
  sendSuccess(res, image)
})

export const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  await galleryService.deleteGalleryImage(req.params.id as string)
  sendSuccess(res, { message: 'Gallery image deleted' })
})
