import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { ProjectCategory, VideoItem } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiVideo {
  id: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  category: 'GARDENS' | 'YARDS' | 'POOLS' | 'TERRACES' | 'PAVING'
  duration: string
  thumbnail: string
  videoUrl: string
  projectId: string | null
}

function localize(item: ApiVideo, locale: Locale): VideoItem {
  const title = locale === 'en' ? item.titleEn : locale === 'de' ? item.titleDe : item.titleSq
  const description = locale === 'en' ? item.descriptionEn : locale === 'de' ? item.descriptionDe : item.descriptionSq
  return {
    id: item.id,
    title,
    category: item.category.toLowerCase() as ProjectCategory,
    duration: item.duration,
    thumbnail: item.thumbnail,
    videoUrl: item.videoUrl,
    description,
    project: item.projectId ?? '',
  }
}

interface FetchState {
  rawItems: ApiVideo[] | null
  isLoading: boolean
  isError: boolean
}

interface UseVideoItemsResult {
  items: VideoItem[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published videos from the CMS API — mirrors useProjectItems.ts. The admin
 *  dashboard's Videos section writes to the same `/videos` resource this
 *  reads from, so a new video published in admin shows up here on the next
 *  fetch, no rebuild needed. */
export function useVideoItems(): UseVideoItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiVideo[]>('/videos?limit=100')
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
