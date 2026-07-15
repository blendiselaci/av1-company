import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { videosApi } from '../../api/resources'
import type { Video } from '../../types/models'
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

export default function VideosListPage() {
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
    queryKey: ['videos', params],
    queryFn: () => videosApi.list(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['videos'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => videosApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Video deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: Video) {
    const ok = await confirm({ title: 'Delete video', description: `Delete "${item.titleEn}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({ title: `Delete ${ids.length} videos`, description: 'This cannot be undone.' })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => videosApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} videos deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<Video>[] = [
    {
      key: 'thumbnail',
      header: '',
      render: (item) => <img src={cloudinaryThumbnail(item.thumbnail)} alt="" loading="lazy" className="h-10 w-16 rounded-md object-cover" />,
    },
    { key: 'title', header: 'Title', sortValue: (item) => item.titleEn, render: (item) => item.titleEn },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <Badge variant="info">{(item.categoryId && nameById.get(item.categoryId)) || 'Uncategorized'}</Badge>,
    },
    { key: 'duration', header: 'Duration', render: (item) => item.duration },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Videos"
        description="Video tours shown in the public video gallery."
        action={
          <Button onClick={() => navigate('/videos/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Video
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
        getSearchText={(item) => `${item.titleEn} ${item.titleDe} ${item.titleSq}`}
        searchPlaceholder="Search videos..."
        emptyMessage="No videos yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/videos/${item.id}`)} onDelete={() => handleDelete(item)} />}
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
