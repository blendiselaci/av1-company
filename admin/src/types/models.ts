export type Role = 'ADMIN' | 'EDITOR'

export type ContactStatus = 'NEW' | 'READ' | 'REPLIED'

export const CONTACT_STATUSES: ContactStatus[] = ['NEW', 'READ', 'REPLIED']

export type MediaCategory =
  | 'PROJECT_COVER'
  | 'GALLERY'
  | 'BEFORE_AFTER'
  | 'SERVICE'
  | 'TESTIMONIAL_AVATAR'
  | 'VIDEO'
  | 'VIDEO_THUMBNAIL'

export type MediaResourceType = 'IMAGE' | 'VIDEO'

interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export interface AdminUser extends Timestamps {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
}

export interface Media extends Timestamps {
  id: string
  url: string
  publicId: string
  resourceType: MediaResourceType
  category: MediaCategory
  mimeType: string
  sizeBytes: number
  uploadedById: string | null
  variants: { thumbnail: string; medium: string; original: string }
}

export interface Project extends Timestamps {
  id: string
  slug: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  categoryId: string | null
  location: string
  year: number
  image: string
  imagePublicId: string | null
  gallery: string[]
  services: string[]
  isPublished: boolean
  order: number
}

export interface GalleryImage extends Timestamps {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  categoryId: string | null
  image: string
  imagePublicId: string | null
  projectId: string | null
  isPublished: boolean
  order: number
}

export interface BeforeAfterProject extends Timestamps {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  workCompletedEn: string
  workCompletedDe: string
  workCompletedSq: string
  completionTimeEn: string
  completionTimeDe: string
  completionTimeSq: string
  location: string
  categoryId: string | null
  beforeImage: string
  beforeImagePublicId: string | null
  afterImage: string
  afterImagePublicId: string | null
  year: number
  isPublished: boolean
  order: number
}

export interface Video extends Timestamps {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  categoryId: string | null
  duration: string
  thumbnail: string
  thumbnailPublicId: string | null
  videoUrl: string
  videoPublicId: string | null
  projectId: string | null
  isPublished: boolean
  order: number
}

export interface Service extends Timestamps {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  slug: string
  icon: string
  image: string | null
  imagePublicId: string | null
  benefitsEn: string[]
  benefitsDe: string[]
  benefitsSq: string[]
  galleryImages: string[]
  isPublished: boolean
  order: number
}

export interface Testimonial extends Timestamps {
  id: string
  clientName: string
  location: string
  projectType: string
  textEn: string
  textDe: string
  textSq: string
  rating: number
  image: string | null
  imagePublicId: string | null
  date: string
  isPublished: boolean
  order: number
}

export interface Category extends Timestamps {
  id: string
  nameSq: string
  nameEn: string
  nameDe: string
  slug: string
  order: number
  isActive: boolean
}

export interface Faq extends Timestamps {
  id: string
  questionEn: string
  questionDe: string
  questionSq: string
  answerEn: string
  answerDe: string
  answerSq: string
  isPublished: boolean
  order: number
}

export interface ContactMessage extends Timestamps {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  service: string | null
  message: string
  status: ContactStatus
}

export interface Settings {
  id: number
  companyName: string
  phone: string
  email: string
  address: string
  workingHours: string
  facebookUrl: string | null
  instagramUrl: string | null
  mapsUrl: string | null
  createdAt: string
  updatedAt: string
}
