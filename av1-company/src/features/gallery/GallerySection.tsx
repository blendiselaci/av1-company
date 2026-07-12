import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { GalleryFilterTabs } from '@/features/gallery/GalleryFilterTabs'
import { MasonryGallery } from '@/features/gallery/MasonryGallery'
import { GalleryLightbox } from '@/features/gallery/GalleryLightbox'
import { useGalleryItems } from '@/features/gallery/useGalleryItems'
import { useMediaOverlay } from '@/hooks/useMediaOverlay'
import { ROUTES } from '@/lib/routes'
import type { ProjectCategory, ProjectFilter } from '@/types'

type FilterKey = 'all' | ProjectCategory

// The homepage only teases the gallery — the full set renders on the dedicated
// /galeria page (GalleryPage), which reuses this same item list unsliced.
const HOME_PREVIEW_COUNT = 8

export function GallerySection() {
  const { t } = useTranslation('gallery')
  const [active, setActive] = useState<FilterKey>('all')

  const { items: allItems, isLoading, isError, retry } = useGalleryItems()
  const items = useMemo(() => allItems.slice(0, HOME_PREVIEW_COUNT), [allItems])
  const filterLabels = t('filters', { returnObjects: true }) as Record<FilterKey, string>

  const filters: ProjectFilter[] = useMemo(
    () => (Object.keys(filterLabels) as FilterKey[]).map((key) => ({ key, label: filterLabels[key] })),
    [filterLabels],
  )

  const filteredItems = useMemo(
    () => (active === 'all' ? items : items.filter((item) => item.category === active)),
    [items, active],
  )

  const { activeIndex, open: handleSelect, close: handleClose, reset: resetLightbox, navigate: handleNavigate } =
    useMediaOverlay(filteredItems.length)

  function handleFilterChange(key: string) {
    setActive(key as FilterKey)
    resetLightbox()
  }

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-10 flex justify-center">
          <GalleryFilterTabs filters={filters} active={active} onChange={handleFilterChange} />
        </div>

        <div className="mt-12">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : filteredItems.length > 0 ? (
            <MasonryGallery items={filteredItems} categoryLabels={filterLabels} onSelect={handleSelect} />
          ) : (
            <EmptyState
              title={t('empty.title')}
              message={t('empty.message')}
              retryLabel={t('empty.retry')}
              onRetry={() => setActive('all')}
            />
          )}
        </div>

        <div className="mt-14 flex justify-center">
          <LinkButton to={ROUTES.gallery} variant="secondary" size="lg">
            {t('viewAll')}
          </LinkButton>
        </div>
      </Container>

      <GalleryLightbox
        items={filteredItems}
        categoryLabels={filterLabels}
        activeIndex={activeIndex}
        onClose={handleClose}
        onNavigate={handleNavigate}
        closeLabel={t('lightbox.close')}
        nextLabel={t('lightbox.next')}
        previousLabel={t('lightbox.previous')}
        ofLabel={t('lightbox.of')}
      />
    </section>
  )
}
