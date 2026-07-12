import { Flower2, Grid3x3, Home as HomeIcon, TreePine, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProjectCategory } from '@/types'

export const CATEGORY_ICONS: Record<ProjectCategory, LucideIcon> = {
  gardens: Flower2,
  yards: TreePine,
  pools: Waves,
  terraces: HomeIcon,
  paving: Grid3x3,
}
