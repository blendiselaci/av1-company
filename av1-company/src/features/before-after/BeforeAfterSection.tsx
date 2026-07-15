import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { BeforeAfterSlider } from '@/features/before-after/BeforeAfterSlider'
import { ProjectDetails, type DetailLabels } from '@/features/before-after/ProjectDetails'
import { useBeforeAfterItems } from '@/features/before-after/useBeforeAfterItems'
import { ROUTES } from '@/lib/routes'

export function BeforeAfterSection() {
  const { t } = useTranslation('transformations')
  const shouldReduceMotion = useReducedMotion()

  const { items, isLoading, isError, retry } = useBeforeAfterItems()
  const detailLabels = t('detailLabels', { returnObjects: true }) as DetailLabels
  const featured = items[0]

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-16">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : featured ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <BeforeAfterSlider
                  beforeImage={featured.beforeImage}
                  afterImage={featured.afterImage}
                  beforeLabel={t('beforeLabel')}
                  afterLabel={t('afterLabel')}
                  title={featured.title}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-center"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-av1-green">
                  {featured.location} · {featured.year}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{featured.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/70">{featured.description}</p>

                <ProjectDetails transformation={featured} labels={detailLabels} className="mt-6" />

                <LinkButton to={ROUTES.transformations} variant="primary" size="lg" className="mt-8 self-start">
                  {t('viewAll')}
                </LinkButton>
              </motion.div>
            </div>
          ) : (
            <EmptyState title={t('empty.title')} message={t('empty.message')} retryLabel={t('empty.retry')} onRetry={retry} />
          )}
        </div>
      </Container>
    </section>
  )
}
