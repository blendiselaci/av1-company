import { createResourceApi } from './resource'
import type {
  AdminUser,
  BeforeAfterProject,
  Faq,
  GalleryImage,
  Project,
  Service,
  Testimonial,
  Video,
} from '../types/models'

// Each resource's Create/Update payload shape mirrors its backend Zod schema
// (create*Schema / update*Schema) field-for-field.

export const projectsApi = createResourceApi<Project, Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>('/projects')
export const galleryApi = createResourceApi<GalleryImage, Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>>('/gallery')
export const beforeAfterApi = createResourceApi<
  BeforeAfterProject,
  Omit<BeforeAfterProject, 'id' | 'createdAt' | 'updatedAt'>
>('/before-after')
export const videosApi = createResourceApi<Video, Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>('/videos')
export const servicesApi = createResourceApi<Service, Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>('/services')
export const testimonialsApi = createResourceApi<Testimonial, Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>>(
  '/testimonials',
)
export const faqsApi = createResourceApi<Faq, Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>>('/faqs')

export interface CreateUserPayload {
  email: string
  name: string
  password: string
  role: 'ADMIN' | 'EDITOR'
  isActive: boolean
}

export interface UpdateUserPayload {
  name?: string
  password?: string
  role?: 'ADMIN' | 'EDITOR'
  isActive?: boolean
}

export const usersApi = createResourceApi<AdminUser, CreateUserPayload, UpdateUserPayload>('/users', false)
