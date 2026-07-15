import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { VideoGrid } from '@/features/video/VideoGrid'
import { VideoModal } from '@/features/video/VideoModal'
import { useVideoItems } from '@/features/video/useVideoItems'
import { useCategories } from '@/hooks/useCategories'
import { useMediaOverlay } from '@/hooks/useMediaOverlay'
import { ROUTES } from '@/lib/routes'

export function VideoSection() {
  const { t } = useTranslation('videos')

  const { items, isLoading, isError, retry } = useVideoItems()
  const { getLabel } = useCategories()

  const { activeIndex, open: handlePlay, close: handleClose } = useMediaOverlay(items.length)

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-16">
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

        <div className="mt-14 flex justify-center">
          <LinkButton to={ROUTES.video} variant="primary" size="lg">
            {t('viewAll')}
          </LinkButton>
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
