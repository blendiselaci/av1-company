import { useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { LazyImage } from '@/components/ui/LazyImage'
import { useBeforeAfterDrag } from '@/hooks/useBeforeAfterDrag'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ProjectCategory } from '@/types'

interface SliderImageProps {
  src: string
  alt: string
  fallbackIcon: LucideIcon
}

function SliderImage({ src, alt, fallbackIcon: Icon }: SliderImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
        <Icon className="h-16 w-16 text-white/20" aria-hidden="true" />
      </div>
    )
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setErrored(true)}
      className="absolute inset-0"
      imgClassName="select-none"
    />
  )
}

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel: string
  afterLabel: string
  category: ProjectCategory
  title: string
  className?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  category,
  title,
  className,
}: BeforeAfterSliderProps) {
  const shouldReduceMotion = useReducedMotion()
  const { containerRef, position, ariaValue, handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown } =
    useBeforeAfterDrag({ reduceMotion: Boolean(shouldReduceMotion) })

  const clipPath = useTransform(position, (value) => `inset(0 ${100 - value}% 0 0)`)
  const handleLeft = useTransform(position, (value) => `${value}%`)
  const Icon = CATEGORY_ICONS[category]

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-2xl bg-av1-dark',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* After — base layer, fully visible */}
      <SliderImage src={afterImage} alt={`${title} — ${afterLabel}`} fallbackIcon={Icon} />
      <span className="absolute bottom-4 right-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        {afterLabel}
      </span>

      {/* Before — clipped overlay revealed by dragging */}
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <SliderImage src={beforeImage} alt={`${title} — ${beforeLabel}`} fallbackIcon={Icon} />
        <span className="absolute bottom-4 left-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {beforeLabel}
        </span>
      </motion.div>

      {/* Divider handle */}
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ariaValue)}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className="absolute inset-y-0 z-20 flex w-0 cursor-ew-resize items-center justify-center outline-none"
        style={{ left: handleLeft }}
      >
        <span className="absolute inset-y-0 w-0.5 bg-white/80" aria-hidden="true" />
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-av1-dark shadow-lg ring-2 ring-white/50 focus-visible:ring-av1-green">
          <GripVertical size={18} aria-hidden="true" />
        </span>
      </motion.div>
    </div>
  )
}
