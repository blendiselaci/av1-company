import { motion, useReducedMotion } from 'framer-motion'
import { ProjectCard } from '@/features/projects/ProjectCard'
import type { Project } from '@/types'

interface ProjectsGridProps {
  projects: Project[]
  getLabel: (categoryId: string | null | undefined) => string
  viewLabel: string
}

export function ProjectsGrid({ projects, getLabel, viewLabel }: ProjectsGridProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {projects.map((project) => (
        <motion.article
          key={project.id}
          layout
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProjectCard
            project={project}
            categoryLabel={getLabel(project.categoryId)}
            viewLabel={viewLabel}
            className="h-full"
          />
        </motion.article>
      ))}
    </div>
  )
}
