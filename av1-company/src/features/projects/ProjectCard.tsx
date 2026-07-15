import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { LazyImage } from '@/components/ui/LazyImage'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { CATEGORY_FALLBACK_ICON } from '@/lib/categoryIcons'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  categoryLabel: string
  viewLabel: string
  className?: string
}

export function ProjectCard({ project, categoryLabel, viewLabel, className }: ProjectCardProps) {
  const [errored, setErrored] = useState(false)
  const Icon = CATEGORY_FALLBACK_ICON

  return (
    <Link
      to={ROUTES.projects}
      className={cn(
        'group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]',
        className,
      )}
    >
      <div className="absolute inset-0">
        {!errored ? (
          <LazyImage src={project.image} alt="" onError={() => setErrored(true)} imgClassName="group-hover:scale-110" />
        ) : (
          <Icon
            className="absolute inset-0 m-auto h-20 w-20 text-white/15 transition-transform duration-700 ease-out group-hover:scale-110"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-colors duration-500 group-hover:from-black/90" />

      <div className="relative z-10 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-av1-green-light">
          {categoryLabel ? `${categoryLabel} · ` : ''}{project.location}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{project.title}</h3>

        <span className="mt-4 inline-flex translate-y-2 items-center gap-1 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {viewLabel}
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  )
}
