import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { StatItem } from '@/types'

export function CompanyStats() {
  const { t } = useTranslation('home')
  const shouldReduceMotion = useReducedMotion()
  const items = t('stats.items', { returnObjects: true }) as StatItem[]

  return (
    <section className="bg-av1-dark py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-2 gap-10 sm:gap-8 lg:grid-cols-4">
          {items.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : index * 0.1 }}
              className="text-center"
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
                className="block text-4xl font-bold tracking-tight text-white sm:text-5xl"
              />
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
