import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { VideoGrid } from '@/features/video/VideoGrid'
import { VideoModal } from '@/features/video/VideoModal'
import { useVideoItems } from '@/features/video/useVideoItems'
import { useCategories } from '@/hooks/useCategories'
import { useMediaOverlay } from '@/hooks/useMediaOverlay'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function VideoPage() {
  const { t } = useTranslation('videos')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()

  const { items, isLoading, isError, retry } = useVideoItems()
  const { getLabel } = useCategories()

  const { activeIndex, open: handlePlay, close: handleClose } = useMediaOverlay(items.length)

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <PageMeta title={tSeo('video.title')} description={tSeo('video.description')} keywords={tSeo('video.keywords')} />
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav('nav.home'), path: ROUTES.home },
            { name: tNav('nav.video'), path: ROUTES.video },
          ])}
        />
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-14">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : items.length > 0 ? (
            <VideoGrid videos={items} getLabel={getLabel} onPlay={handlePlay} />
          ) : (
            <EmptyState title={t('empty.title')} message={t('empty.message')} retryLabel={t('empty.retry')} onRetry={retry} />
          )}
        </div>
      </Container>

      <VideoModal
        videos={items}
        activeIndex={activeIndex}
        onClose={handleClose}
        closeLabel={t('close')}
        muteLabel={t('mute')}
        unmuteLabel={t('unmute')}
      />
    </section>
  )
}
