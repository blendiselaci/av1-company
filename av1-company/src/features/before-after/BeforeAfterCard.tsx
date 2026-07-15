import { BeforeAfterSlider } from '@/features/before-after/BeforeAfterSlider'
import { ProjectDetails, type DetailLabels } from '@/features/before-after/ProjectDetails'
import { cn } from '@/lib/utils'
import type { Transformation } from '@/types'

interface BeforeAfterCardProps {
  transformation: Transformation
  beforeLabel: string
  afterLabel: string
  detailLabels: DetailLabels
  className?: string
}

export function BeforeAfterCard({ transformation, beforeLabel, afterLabel, detailLabels, className }: BeforeAfterCardProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <BeforeAfterSlider
        beforeImage={transformation.beforeImage}
        afterImage={transformation.afterImage}
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
        title={transformation.title}
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-av1-green">
          {transformation.location} · {transformation.year}
        </p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{transformation.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">{transformation.description}</p>
      </div>

      <ProjectDetails transformation={transformation} labels={detailLabels} />
    </div>
  )
}
