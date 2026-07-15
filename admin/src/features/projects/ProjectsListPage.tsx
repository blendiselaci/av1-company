import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { projectsApi } from '../../api/resources'
import type { Project } from '../../types/models'
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
import { cloudinaryThumbnail } from '../../lib/cloudinary'
import { extractErrorMessage } from '../../lib/errors'

export default function ProjectsListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()
  const { categories, nameById } = useCategories()

  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [isPublished, setIsPublished] = useState<'' | 'true' | 'false'>('')

  const params = {
    page,
    limit: 20,
    ...(categoryId ? { categoryId } : {}),
    ...(isPublished ? { isPublished: isPublished === 'true' } : {}),
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Project deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: Project) {
    const ok = await confirm({ title: 'Delete project', description: `Delete "${item.titleEn}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({
      title: `Delete ${ids.length} project${ids.length > 1 ? 's' : ''}`,
      description: 'This cannot be undone.',
    })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => projectsApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} project${ids.length > 1 ? 's' : ''} deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<Project>[] = [
    {
      key: 'image',
      header: '',
      render: (item) => <img src={cloudinaryThumbnail(item.image)} alt="" loading="lazy" className="h-10 w-10 rounded-md object-cover" />,
    },
    {
      key: 'title',
      header: 'Title',
      sortValue: (item) => item.titleEn,
      render: (item) => (
        <div>
          <p className="font-medium">{item.titleEn}</p>
          <p className="text-xs text-muted">{item.location}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <Badge variant="info">{(item.categoryId && nameById.get(item.categoryId)) || 'Uncategorized'}</Badge>,
    },
    { key: 'year', header: 'Year', sortValue: (item) => item.year, render: (item) => item.year },
    { key: 'order', header: 'Order', sortValue: (item) => item.order, render: (item) => item.order },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        description="Featured landscaping projects shown on the public site."
        action={
          <Button onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Project
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
        searchPlaceholder="Search projects..."
        emptyMessage="No projects yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/projects/${item.id}`)} onDelete={() => handleDelete(item)} />}
        filters={
          <>
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
            <Select
              value={isPublished}
              onChange={(event) => {
                setIsPublished(event.target.value as '' | 'true' | 'false')
                setPage(1)
              }}
              aria-label="Filter by status"
              className="w-auto"
            >
              <option value="">All statuses</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </Select>
          </>
        }
        canBulkDelete={user?.role === 'ADMIN'}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  )
}
