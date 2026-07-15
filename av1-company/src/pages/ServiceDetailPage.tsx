import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { LazyImage } from '@/components/ui/LazyImage'
import { LinkButton } from '@/components/ui/LinkButton'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaSection } from '@/features/cta/CtaSection'
import { useServiceDetail } from '@/features/services/useServiceDetail'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation('home')
  const { t: tNav } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [heroErrored, setHeroErrored] = useState(false)

  const { service, isLoading, isError, notFound, retry } = useServiceDetail(slug)

  if (isLoading) {
    return (
      <div className="py-24">
        <PageLoader />
      </div>
    )
  }

  if (notFound || isError || !service) {
    return (
      <section className="bg-background py-16 sm:py-24">
        <Container>
          <EmptyState
            title={notFound ? t('services.detail.notFoundTitle') : t('services.error.title')}
            message={notFound ? t('services.detail.notFoundMessage') : t('services.error.message')}
            retryLabel={notFound ? undefined : t('services.error.retry')}
            onRetry={notFound ? undefined : retry}
          />
          <div className="mt-8 flex justify-center">
            <LinkButton to={ROUTES.services} variant="outline" size="md">
              {t('services.detail.notFoundBack')}
            </LinkButton>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <>
      <PageMeta
        title={`${service.title} — AV1-Company`}
        description={service.description}
        {...(service.image ? { image: service.image } : {})}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: tNav('nav.home'), path: ROUTES.home },
          { name: tNav('nav.services'), path: ROUTES.services },
          { name: service.title, path: `${ROUTES.services}/${service.slug}` },
        ])}
      />

      <section className="bg-background py-16 sm:py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]"
          >
            {service.image && !heroErrored ? (
              <LazyImage src={service.image} alt={service.title} onError={() => setHeroErrored(true)} />
            ) : null}
          </motion.div>

          <div className="mx-auto mt-10 max-w-3xl">
            <SectionHeading as="h1" eyebrow={t('services.eyebrow')} title={service.title} subtitle={service.description} />
          </div>

          {service.benefits.length > 0 && (
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('services.detail.benefitsTitle')}</h2>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-av1-green" aria-hidden="true" />
                    <span className="text-sm leading-relaxed text-foreground/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.galleryImages.length > 0 && (
            <div className="mx-auto mt-14 max-w-5xl">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('services.detail.galleryTitle')}</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {service.galleryImages.map((image) => (
                  <div key={image} className="aspect-[4/3] overflow-hidden rounded-2xl">
                    <LazyImage src={image} alt={service.title} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 flex justify-center">
            <LinkButton to={ROUTES.services} variant="outline" size="md">
              {t('services.detail.backLabel')}
            </LinkButton>
          </div>
        </Container>
      </section>

      <CtaSection />
    </>
  )
}
