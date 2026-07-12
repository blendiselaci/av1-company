import { Router } from 'express'
import { Role } from '@prisma/client'
import * as contactController from '../controllers/contact.controller'
import { authenticate, authorize } from '../middleware/auth'
import { contactFormRateLimiter } from '../middleware/rateLimiter'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  createContactMessageSchema,
  listContactMessagesQuerySchema,
  updateContactMessageStatusSchema,
} from '../validators/contact.validator'

const router = Router()

// ── Public — the site's contact form posts here ─────────────────────
router.post(
  '/',
  contactFormRateLimiter,
  sanitizeBody,
  validate({ body: createContactMessageSchema }),
  contactController.submitContactMessage,
)

// ── Admin — inbox management, requires ADMIN or EDITOR ──────────────
const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: listContactMessagesQuerySchema }), contactController.listContactMessages)
admin.get('/:id', validate({ params: idParamSchema }), contactController.getContactMessage)
admin.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateContactMessageStatusSchema }),
  contactController.updateContactMessageStatus,
)
admin.delete('/:id', validate({ params: idParamSchema }), contactController.deleteContactMessage)

router.use('/admin', admin)

export default router
