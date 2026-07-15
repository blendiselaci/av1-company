import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '../api/resources'

/** Shared across every list/form page that references categories — same query
 *  key means React Query fetches this once and reuses it everywhere it's needed. */
export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesApi.list({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  const categories = data?.items ?? []
  const options = categories.map((c) => ({ value: c.id, label: c.nameEn }))
  const nameById = new Map(categories.map((c) => [c.id, c.nameEn] as const))

  return { categories, options, nameById, isLoading }
}
