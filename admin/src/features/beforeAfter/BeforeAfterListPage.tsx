import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { beforeAfterApi } from '../../api/resources'
import type { BeforeAfterProject } from '../../types/models'
import { useCategories } from '../../hooks/useCategories'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { RowActions } from '../../components/shared/RowActions'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'
import { cloudinaryThumbnail } from '../../lib/cloudinary'

export default function BeforeAfterListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()
  const { categories, nameById } = useCategories()

  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState('')

  const params = { page, limit: 20, ...(categoryId ? { categoryId } : {}) }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['before-after', params],
    queryFn: () => beforeAfterApi.list(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['before-after'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => beforeAfterApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Entry deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: BeforeAfterProject) {
    const ok = await confirm({ title: 'Delete entry', description: `Delete "${item.titleEn}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({ title: `Delete ${ids.length} entries`, description: 'This cannot be undone.' })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => beforeAfterApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} entries deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<BeforeAfterProject>[] = [
    {
      key: 'image',
      header: '',
      render: (item) => <img src={cloudinaryThumbnail(item.afterImage)} alt="" loading="lazy" className="h-10 w-10 rounded-md object-cover" />,
    },
    { key: 'title', header: 'Title', sortValue: (item) => item.titleEn, render: (item) => item.titleEn },
    { key: 'location', header: 'Location', sortValue: (item) => item.location, render: (item) => item.location },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <Badge variant="info">{(item.categoryId && nameById.get(item.categoryId)) || 'Uncategorized'}</Badge>,
    },
    { key: 'year', header: 'Year', sortValue: (item) => item.year, render: (item) => item.year },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Before / After"
        description="Transformation showcases with before/after image pairs."
        action={
          <Button onClick={() => navigate('/before-after/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Entry
          </Button>
        }
      />

      <DataTable
        columns={columns}
        items={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onPageChange={setPage}
        getSearchText={(item) => `${item.titleEn} ${item.titleDe} ${item.titleSq} ${item.location}`}
        searchPlaceholder="Search entries..."
        emptyMessage="No before/after entries yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/before-after/${item.id}`)} onDelete={() => handleDelete(item)} />}
        filters={
          <Select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setPage(1)
            }}
            aria-label="Filter by category"
            className="w-auto"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEn}
              </option>
            ))}
          </Select>
        }
        canBulkDelete={user?.role === 'ADMIN'}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  )
}
