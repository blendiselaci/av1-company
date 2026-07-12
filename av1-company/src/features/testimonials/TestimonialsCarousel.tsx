import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TestimonialCard } from '@/features/testimonials/TestimonialCard'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types'

const AUTOPLAY_INTERVAL = 6000
const SWIPE_THRESHOLD = 60

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  ratingLabelTemplate: string
  prevLabel: string
  nextLabel: string
  className?: string
}

export function TestimonialsCarousel({
  testimonials,
  ratingLabelTemplate,
  prevLabel,
  nextLabel,
  className,
}: TestimonialsCarouselProps) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  function goTo(next: number) {
    setIndex((next + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (isPaused || shouldReduceMotion || testimonials.length <= 1) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length)
    }, AUTOPLAY_INTERVAL)

    return () => window.clearInterval(timer)
  }, [isPaused, shouldReduceMotion, testimonials.length])

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      goTo(index + 1)
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      goTo(index - 1)
    }
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <motion.div
          className="flex touch-pan-y"
          drag={testimonials.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full shrink-0 px-1 sm:px-4">
              <TestimonialCard
                testimonial={testimonial}
                ratingLabel={ratingLabelTemplate.replace('{rating}', String(testimonial.rating))}
                className="mx-auto max-w-2xl"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {testimonials.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={prevLabel}
            className="rounded-full border border-foreground/15 p-2 text-foreground/70 transition-colors hover:border-av1-green hover:text-av1-green"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={testimonial.clientName}
                aria-current={i === index}
                className="flex h-6 w-6 shrink-0 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === index ? 'w-6 bg-av1-green' : 'w-2 bg-foreground/20',
                  )}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={nextLabel}
            className="rounded-full border border-foreground/15 p-2 text-foreground/70 transition-colors hover:border-av1-green hover:text-av1-green"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
