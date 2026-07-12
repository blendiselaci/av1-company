import { Router } from 'express'
import { Role } from '@prisma/client'
import * as videoController from '../controllers/video.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListVideosQuerySchema,
  createVideoSchema,
  publicListVideosQuerySchema,
  updateVideoSchema,
} from '../validators/video.validator'

const router = Router()

router.get('/', validate({ query: publicListVideosQuerySchema }), videoController.listPublicVideos)

// Mounted before the public `/:id` route below — otherwise Express would match
// `/admin` itself against `:id` (as the literal id "admin") and 404 before the
// admin sub-router ever got a chance to handle it.
const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListVideosQuerySchema }), videoController.listVideos)
admin.get('/:id', validate({ params: idParamSchema }), videoController.getVideo)
admin.post('/', sanitizeBody, validate({ body: createVideoSchema }), videoController.createVideo)
admin.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateVideoSchema }), videoController.updateVideo)
admin.delete('/:id', validate({ params: idParamSchema }), videoController.deleteVideo)

router.use('/admin', admin)

router.get('/:id', validate({ params: idParamSchema }), videoController.getPublicVideo)

export default router
