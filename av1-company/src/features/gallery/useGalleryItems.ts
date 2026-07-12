import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { GalleryItem, ProjectCategory } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiGalleryImage {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  category: 'GARDENS' | 'YARDS' | 'POOLS' | 'TERRACES' | 'PAVING'
  image: string
}

function localize(item: ApiGalleryImage, locale: Locale): GalleryItem {
  const title = locale === 'en' ? item.titleEn : locale === 'de' ? item.titleDe : item.titleSq
  const description = locale === 'en' ? item.descriptionEn : locale === 'de' ? item.descriptionDe : item.descriptionSq
  return {
    id: item.id,
    title,
    description,
    category: item.category.toLowerCase() as ProjectCategory,
    image: item.image,
  }
}

interface FetchState {
  rawItems: ApiGalleryImage[] | null
  isLoading: boolean
  isError: boolean
}

interface UseGalleryItemsResult {
  items: GalleryItem[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published gallery images from the CMS API — the admin dashboard's Gallery
 *  section writes to the same `/gallery` resource this reads from, so a new
 *  image published in admin shows up here on the next fetch, no rebuild
 *  needed. The API already returns only `isPublished: true` rows, ordered by
 *  `order` then newest-first, so no further filtering/sorting happens here. */
export function useGalleryItems(): UseGalleryItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiGalleryImage[]>('/gallery?limit=100')
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
