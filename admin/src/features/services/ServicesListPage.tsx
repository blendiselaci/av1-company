import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { servicesApi } from '../../api/resources'
import type { Service } from '../../types/models'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { RowActions } from '../../components/shared/RowActions'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'

export default function ServicesListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['services', { page }],
    queryFn: () => servicesApi.list({ page, limit: 20 }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['services'] })

  const deleteOne = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Service deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: Service) {
    const ok = await confirm({ title: 'Delete service', description: `Delete "${item.titleEn}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  async function handleBulkDelete(ids: string[]) {
    const ok = await confirm({ title: `Delete ${ids.length} services`, description: 'This cannot be undone.' })
    if (!ok) return
    try {
      await Promise.all(ids.map((id) => servicesApi.remove(id)))
      invalidate()
      toast.success(`${ids.length} services deleted`)
    } catch (error) {
      toast.error('Bulk delete failed', extractErrorMessage(error))
    }
  }

  const columns: Column<Service>[] = [
    { key: 'title', header: 'Title', sortValue: (item) => item.titleEn, render: (item) => item.titleEn },
    { key: 'icon', header: 'Icon', render: (item) => <code className="text-xs text-muted">{item.icon}</code> },
    { key: 'order', header: 'Order', sortValue: (item) => item.order, render: (item) => item.order },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge isPublished={item.isPublished} /> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Services"
        description="Services offered, shown on the site's Services section."
        action={
          <Button onClick={() => navigate('/services/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Service
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
        searchPlaceholder="Search services..."
        emptyMessage="No services yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/services/${item.id}`)} onDelete={() => handleDelete(item)} />}
        canBulkDelete={user?.role === 'ADMIN'}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  )
}
