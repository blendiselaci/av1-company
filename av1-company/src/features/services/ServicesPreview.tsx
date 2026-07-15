import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { ServiceCard } from '@/features/services/ServiceCard'
import { useServiceItems } from '@/features/services/useServiceItems'
import { ROUTES } from '@/lib/routes'

// The homepage teases a fixed set of 6 services — the full list renders on /sherbimet.
const HOME_PREVIEW_COUNT = 6

export function ServicesPreview() {
  const { t } = useTranslation('home')
  const { items: allItems, isLoading, isError, retry } = useServiceItems()
  const items = useMemo(() => allItems.slice(0, HOME_PREVIEW_COUNT), [allItems])

  return (
    <section className="bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <div className="mt-16">
            <EmptyState
              title={t('services.error.title')}
              message={t('services.error.message')}
              retryLabel={t('services.error.retry')}
              onRetry={retry}
            />
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service, index) => (
              <ServiceCard key={service.id} service={service} ctaLabel={t('services.cta')} index={index} />
            ))}
          </div>
        )}

        <div className="mt-14 flex justify-center">
          <LinkButton to={ROUTES.services} variant="primary" size="lg">
            {t('services.viewAll')}
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}
