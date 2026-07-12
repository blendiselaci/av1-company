import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ProjectCard } from '@/features/projects/ProjectCard'
import type { Project, ProjectCategory } from '@/types'

// Repeating span pattern for an asymmetric, editorial portfolio grid on large screens.
const SPAN_PATTERN = [
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-2 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
]

interface ProjectsGridProps {
  projects: Project[]
  categoryLabels: Record<'all' | ProjectCategory, string>
  viewLabel: string
}

export function ProjectsGrid({ projects, categoryLabels, viewLabel }: ProjectsGridProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:auto-rows-[16rem] lg:grid-cols-3 lg:gap-8">
      {projects.map((project, index) => (
        <motion.article
          key={project.id}
          layout
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(SPAN_PATTERN[index % SPAN_PATTERN.length])}
        >
          <ProjectCard
            project={project}
            categoryLabel={categoryLabels[project.category]}
            viewLabel={viewLabel}
            className="h-full"
          />
        </motion.article>
      ))}
    </div>
  )
}
