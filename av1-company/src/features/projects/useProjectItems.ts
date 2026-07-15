import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { Project } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiProject {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  categoryId: string | null
  location: string
  image: string
}

function localize(item: ApiProject, locale: Locale): Project {
  const title = locale === 'en' ? item.titleEn : locale === 'de' ? item.titleDe : item.titleSq
  const description = locale === 'en' ? item.descriptionEn : locale === 'de' ? item.descriptionDe : item.descriptionSq
  return {
    id: item.id,
    title,
    description,
    categoryId: item.categoryId,
    location: item.location,
    image: item.image,
  }
}

interface FetchState {
  rawItems: ApiProject[] | null
  isLoading: boolean
  isError: boolean
}

interface UseProjectItemsResult {
  items: Project[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published projects from the CMS API — mirrors useGalleryItems.ts. The
 *  admin dashboard's Projects section writes to the same `/projects`
 *  resource this reads from, so a new project published in admin shows up
 *  here on the next fetch, no rebuild needed. */
export function useProjectItems(): UseProjectItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiProject[]>('/projects?limit=100')
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
