import { Router } from 'express'
import { Role } from '@prisma/client'
import * as settingsController from '../controllers/settings.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { updateSettingsSchema } from '../validators/settings.validator'

const router = Router()

router.get('/', settingsController.getSettings)
router.patch(
  '/admin',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR),
  sanitizeBody,
  validate({ body: updateSettingsSchema }),
  settingsController.updateSettings,
)

export default router
