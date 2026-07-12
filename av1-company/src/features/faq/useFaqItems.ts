import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '@/lib/api'
import type { FaqItem } from '@/types'

type Locale = 'en' | 'de' | 'sq'

interface ApiFaq {
  id: string
  questionEn: string
  questionDe: string
  questionSq: string
  answerEn: string
  answerDe: string
  answerSq: string
}

function localize(item: ApiFaq, locale: Locale): FaqItem {
  const question = locale === 'en' ? item.questionEn : locale === 'de' ? item.questionDe : item.questionSq
  const answer = locale === 'en' ? item.answerEn : locale === 'de' ? item.answerDe : item.answerSq
  return {
    id: item.id,
    question,
    answer,
  }
}

interface FetchState {
  rawItems: ApiFaq[] | null
  isLoading: boolean
  isError: boolean
}

interface UseFaqItemsResult {
  items: FaqItem[]
  isLoading: boolean
  isError: boolean
  retry: () => void
}

/** Published FAQs from the CMS API — mirrors useGalleryItems.ts. The admin
 *  dashboard's FAQs section writes to the same `/faqs` resource this reads
 *  from, so a new question published in admin shows up here on the next
 *  fetch, no rebuild needed. */
export function useFaqItems(): UseFaqItemsResult {
  const { i18n } = useTranslation()
  const [state, setState] = useState<FetchState>({ rawItems: null, isLoading: true, isError: false })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    apiGet<ApiFaq[]>('/faqs?limit=100')
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
