import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { ProjectFilterBar } from '@/features/projects/ProjectFilterBar'
import { ProjectsGrid } from '@/features/projects/ProjectsGrid'
import { useProjectItems } from '@/features/projects/useProjectItems'
import { useCategories } from '@/hooks/useCategories'
import { ROUTES } from '@/lib/routes'
import type { ProjectFilter } from '@/types'

type FilterKey = string

export function ProjectsSection() {
  const { t } = useTranslation('projects')
  const [active, setActive] = useState<FilterKey>('all')

  const { items, isLoading, isError, retry } = useProjectItems()
  const { categories, getLabel } = useCategories()

  const filters: ProjectFilter[] = useMemo(
    () => [{ key: 'all', label: t('filters.all') }, ...categories.map((category) => ({ key: category.id, label: category.label }))],
    [categories, t],
  )

  const filteredProjects = useMemo(
    () => (active === 'all' ? items : items.filter((project) => project.categoryId === active)),
    [items, active],
  )

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <div className="mt-10 flex justify-center">
          <ProjectFilterBar
            filters={filters}
            active={active}
            onChange={(key) => setActive(key as FilterKey)}
          />
        </div>

        <div className="mt-12">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          ) : filteredProjects.length > 0 ? (
            <ProjectsGrid projects={filteredProjects} getLabel={getLabel} viewLabel={t('viewProject')} />
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
          <LinkButton to={ROUTES.projects} variant="primary" size="lg">
            {t('viewAll')}
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}
