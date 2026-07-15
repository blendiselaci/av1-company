import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'

type Locale = 'en' | 'de' | 'sq'

interface ApiCategory {
  id: string
  nameSq: string
  nameEn: string
  nameDe: string
  slug: string
  order: number
  isActive: boolean
}

export interface CategoryOption {
  id: string
  label: string
}

interface UseCategoriesResult {
  categories: CategoryOption[]
  isLoading: boolean
  isError: boolean
  getLabel: (categoryId: string | null | undefined) => string
}

function nameForLocale(item: ApiCategory, locale: Locale): string {
  return locale === 'en' ? item.nameEn : locale === 'de' ? item.nameDe : item.nameSq
}

/** Active categories from the CMS API, already ordered by the admin's saved
 *  sort order — feeds every category filter/badge/label on the public site.
 *  A category created in admin appears here on the next fetch, no rebuild
 *  needed. Mirrors useProjectItems.ts and friends. */
export function useCategories(): UseCategoriesResult {
  const { i18n } = useTranslation()
  const [rawItems, setRawItems] = useState<ApiCategory[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiCategory[]>('/categories?limit=100')
      .then((data) => {
        if (cancelled) return
        setRawItems(data)
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setIsError(true)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const locale = (i18n.resolvedLanguage ?? 'sq') as Locale

  const categories = useMemo(
    () => (rawItems ?? []).map((item) => ({ id: item.id, label: nameForLocale(item, locale) })),
    [rawItems, locale],
  )

  const labelById = useMemo(() => new Map(categories.map((category) => [category.id, category.label])), [categories])

  function getLabel(categoryId: string | null | undefined): string {
    if (!categoryId) return ''
    return labelById.get(categoryId) ?? ''
  }

  return { categories, isLoading, isError, getLabel }
}
