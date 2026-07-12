import { Router } from 'express'
import { Role } from '@prisma/client'
import * as faqController from '../controllers/faq.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import { adminListFaqsQuerySchema, createFaqSchema, publicListFaqsQuerySchema, updateFaqSchema } from '../validators/faq.validator'

const router = Router()

router.get('/', validate({ query: publicListFaqsQuerySchema }), faqController.listPublicFaqs)

const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListFaqsQuerySchema }), faqController.listFaqs)
admin.get('/:id', validate({ params: idParamSchema }), faqController.getFaq)
admin.post('/', sanitizeBody, validate({ body: createFaqSchema }), faqController.createFaq)
admin.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateFaqSchema }), faqController.updateFaq)
admin.delete('/:id', validate({ params: idParamSchema }), faqController.deleteFaq)

router.use('/admin', admin)

export default router
