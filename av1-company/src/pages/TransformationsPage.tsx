import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { BeforeAfterCard } from '@/features/before-after/BeforeAfterCard'
import { useBeforeAfterItems } from '@/features/before-after/useBeforeAfterItems'
import type { DetailLabels } from '@/features/before-after/ProjectDetails'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function TransformationsPage() {
  const { t } = useTranslation('transformations')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  const { items, isLoading, isError, retry } = useBeforeAfterItems()
  const detailLabels = t('detailLabels', { returnObjects: true }) as DetailLabels

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <PageMeta
          title={tSeo('transformations.title')}
          description={tSeo('transformations.description')}
          keywords={tSeo('transformations.keywords')}
        />
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav('nav.home'), path: ROUTES.home },
            { name: tNav('nav.transformations'), path: ROUTES.transformations },
          ])}
        />
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-14">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20">
              {items.map((transformation, index) => (
                <motion.div
                  key={transformation.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.7,
                    delay: shouldReduceMotion ? 0 : (index % 2) * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <BeforeAfterCard
                    transformation={transformation}
                    beforeLabel={t('beforeLabel')}
                    afterLabel={t('afterLabel')}
                    detailLabels={detailLabels}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('empty.title')} message={t('empty.message')} retryLabel={t('empty.retry')} onRetry={retry} />
          )}
        </div>
      </Container>
    </section>
  )
}
