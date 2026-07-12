import { Router } from 'express'
import { Role } from '@prisma/client'
import * as serviceController from '../controllers/service.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListServicesQuerySchema,
  createServiceSchema,
  publicListServicesQuerySchema,
  updateServiceSchema,
} from '../validators/service.validator'

const router = Router()

router.get('/', validate({ query: publicListServicesQuerySchema }), serviceController.listPublicServices)

const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListServicesQuerySchema }), serviceController.listServices)
admin.get('/:id', validate({ params: idParamSchema }), serviceController.getService)
admin.post('/', sanitizeBody, validate({ body: createServiceSchema }), serviceController.createService)
admin.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateServiceSchema }), serviceController.updateService)
admin.delete('/:id', validate({ params: idParamSchema }), serviceController.deleteService)

router.use('/admin', admin)

export default router
