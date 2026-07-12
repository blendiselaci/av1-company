import { Router } from 'express'
import { Role } from '@prisma/client'
import * as mediaController from '../controllers/media.controller'
import { authenticate, authorize } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import { listMediaQuerySchema, uploadMediaBodySchema } from '../validators/media.validator'

const router = Router()

// Every media route requires an authenticated ADMIN or EDITOR...
router.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

router.get('/', validate({ query: listMediaQuerySchema }), mediaController.listMedia)
router.get('/:id', validate({ params: idParamSchema }), mediaController.getMedia)

router.post(
  '/upload',
  upload.single('file'),
  validate({ body: uploadMediaBodySchema }),
  mediaController.uploadSingleMedia,
)
router.post(
  '/upload/multiple',
  upload.array('files', 10),
  validate({ body: uploadMediaBodySchema }),
  mediaController.uploadMultipleMedia,
)

router.put(
  '/:id/replace',
  upload.single('file'),
  validate({ params: idParamSchema }),
  mediaController.replaceMedia,
)

// ...but permanent deletion is further restricted to ADMIN only.
router.delete('/:id', authorize(Role.ADMIN), validate({ params: idParamSchema }), mediaController.deleteMedia)

export default router
