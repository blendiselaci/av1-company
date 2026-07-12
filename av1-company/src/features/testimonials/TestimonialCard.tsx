import { memo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types'

interface TestimonialCardProps {
  testimonial: Testimonial
  ratingLabel: string
  className?: string
}

function TestimonialCardComponent({ testimonial, ratingLabel, className }: TestimonialCardProps) {
  const [errored, setErrored] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const initials = testimonial.clientName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] sm:p-10',
        className,
      )}
    >
      <Quote className="h-8 w-8 text-av1-green/40" aria-hidden="true" />
      <p className="mt-6 flex-1 text-lg leading-relaxed text-foreground sm:text-xl">&ldquo;{testimonial.text}&rdquo;</p>

      <div className="mt-8 flex items-center gap-4">
        {testimonial.image && !errored ? (
          <img
            src={testimonial.image}
            alt={testimonial.clientName}
            loading="lazy"
            onError={() => setErrored(true)}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-av1-green text-sm font-semibold text-white">
            {initials}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{testimonial.clientName}</p>
          <p className="text-sm text-foreground/70">
            {testimonial.location} · {testimonial.projectType}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-1" role="img" aria-label={ratingLabel}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={16}
              aria-hidden="true"
              className={index < testimonial.rating ? 'fill-av1-green text-av1-green' : 'text-foreground/20'}
            />
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/70">{testimonial.date}</p>
      </div>
    </motion.article>
  )
}

export const TestimonialCard = memo(TestimonialCardComponent)
