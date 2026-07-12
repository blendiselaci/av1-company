import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ContactInfo } from '@/features/contact/ContactInfo'
import { ContactForm } from '@/features/contact/ContactForm'
import type { ContactFormLabels } from '@/features/contact/ContactForm'
import { MapPlaceholder } from '@/features/contact/MapPlaceholder'

interface ContactCard {
  id: string
  label: string
  value: string
  href?: string
}

export function ContactSection() {
  const { t } = useTranslation('contact')
  const shouldReduceMotion = useReducedMotion()

  const cards = t('info.cards', { returnObjects: true }) as ContactCard[]
  const formLabels = t('form', { returnObjects: true }) as ContactFormLabels

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactInfo title={t('info.title')} description={t('info.description')} cards={cards} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactForm labels={formLabels} />
          </motion.div>
        </div>

        <div className="mt-16">
          <MapPlaceholder addressLabel={t('map.addressLabel')} address={t('map.address')} buttonLabel={t('map.button')} />
        </div>
      </Container>
    </section>
  )
}
