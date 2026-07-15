import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { categoriesApi } from '../../api/resources'
import type { Category } from '../../types/models'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { RowActions } from '../../components/shared/RowActions'
import { PageHeader } from '../../components/shared/PageHeader'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'

export default function CategoriesListPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list({ page: 1, limit: 100 }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Category deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => categoriesApi.reorder(items),
    onSuccess: () => invalidate(),
    onError: (error) => toast.error('Reorder failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: Category) {
    const ok = await confirm({
      title: 'Delete category',
      description: `Delete "${item.nameEn}"? Projects, gallery images, videos and before/after entries using it will become uncategorized — nothing else is deleted.`,
    })
    if (ok) deleteOne.mutate(item.id)
  }

  function moveItem(items: Category[], item: Category, direction: 'up' | 'down') {
    const index = items.findIndex((c) => c.id === item.id)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= items.length) return
    const other = items[swapIndex]!
    reorder.mutate([
      { id: item.id, order: other.order },
      { id: other.id, order: item.order },
    ])
  }

  const items = data?.items ?? []

  const columns: Column<Category>[] = [
    { key: 'nameSq', header: 'Name SQ', render: (item) => item.nameSq },
    { key: 'nameEn', header: 'Name EN', render: (item) => item.nameEn },
    { key: 'nameDe', header: 'Name DE', render: (item) => item.nameDe },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge variant={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        description="The taxonomy used across projects, gallery, videos and before/after — shown as filters throughout the public site."
        action={
          <Button onClick={() => navigate('/categories/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        items={items}
        meta={undefined}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onPageChange={() => undefined}
        getSearchText={(item) => `${item.nameSq} ${item.nameEn} ${item.nameDe}`}
        searchPlaceholder="Search categories..."
        emptyMessage="No categories yet."
        rowActions={(item) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(items, item, 'up')}
              disabled={reorder.isPending || items[0]?.id === item.id}
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(items, item, 'down')}
              disabled={reorder.isPending || items[items.length - 1]?.id === item.id}
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            <RowActions onEdit={() => navigate(`/categories/${item.id}`)} onDelete={() => handleDelete(item)} />
          </div>
        )}
        canBulkDelete={false}
      />
      {dialog}
    </div>
  )
}
