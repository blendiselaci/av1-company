import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Trash2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { TableSkeleton } from '../ui/Skeleton'
import { Pagination } from './Pagination'
import { cn } from '../../lib/utils'
import type { ApiListMeta } from '../../types/api'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  sortValue?: (item: T) => string | number
  className?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  items: T[]
  meta: ApiListMeta | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  getSearchText: (item: T) => string
  searchPlaceholder?: string
  emptyMessage?: string
  rowActions?: (item: T) => ReactNode
  filters?: ReactNode
  canBulkDelete?: boolean
  onBulkDelete?: (ids: string[]) => void | Promise<void>
}

type SortDirection = 'asc' | 'desc' | null

/** Search and column sorting operate on the currently-fetched page only — the
 *  backend's list endpoints don't expose a generic sort parameter (they always
 *  order by `order`/`createdAt`), and not every resource's query schema accepts
 *  `search`. Pagination and any `filters` slot content (category, published
 *  status) are server-side, since those genuinely need to reach beyond one page. */
export function DataTable<T extends { id: string }>({
  columns,
  items,
  meta,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  getSearchText,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  rowActions,
  filters,
  canBulkDelete,
  onBulkDelete,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const visibleItems = useMemo(() => {
    let result = items
    if (search.trim()) {
      const needle = search.trim().toLowerCase()
      result = result.filter((item) => getSearchText(item).toLowerCase().includes(needle))
    }
    if (sortKey && sortDirection) {
      const column = columns.find((col) => col.key === sortKey)
      if (column?.sortValue) {
        result = [...result].sort((a, b) => {
          const aVal = column.sortValue!(a)
          const bVal = column.sortValue!(b)
          const compared = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return sortDirection === 'asc' ? compared : -compared
        })
      }
    }
    return result
  }, [items, search, sortKey, sortDirection, columns, getSearchText])

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection('asc')
    } else if (sortDirection === 'asc') {
      setSortDirection('desc')
    } else {
      setSortKey(null)
      setSortDirection(null)
    }
  }

  function toggleSelectAll() {
    if (selected.size === visibleItems.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visibleItems.map((item) => item.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    if (!onBulkDelete || selected.size === 0) return
    setBulkDeleting(true)
    try {
      await onBulkDelete(Array.from(selected))
      setSelected(new Set())
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search this list"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {canBulkDelete && selected.size > 0 && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete} loading={bulkDeleting}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete {selected.size} selected
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <TableSkeleton columns={columns.length + (canBulkDelete ? 1 : 0) + (rowActions ? 1 : 0)} />
        </div>
      ) : isError ? (
        <div className="p-4">
          <ErrorState description="Couldn't load this list." onRetry={onRetry} />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="p-4">
          <EmptyState title={emptyMessage} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                {canBulkDelete && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === visibleItems.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all rows"
                      className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} className={cn('px-4 py-3 font-medium', column.className)}>
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {column.header}
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {rowActions && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-background">
                  {canBulkDelete && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        aria-label="Select row"
                        className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 align-middle text-foreground', column.className)}>
                      {column.render(item)}
                    </td>
                  ))}
                  {rowActions && <td className="px-4 py-3 text-right">{rowActions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && !isLoading && !isError && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  )
}
