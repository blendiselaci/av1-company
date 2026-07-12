import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { StatItem } from '@/types'

interface ReviewSummaryProps {
  rating: string
  outOf: number
  basedOnLabel: string
  stats: StatItem[]
}

export function ReviewSummary({ rating, outOf, basedOnLabel, stats }: ReviewSummaryProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.aside
      aria-labelledby="review-summary-rating"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: shouldReduceMotion ? 1 : 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md sm:p-10"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: outOf }, (_, index) => (
            <Star key={index} size={22} className="fill-av1-green text-av1-green" />
          ))}
        </div>
        <p id="review-summary-rating" className="text-3xl font-bold tracking-tight text-foreground">
          {rating}
          <span className="text-foreground/70">/{outOf}</span>
        </p>
        <p className="text-sm font-medium text-foreground/70">{basedOnLabel}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 border-t border-foreground/10 pt-8 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{
              duration: shouldReduceMotion ? 0.01 : 0.5,
              delay: shouldReduceMotion ? 0 : index * 0.1,
            }}
            className="text-center"
          >
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              className="block text-2xl font-bold tracking-tight text-av1-green sm:text-3xl"
            />
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-foreground/70">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  )
}
