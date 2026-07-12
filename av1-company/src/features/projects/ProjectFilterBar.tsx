import { FilterTabs } from '@/components/ui/FilterTabs'
import type { ProjectFilter } from '@/types'

interface ProjectFilterBarProps {
  filters: ProjectFilter[]
  active: string
  onChange: (key: string) => void
}

export function ProjectFilterBar({ filters, active, onChange }: ProjectFilterBarProps) {
  return <FilterTabs filters={filters} active={active} onChange={onChange} layoutId="project-filter-pill" />
}
