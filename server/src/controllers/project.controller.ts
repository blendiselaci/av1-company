import type { Request, Response } from 'express'
import * as projectService from '../services/project.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type { AdminListProjectsQuery, CreateProjectInput, PublicListProjectsQuery, UpdateProjectInput } from '../validators/project.validator'

export const listPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListProjectsQuery
  const { items, meta } = await projectService.listPublishedProjects(query)
  sendSuccess(res, items, 200, meta)
})

export const getPublicProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getPublishedProjectById(req.params.id as string)
  sendSuccess(res, project)
})

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListProjectsQuery
  const { items, meta } = await projectService.listAllProjects(query)
  sendSuccess(res, items, 200, meta)
})

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id as string)
  sendSuccess(res, project)
})

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body as CreateProjectInput)
  sendSuccess(res, project, 201)
})

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params.id as string, req.body as UpdateProjectInput)
  sendSuccess(res, project)
})

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id as string)
  sendSuccess(res, { message: 'Project deleted' })
})
