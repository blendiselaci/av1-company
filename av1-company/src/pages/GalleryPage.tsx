import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { GalleryFilterTabs } from '@/features/gallery/GalleryFilterTabs'
import { MasonryGallery } from '@/features/gallery/MasonryGallery'
import { GalleryLightbox } from '@/features/gallery/GalleryLightbox'
import { useGalleryItems } from '@/features/gallery/useGalleryItems'
import { useMediaOverlay } from '@/hooks/useMediaOverlay'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema, buildImageGallerySchema } from '@/lib/structuredData'
import type { ProjectCategory, ProjectFilter } from '@/types'

type FilterKey = 'all' | ProjectCategory

export function GalleryPage() {
  const { t } = useTranslation('gallery')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()
  const [active, setActive] = useState<FilterKey>('all')

  const { items, isLoading, isError, retry } = useGalleryItems()
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
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <PageMeta
          title={tSeo('gallery.title')}
          description={tSeo('gallery.description')}
          keywords={tSeo('gallery.keywords')}
        />
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav('nav.home'), path: ROUTES.home },
            { name: tNav('nav.gallery'), path: ROUTES.gallery },
          ])}
        />
        {items.length > 0 && (
          <JsonLd
            data={buildImageGallerySchema(
              tSeo('gallery.title'),
              tSeo('gallery.description'),
              items.map((item) => ({ url: item.image, title: item.title, description: item.description })),
            )}
          />
        )}
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

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
