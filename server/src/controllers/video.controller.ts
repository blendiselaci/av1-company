import type { Request, Response } from 'express'
import * as videoService from '../services/video.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type { AdminListVideosQuery, CreateVideoInput, PublicListVideosQuery, UpdateVideoInput } from '../validators/video.validator'

export const listPublicVideos = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListVideosQuery
  const { items, meta } = await videoService.listPublishedVideos(query)
  sendSuccess(res, items, 200, meta)
})

export const getPublicVideo = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.getPublishedVideoById(req.params.id as string)
  sendSuccess(res, video)
})

export const listVideos = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListVideosQuery
  const { items, meta } = await videoService.listAllVideos(query)
  sendSuccess(res, items, 200, meta)
})

export const getVideo = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.getVideoById(req.params.id as string)
  sendSuccess(res, video)
})

export const createVideo = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.createVideo(req.body as CreateVideoInput)
  sendSuccess(res, video, 201)
})

export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.updateVideo(req.params.id as string, req.body as UpdateVideoInput)
  sendSuccess(res, video)
})

export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  await videoService.deleteVideo(req.params.id as string)
  sendSuccess(res, { message: 'Video deleted' })
})
