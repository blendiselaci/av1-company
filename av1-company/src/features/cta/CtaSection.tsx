import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { RippleLink } from '@/components/ui/RippleLink'
import { ROUTES } from '@/lib/routes'

export function CtaSection() {
  const { t } = useTranslation('home')
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#2a5736_0%,#1c1d1f_100%)] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_50%)]"
      />

      <Container className="relative text-center">
        <motion.h2
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {t('cta.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-xl text-lg text-white/70"
        >
          {t('cta.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <RippleLink
            to={ROUTES.contact}
            variant="primary"
            size="lg"
            className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t('cta.primaryCta')}
          </RippleLink>
          <RippleLink
            to={ROUTES.projects}
            variant="ghostLight"
            size="lg"
            className="transition-transform duration-200 hover:-translate-y-0.5"
          >
            {t('cta.secondaryCta')}
          </RippleLink>
        </motion.div>
      </Container>
    </section>
  )
}
