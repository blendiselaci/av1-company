import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { Transformation } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiBeforeAfterProject {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  workCompletedEn: string
  workCompletedDe: string
  workCompletedSq: string
  completionTimeEn: string
  completionTimeDe: string
  completionTimeSq: string
  location: string
  categoryId: string | null
  beforeImage: string
  afterImage: string
  year: number
}

function pick(item: ApiBeforeAfterProject, field: 'title' | 'description' | 'workCompleted' | 'completionTime', locale: Locale): string {
  const key = `${field}${locale === 'en' ? 'En' : locale === 'de' ? 'De' : 'Sq'}` as keyof ApiBeforeAfterProject
  return item[key] as string
}

function localize(item: ApiBeforeAfterProject, locale: Locale): Transformation {
  return {
    id: item.id,
    title: pick(item, 'title', locale),
    location: item.location,
    categoryId: item.categoryId,
    beforeImage: item.beforeImage,
    afterImage: item.afterImage,
    description: pick(item, 'description', locale),
    workCompleted: pick(item, 'workCompleted', locale),
    completionTime: pick(item, 'completionTime', locale),
    year: item.year,
  }
}

interface FetchState {
  rawItems: ApiBeforeAfterProject[] | null
  isLoading: boolean
  isError: boolean
}

interface UseBeforeAfterItemsResult {
  items: Transformation[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published before/after projects from the CMS API — mirrors useProjectItems.ts.
 *  The admin dashboard's Before/After section writes to the same `/before-after`
 *  resource this reads from, so a new entry published in admin shows up here
 *  on the next fetch, no rebuild needed. */
export function useBeforeAfterItems(): UseBeforeAfterItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiBeforeAfterProject[]>('/before-after?limit=100')
      .then((data) => {
        if (cancelled) return
        setState({ rawItems: data, isLoading: false, isError: false })
      })
      .catch(() => {
        if (cancelled) return
        setState((prev) => ({ ...prev, isLoading: false, isError: true }))
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const locale = (i18n.resolvedLanguage ?? 'sq') as Locale
  const items = useMemo(() => (state.rawItems ?? []).map((item) => localize(item, locale)), [state.rawItems, locale])

  function retry() {
    setState((prev) => ({ ...prev, isLoading: true, isError: false }))
    setReloadToken((token) => token + 1)
  }

  return { items, isLoading: state.isLoading, isError: state.isError, retry }
}
