import type { Request, Response } from 'express'
import * as catalogServiceService from '../services/catalogService.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  AdminListServicesQuery,
  CreateServiceInput,
  PublicListServicesQuery,
  UpdateServiceInput,
} from '../validators/service.validator'

export const listPublicServices = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListServicesQuery
  const { items, meta } = await catalogServiceService.listPublishedServices(query)
  sendSuccess(res, items, 200, meta)
})

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListServicesQuery
  const { items, meta } = await catalogServiceService.listAllServices(query)
  sendSuccess(res, items, 200, meta)
})

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogServiceService.getServiceById(req.params.id as string)
  sendSuccess(res, service)
})

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogServiceService.createService(req.body as CreateServiceInput)
  sendSuccess(res, service, 201)
})

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogServiceService.updateService(req.params.id as string, req.body as UpdateServiceInput)
  sendSuccess(res, service)
})

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await catalogServiceService.deleteService(req.params.id as string)
  sendSuccess(res, { message: 'Service deleted' })
})
