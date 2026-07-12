import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Leaf } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/LinkButton'
import { ROUTES } from '@/lib/routes'

export function AboutSection() {
  const { t } = useTranslation('home')
  const shouldReduceMotion = useReducedMotion()
  const paragraphs = t('about.paragraphs', { returnObjects: true }) as string[]

  return (
    <section className="bg-background py-24 sm:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#1e3f27_0%,#1c1d1f_60%,#0d100d_100%)]"
          >
            {/* Placeholder — swap for real project photography once available */}
            <Leaf className="absolute inset-0 m-auto h-24 w-24 text-white/10" aria-hidden="true" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-av1-green">
              {t('about.eyebrow')}
            </p>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t('about.title')}
            </h2>
            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed text-foreground/70 sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <LinkButton to={ROUTES.about} variant="primary" size="lg" className="mt-8">
              {t('about.cta')}
            </LinkButton>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
