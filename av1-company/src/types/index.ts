export interface NavItem {
  labelKey: string
  path: string
}

export interface StatItem {
  value: number
  suffix?: string
  decimals?: number
  label: string
}

export interface ServiceItem {
  id: string
  slug: string
  icon: string
  title: string
  description: string
  image?: string | null
  benefits: string[]
  galleryImages: string[]
}

export interface Project {
  id: string
  title: string
  categoryId: string | null
  location: string
  description: string
  image: string
}

export interface ProjectFilter {
  key: string
  label: string
}

export interface Transformation {
  id: string
  title: string
  location: string
  categoryId: string | null
  beforeImage: string
  afterImage: string
  description: string
  workCompleted: string
  completionTime: string
  year: number
}

export interface GalleryItem {
  id: string
  title: string
  categoryId: string | null
  image: string
  description: string
}

export interface VideoItem {
  id: string
  title: string
  categoryId: string | null
  duration: string
  thumbnail: string
  videoUrl: string
  description: string
  project: string
}

export interface Testimonial {
  id: string
  clientName: string
  location: string
  projectType: string
  text: string
  rating: number
  image: string | null
  date: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
