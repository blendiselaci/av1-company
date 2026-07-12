import { Router } from 'express'
import { Role } from '@prisma/client'
import * as userController from '../controllers/user.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from '../validators/user.validator'

const router = Router()

// User management is ADMIN-only, in full — including read access.
router.use(authenticate, authorize(Role.ADMIN))

router.get('/', validate({ query: listUsersQuerySchema }), userController.listUsers)
router.get('/:id', validate({ params: idParamSchema }), userController.getUser)
router.post('/', sanitizeBody, validate({ body: createUserSchema }), userController.createUser)
router.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateUserSchema }), userController.updateUser)
router.delete('/:id', validate({ params: idParamSchema }), userController.deleteUser)

export default router
