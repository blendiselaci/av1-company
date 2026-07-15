import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { galleryApi } from '../../api/resources'
import type { GalleryImage } from '../../types/models'
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

export default function GalleryListPage() {
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
    queryKey: ['gallery', params],
    queryFn: () => galleryApi.list(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['gallery'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => galleryApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Image deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: GalleryImage) {
    const ok = await confirm({ title: 'Delete image', description: `Delete "${item.titleEn}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({ title: `Delete ${ids.length} images`, description: 'This cannot be undone.' })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => galleryApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} images deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<GalleryImage>[] = [
    {
      key: 'image',
      header: '',
      render: (item) => <img src={cloudinaryThumbnail(item.image)} alt="" loading="lazy" className="h-10 w-10 rounded-md object-cover" />,
    },
    { key: 'title', header: 'Title', sortValue: (item) => item.titleEn, render: (item) => item.titleEn },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <Badge variant="info">{(item.categoryId && nameById.get(item.categoryId)) || 'Uncategorized'}</Badge>,
    },
    { key: 'order', header: 'Order', sortValue: (item) => item.order, render: (item) => item.order },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Gallery"
        description="Standalone gallery photos shown across the site."
        action={
          <Button onClick={() => navigate('/gallery/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Image
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
        searchPlaceholder="Search gallery..."
        emptyMessage="No gallery images yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/gallery/${item.id}`)} onDelete={() => handleDelete(item)} />}
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
