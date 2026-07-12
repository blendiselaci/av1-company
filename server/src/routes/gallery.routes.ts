import { Router } from 'express'
import { Role } from '@prisma/client'
import * as galleryController from '../controllers/gallery.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListGalleryQuerySchema,
  createGalleryImageSchema,
  publicListGalleryQuerySchema,
  updateGalleryImageSchema,
} from '../validators/gallery.validator'

const router = Router()

router.get('/', validate({ query: publicListGalleryQuerySchema }), galleryController.listPublicGalleryImages)

// Mounted before the public `/:id` route below — otherwise Express would match
// `/admin` itself against `:id` (as the literal id "admin") and 404 before the
// admin sub-router ever got a chance to handle it.
const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListGalleryQuerySchema }), galleryController.listGalleryImages)
admin.get('/:id', validate({ params: idParamSchema }), galleryController.getGalleryImage)
admin.post('/', sanitizeBody, validate({ body: createGalleryImageSchema }), galleryController.createGalleryImage)
admin.patch(
  '/:id',
  sanitizeBody,
  validate({ params: idParamSchema, body: updateGalleryImageSchema }),
  galleryController.updateGalleryImage,
)
admin.delete('/:id', validate({ params: idParamSchema }), galleryController.deleteGalleryImage)

router.use('/admin', admin)

router.get('/:id', validate({ params: idParamSchema }), galleryController.getPublicGalleryImage)

export default router
