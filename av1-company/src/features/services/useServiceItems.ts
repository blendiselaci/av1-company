import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { ServiceItem } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiService {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  icon: string
  image?: string | null
}

function localize(item: ApiService, locale: Locale): ServiceItem {
  const title = locale === 'en' ? item.titleEn : locale === 'de' ? item.titleDe : item.titleSq
  const description = locale === 'en' ? item.descriptionEn : locale === 'de' ? item.descriptionDe : item.descriptionSq
  return {
    id: item.id,
    icon: item.icon,
    title,
    description,
    image: item.image,
  }
}

interface FetchState {
  rawItems: ApiService[] | null
  isLoading: boolean
  isError: boolean
}

interface UseServiceItemsResult {
  items: ServiceItem[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published services from the CMS API — mirrors useGalleryItems.ts. The
 *  admin dashboard's Services section writes to the same `/services`
 *  resource this reads from, so a new service published in admin shows up
 *  here on the next fetch, no rebuild needed. */
export function useServiceItems(): UseServiceItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiService[]>('/services?limit=100')
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
