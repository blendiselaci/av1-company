import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LinkButton } from '@/components/ui/LinkButton'
import { ROUTES } from '@/lib/routes'

export function Hero() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12, delayChildren: shouldReduceMotion ? 0 : 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section className="relative flex h-screen min-h-[640px] w-full items-center overflow-hidden bg-av1-dark">
      {/* Placeholder backdrop — swap for real hero photography/video once available */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(61,122,77,0.35),transparent_60%),linear-gradient(160deg,#14251a_0%,#1c1d1f_55%,#0d100d_100%)]"
        initial={{ scale: 1 }}
        animate={{ scale: shouldReduceMotion ? 1 : 1.08 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 24,
          ease: 'linear',
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: 'reverse',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div className="max-w-2xl" variants={containerVariants} initial="hidden" animate="visible">
          <motion.p
            variants={itemVariants}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-av1-green-light sm:text-sm"
          >
            {t('hero.eyebrow')}
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.headline')}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-4">
            <LinkButton to={ROUTES.projects} variant="primary" size="lg">
              {t('hero.primaryCta')}
            </LinkButton>
            <LinkButton to={ROUTES.contact} variant="ghostLight" size="lg">
              {t('hero.secondaryCta')}
            </LinkButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
