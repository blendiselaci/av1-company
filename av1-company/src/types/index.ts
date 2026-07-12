export interface NavItem {
  labelKey: string
  path: string
}

export interface StatItem {
  value: number
  suffix?: string
  label: string
}

export interface ServiceItem {
  id: string
  icon: string
  title: string
  description: string
  image?: string | null
}

export type ProjectCategory = 'gardens' | 'yards' | 'pools' | 'terraces' | 'paving'

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  location: string
  description: string
  image: string
}

export interface ProjectFilter {
  key: 'all' | ProjectCategory
  label: string
}

export interface Transformation {
  id: string
  title: string
  location: string
  category: ProjectCategory
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
  category: ProjectCategory
  image: string
  description: string
}

export interface VideoItem {
  id: string
  title: string
  category: ProjectCategory
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
