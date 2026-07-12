import { Clock, Hammer, MapPin, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transformation } from '@/types'

export interface DetailLabels {
  projectName: string
  location: string
  workCompleted: string
  completionTime: string
}

interface ProjectDetailsProps {
  transformation: Transformation
  labels: DetailLabels
  className?: string
}

export function ProjectDetails({ transformation, labels, className }: ProjectDetailsProps) {
  const details = [
    { icon: Tag, label: labels.projectName, value: transformation.title },
    { icon: MapPin, label: labels.location, value: transformation.location },
    { icon: Hammer, label: labels.workCompleted, value: transformation.workCompleted },
    { icon: Clock, label: labels.completionTime, value: transformation.completionTime },
  ]

  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 backdrop-blur-sm sm:grid-cols-4',
        className,
      )}
    >
      {details.map(({ icon: Icon, label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
            <Icon size={12} className="text-av1-green" aria-hidden="true" />
            {label}
          </dt>
          <dd className="mt-1 truncate text-sm font-medium text-foreground" title={value}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
