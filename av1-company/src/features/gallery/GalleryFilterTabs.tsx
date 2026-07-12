import { FilterTabs } from '@/components/ui/FilterTabs'
import type { ProjectFilter } from '@/types'

interface GalleryFilterTabsProps {
  filters: ProjectFilter[]
  active: string
  onChange: (key: string) => void
}

export function GalleryFilterTabs({ filters, active, onChange }: GalleryFilterTabsProps) {
  return <FilterTabs filters={filters} active={active} onChange={onChange} layoutId="gallery-filter-pill" />
}
