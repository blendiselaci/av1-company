import { Router } from 'express'
import { Role } from '@prisma/client'
import * as testimonialController from '../controllers/testimonial.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListTestimonialsQuerySchema,
  createTestimonialSchema,
  publicListTestimonialsQuerySchema,
  updateTestimonialSchema,
} from '../validators/testimonial.validator'

const router = Router()

router.get('/', validate({ query: publicListTestimonialsQuerySchema }), testimonialController.listPublicTestimonials)

const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListTestimonialsQuerySchema }), testimonialController.listTestimonials)
admin.get('/:id', validate({ params: idParamSchema }), testimonialController.getTestimonial)
admin.post('/', sanitizeBody, validate({ body: createTestimonialSchema }), testimonialController.createTestimonial)
admin.patch(
  '/:id',
  sanitizeBody,
  validate({ params: idParamSchema, body: updateTestimonialSchema }),
  testimonialController.updateTestimonial,
)
admin.delete('/:id', validate({ params: idParamSchema }), testimonialController.deleteTestimonial)

router.use('/admin', admin)

export default router
