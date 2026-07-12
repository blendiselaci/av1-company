import type { Request, Response } from 'express'
import * as settingsService from '../services/settings.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type { UpdateSettingsInput } from '../validators/settings.validator'

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings()
  sendSuccess(res, settings)
})

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateSettings(req.body as UpdateSettingsInput)
  sendSuccess(res, settings)
})
