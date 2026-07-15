import { Droplet, Droplets, Fence, Grid3x3, Layers, Sprout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TrustItem } from '@/features/trust/TrustItem'

const OFFERED_SERVICE_ICONS: Record<string, LucideIcon> = {
  pavers: Grid3x3,
  walls: Layers,
  fountains: Droplets,
  grass: Sprout,
  fences: Fence,
  drainage: Droplet,
}

interface OfferedServiceEntry {
  icon: string
  title: string
  description: string
}

export function ServicesOfferedSection() {
  const { t } = useTranslation('home')
  const shouldReduceMotion = useReducedMotion()
  const items = t('servicesOffered.items', { returnObjects: true }) as OfferedServiceEntry[]

  return (
    <section className="border-t border-foreground/5 bg-background py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('servicesOffered.eyebrow')}
          title={t('servicesOffered.title')}
          subtitle={t('servicesOffered.subtitle')}
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : index * 0.08 }}
              className="h-full"
            >
              <TrustItem
                icon={OFFERED_SERVICE_ICONS[item.icon] ?? Grid3x3}
                title={item.title}
                description={item.description}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
