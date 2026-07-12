import { Gem, Handshake, Leaf, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TrustItem } from '@/features/trust/TrustItem'

const VALUE_ICONS: Record<string, LucideIcon> = {
  quality: Gem,
  integrity: Handshake,
  innovation: Lightbulb,
  sustainability: Leaf,
}

interface ValueEntry {
  id: string
  title: string
  description: string
}

export function ValuesSection() {
  const { t } = useTranslation('about')
  const shouldReduceMotion = useReducedMotion()
  const items = t('values.items', { returnObjects: true }) as ValueEntry[]

  return (
    <section className="border-t border-foreground/5 bg-background py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t('values.eyebrow')} title={t('values.title')} subtitle={t('values.subtitle')} />

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.6,
                delay: shouldReduceMotion ? 0 : index * 0.1,
              }}
            >
              <TrustItem icon={VALUE_ICONS[item.id] ?? Gem} title={item.title} description={item.description} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
