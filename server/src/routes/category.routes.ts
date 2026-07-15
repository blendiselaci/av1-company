import { Router } from 'express'
import { Role } from '@prisma/client'
import * as categoryController from '../controllers/category.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListCategoriesQuerySchema,
  createCategorySchema,
  publicListCategoriesQuerySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from '../validators/category.validator'

const router = Router()

router.get('/', validate({ query: publicListCategoriesQuerySchema }), categoryController.listPublicCategories)

const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListCategoriesQuerySchema }), categoryController.listCategories)
admin.get('/:id', validate({ params: idParamSchema }), categoryController.getCategory)
admin.post('/', sanitizeBody, validate({ body: createCategorySchema }), categoryController.createCategory)
admin.patch('/reorder', sanitizeBody, validate({ body: reorderCategoriesSchema }), categoryController.reorderCategories)
admin.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateCategorySchema }), categoryController.updateCategory)
admin.delete('/:id', validate({ params: idParamSchema }), categoryController.deleteCategory)

router.use('/admin', admin)

export default router
