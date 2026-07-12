import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { ReviewSummary } from '@/features/testimonials/ReviewSummary'
import { TestimonialsCarousel } from '@/features/testimonials/TestimonialsCarousel'
import { useTestimonialItems } from '@/features/testimonials/useTestimonialItems'
import type { StatItem } from '@/types'

export function TestimonialsSection() {
  const { t } = useTranslation('testimonials')
  const { items, isLoading, isError, retry } = useTestimonialItems()
  const summaryStats = t('summary.stats', { returnObjects: true }) as StatItem[]

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mx-auto mt-14 max-w-3xl">
          <ReviewSummary
            rating={t('summary.rating')}
            outOf={5}
            basedOnLabel={t('summary.basedOn')}
            stats={summaryStats}
          />
        </div>

        <div className="mt-16">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : items.length > 0 ? (
            <TestimonialsCarousel
              testimonials={items}
              ratingLabelTemplate={t('ratingLabel')}
              prevLabel={t('prev')}
              nextLabel={t('next')}
            />
          ) : (
            <EmptyState title={t('empty.title')} message={t('empty.message')} />
          )}
        </div>
      </Container>
    </section>
  )
}
