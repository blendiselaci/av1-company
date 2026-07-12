import { Router } from 'express'
import { Role } from '@prisma/client'
import * as projectController from '../controllers/project.controller'
import { authenticate, authorize } from '../middleware/auth'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators/common.validator'
import {
  adminListProjectsQuerySchema,
  createProjectSchema,
  publicListProjectsQuerySchema,
  updateProjectSchema,
} from '../validators/project.validator'

const router = Router()

// ── Public (published content only) — consumed by the marketing site ─
router.get('/', validate({ query: publicListProjectsQuerySchema }), projectController.listPublicProjects)

// ── Admin (full CRUD, requires ADMIN or EDITOR) ─────────────────────
// Mounted before the public `/:id` route below — otherwise Express would match
// `/admin` itself against `:id` (as the literal id "admin") and 404 before the
// admin sub-router ever got a chance to handle it.
const admin = Router()
admin.use(authenticate, authorize(Role.ADMIN, Role.EDITOR))

admin.get('/', validate({ query: adminListProjectsQuerySchema }), projectController.listProjects)
admin.get('/:id', validate({ params: idParamSchema }), projectController.getProject)
admin.post('/', sanitizeBody, validate({ body: createProjectSchema }), projectController.createProject)
admin.patch('/:id', sanitizeBody, validate({ params: idParamSchema, body: updateProjectSchema }), projectController.updateProject)
admin.delete('/:id', validate({ params: idParamSchema }), projectController.deleteProject)

router.use('/admin', admin)

router.get('/:id', validate({ params: idParamSchema }), projectController.getPublicProject)

export default router
