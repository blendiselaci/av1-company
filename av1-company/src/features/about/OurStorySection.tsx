import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function OurStorySection() {
  const { t } = useTranslation('about')
  const shouldReduceMotion = useReducedMotion()
  const paragraphs = t('story.paragraphs', { returnObjects: true }) as string[]

  return (
    <section className="border-t border-foreground/5 bg-background py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t('story.eyebrow')} title={t('story.title')} />

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-5"
        >
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-foreground/70">
              {paragraph}
            </p>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
