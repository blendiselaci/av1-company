import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { ServiceCard } from '@/features/services/ServiceCard'
import { useServiceItems } from '@/features/services/useServiceItems'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function ServicesPage() {
  const { t } = useTranslation('home')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()
  const { items, isLoading, isError, retry } = useServiceItems()

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <PageMeta
          title={tSeo('services.title')}
          description={tSeo('services.description')}
          keywords={tSeo('services.keywords')}
        />
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav('nav.home'), path: ROUTES.home },
            { name: tNav('nav.services'), path: ROUTES.services },
          ])}
        />
        <SectionHeading
          as="h1"
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />

        <div className="mt-12">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState
              title={t('services.error.title')}
              message={t('services.error.message')}
              retryLabel={t('services.error.retry')}
              onRetry={retry}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service, index) => (
                <ServiceCard key={service.id} service={service} ctaLabel={t('services.cta')} index={index} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
