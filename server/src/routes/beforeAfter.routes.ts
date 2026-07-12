import { Router } from 'express'
import { Role } from '@prisma/client'
import * as beforeAfterController from '../controllers/beforeAfter.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListBeforeAfterQuerySchema,
  createBeforeAfterSchema,
  publicListBeforeAfterQuerySchema,
  updateBeforeAfterSchema,
} from '../validators/beforeAfter.validator'

const router = Router()

router.get('/', validate({ query: publicListBeforeAfterQuerySchema }), beforeAfterController.listPublicBeforeAfterProjects)

// Mounted before the public `/:id` route below — otherwise Express would match
// `/admin` itself against `:id` (as the literal id "admin") and 404 before the
// admin sub-router ever got a chance to handle it.
const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListBeforeAfterQuerySchema }), beforeAfterController.listBeforeAfterProjects)
admin.get('/:id', validate({ params: idParamSchema }), beforeAfterController.getBeforeAfterProject)
admin.post('/', sanitizeBody, validate({ body: createBeforeAfterSchema }), beforeAfterController.createBeforeAfterProject)
admin.patch(
  '/:id',
  sanitizeBody,
  validate({ params: idParamSchema, body: updateBeforeAfterSchema }),
  beforeAfterController.updateBeforeAfterProject,
)
admin.delete('/:id', validate({ params: idParamSchema }), beforeAfterController.deleteBeforeAfterProject)

router.use('/admin', admin)

router.get('/:id', validate({ params: idParamSchema }), beforeAfterController.getPublicBeforeAfterProject)

export default router
