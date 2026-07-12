import type { Request, Response } from 'express'
import * as beforeAfterService from '../services/beforeAfter.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  AdminListBeforeAfterQuery,
  CreateBeforeAfterInput,
  PublicListBeforeAfterQuery,
  UpdateBeforeAfterInput,
} from '../validators/beforeAfter.validator'

export const listPublicBeforeAfterProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListBeforeAfterQuery
  const { items, meta } = await beforeAfterService.listPublishedBeforeAfterProjects(query)
  sendSuccess(res, items, 200, meta)
})

export const getPublicBeforeAfterProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await beforeAfterService.getPublishedBeforeAfterProjectById(req.params.id as string)
  sendSuccess(res, project)
})

export const listBeforeAfterProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListBeforeAfterQuery
  const { items, meta } = await beforeAfterService.listAllBeforeAfterProjects(query)
  sendSuccess(res, items, 200, meta)
})

export const getBeforeAfterProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await beforeAfterService.getBeforeAfterProjectById(req.params.id as string)
  sendSuccess(res, project)
})

export const createBeforeAfterProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await beforeAfterService.createBeforeAfterProject(req.body as CreateBeforeAfterInput)
  sendSuccess(res, project, 201)
})

export const updateBeforeAfterProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await beforeAfterService.updateBeforeAfterProject(req.params.id as string, req.body as UpdateBeforeAfterInput)
  sendSuccess(res, project)
})

export const deleteBeforeAfterProject = asyncHandler(async (req: Request, res: Response) => {
  await beforeAfterService.deleteBeforeAfterProject(req.params.id as string)
  sendSuccess(res, { message: 'Before/after project deleted' })
})
