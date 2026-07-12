import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProjectFilterBar } from '@/features/projects/ProjectFilterBar'
import { ProjectsGrid } from '@/features/projects/ProjectsGrid'
import { useProjectItems } from '@/features/projects/useProjectItems'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'
import type { ProjectCategory, ProjectFilter } from '@/types'

type FilterKey = 'all' | ProjectCategory

export function ProjectsPage() {
  const { t } = useTranslation('projects')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()
  const [active, setActive] = useState<FilterKey>('all')

  const { items, isLoading, isError, retry } = useProjectItems()
  const filterLabels = t('filters', { returnObjects: true }) as Record<FilterKey, string>

  const filters: ProjectFilter[] = useMemo(
    () => (Object.keys(filterLabels) as FilterKey[]).map((key) => ({ key, label: filterLabels[key] })),
    [filterLabels],
  )

  const filteredProjects = useMemo(
    () => (active === 'all' ? items : items.filter((project) => project.category === active)),
    [items, active],
  )

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <PageMeta
          title={tSeo('projects.title')}
          description={tSeo('projects.description')}
          keywords={tSeo('projects.keywords')}
        />
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: tNav('nav.home'), path: ROUTES.home },
            { name: tNav('nav.projects'), path: ROUTES.projects },
          ])}
        />
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-10 flex justify-center">
          <ProjectFilterBar filters={filters} active={active} onChange={(key) => setActive(key as FilterKey)} />
        </div>

        <div className="mt-12">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : filteredProjects.length > 0 ? (
            <ProjectsGrid projects={filteredProjects} categoryLabels={filterLabels} viewLabel={t('viewProject')} />
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
    </section>
  )
}
