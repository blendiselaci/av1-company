import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Star } from 'lucide-react'
import { testimonialsApi } from '../../api/resources'
import type { Testimonial } from '../../types/models'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { RowActions } from '../../components/shared/RowActions'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'

export default function TestimonialsListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['testimonials', { page }],
    queryFn: () => testimonialsApi.list({ page, limit: 20 }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['testimonials'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => testimonialsApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Testimonial deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: Testimonial) {
    const ok = await confirm({ title: 'Delete testimonial', description: `Delete testimonial from "${item.clientName}"?` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({ title: `Delete ${ids.length} testimonials`, description: 'This cannot be undone.' })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => testimonialsApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} testimonials deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<Testimonial>[] = [
    {
      key: 'client',
      header: 'Client',
      sortValue: (item) => item.clientName,
      render: (item) => (
        <div>
          <p className="font-medium">{item.clientName}</p>
          <p className="text-xs text-muted">{item.location}</p>
        </div>
      ),
    },
    { key: 'projectType', header: 'Project Type', render: (item) => item.projectType },
    {
      key: 'rating',
      header: 'Rating',
      sortValue: (item) => item.rating,
      render: (item) => (
        <span className="inline-flex items-center gap-0.5 text-warning">
          {Array.from({ length: item.rating }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          ))}
          <span className="sr-only">{item.rating} out of 5 stars</span>
        </span>
      ),
    },
    { key: 'date', header: 'Date', render: (item) => item.date },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Testimonials"
        description="Client reviews shown in the testimonials carousel."
        action={
          <Button onClick={() => navigate('/testimonials/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Testimonial
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
        getSearchText={(item) => `${item.clientName} ${item.location} ${item.projectType}`}
        searchPlaceholder="Search testimonials..."
        emptyMessage="No testimonials yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/testimonials/${item.id}`)} onDelete={() => handleDelete(item)} />}
        canBulkDelete={user?.role === 'ADMIN'}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  )
}
