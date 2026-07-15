import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  FolderKanban,
  HelpCircle,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Settings,
  Tags,
  UserCircle,
  Users,
  Video,
  Wrench,
} from 'lucide-react'
import type { Role } from '../types/models'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  allow?: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Categories', path: '/categories', icon: Tags },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Gallery', path: '/gallery', icon: Image },
  { label: 'Before/After', path: '/before-after', icon: ArrowLeftRight },
  { label: 'Videos', path: '/videos', icon: Video },
  { label: 'Services', path: '/services', icon: Wrench },
  { label: 'Testimonials', path: '/testimonials', icon: MessageSquareQuote },
  { label: 'FAQs', path: '/faqs', icon: HelpCircle },
  { label: 'Contact Messages', path: '/contact-messages', icon: Mail },
  { label: 'Website Settings', path: '/settings', icon: Settings },
  { label: 'Users', path: '/users', icon: Users, allow: ['ADMIN'] },
  { label: 'Profile', path: '/profile', icon: UserCircle },
]
