import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { Testimonial } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiTestimonial {
  id: string
  clientName: string
  location: string
  projectType: string
  textEn: string
  textDe: string
  textSq: string
  rating: number
  image: string | null
  date: string
}

function localize(item: ApiTestimonial, locale: Locale): Testimonial {
  const text = locale === 'en' ? item.textEn : locale === 'de' ? item.textDe : item.textSq
  return {
    id: item.id,
    clientName: item.clientName,
    location: item.location,
    projectType: item.projectType,
    text,
    rating: item.rating,
    image: item.image,
    date: item.date,
  }
}

interface FetchState {
  rawItems: ApiTestimonial[] | null
  isLoading: boolean
  isError: boolean
}

interface UseTestimonialItemsResult {
  items: Testimonial[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published testimonials from the CMS API — mirrors useGalleryItems.ts. The
 *  admin dashboard's Testimonials section writes to the same `/testimonials`
 *  resource this reads from, so a new review published in admin shows up
 *  here on the next fetch, no rebuild needed. */
export function useTestimonialItems(): UseTestimonialItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiTestimonial[]>('/testimonials?limit=100')
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
