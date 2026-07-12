import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { authRateLimiter } from '../middleware/rateLimiter'
import { sanitizeBody } from '../middleware/sanitize'
import { validate } from '../middleware/validate'
import { loginSchema } from '../validators/auth.validator'

const router = Router()

router.post('/login', authRateLimiter, sanitizeBody, validate({ body: loginSchema }), authController.login)
router.post('/refresh', authRateLimiter, authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', authenticate, authController.me)

export default router
