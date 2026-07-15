import { Router } from 'express'
import authRoutes from './auth.routes'
import mediaRoutes from './media.routes'
import userRoutes from './user.routes'
import categoryRoutes from './category.routes'
import projectRoutes from './project.routes'
import galleryRoutes from './gallery.routes'
import beforeAfterRoutes from './beforeAfter.routes'
import videoRoutes from './video.routes'
import testimonialRoutes from './testimonial.routes'
import faqRoutes from './faq.routes'
import serviceRoutes from './service.routes'
import contactRoutes from './contact.routes'
import settingsRoutes from './settings.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/media', mediaRoutes)
router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)
router.use('/projects', projectRoutes)
router.use('/gallery', galleryRoutes)
router.use('/before-after', beforeAfterRoutes)
router.use('/videos', videoRoutes)
router.use('/testimonials', testimonialRoutes)
router.use('/faqs', faqRoutes)
router.use('/services', serviceRoutes)
router.use('/contact-messages', contactRoutes)
router.use('/settings', settingsRoutes)

export default router
