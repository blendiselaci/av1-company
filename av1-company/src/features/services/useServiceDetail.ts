import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, ApiRequestError } from '@/lib/api'
import { localizeService } from '@/features/services/useServiceItems'
import type { ServiceItem } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiService {
  id: string
  slug: string
  titleEn: string
  titleDe: string
  titleSq: string
  descriptionEn: string
  descriptionDe: string
  descriptionSq: string
  icon: string
  image?: string | null
  benefitsEn: string[]
  benefitsDe: string[]
  benefitsSq: string[]
  galleryImages: string[]
}

interface FetchState {
  rawItem: ApiService | null
  isLoading: boolean
  isError: boolean
}

interface UseServiceDetailResult {
  service: ServiceItem | null
  isLoading: boolean
  isError: boolean
  notFound: boolean
  retry: () => void
}

/** A single published service by slug, for the service detail page
 *  (/sherbimet/:slug) — mirrors useServiceItems.ts's fetch/localize pattern. */
export function useServiceDetail(slug: string | undefined): UseServiceDetailResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItem: null, isLoading: Boolean(slug), isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    apiGet<ApiService>(`/services/slug/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) return
        setState({ rawItem: data, isLoading: false, isError: false })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const notFound = error instanceof ApiRequestError && error.status === 404
        setState({ rawItem: null, isLoading: false, isError: !notFound })
      })

    return () => {
      cancelled = true
    }
  }, [slug, reloadToken])

  const locale = (i18n.resolvedLanguage ?? 'sq') as Locale
  const service = useMemo(() => (state.rawItem ? localizeService(state.rawItem, locale) : null), [state.rawItem, locale])
  const notFound = !slug || (!state.isLoading && !state.isError && !state.rawItem)

  function retry() {
    setState((prev) => ({ ...prev, isLoading: true, isError: false }))
    setReloadToken((token) => token + 1)
  }

  return { service, isLoading: state.isLoading, isError: state.isError, notFound, retry }
}
