import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { usersApi } from '../../api/resources'
import type { AdminUser } from '../../types/models'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { RowActions } from '../../components/shared/RowActions'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'

export default function UsersListPage() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', { page }],
    queryFn: () => usersApi.list({ page, limit: 20 }),
    placeholderData: keepPreviousData,
  })

  const deleteOne = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  async function handleDelete(item: AdminUser) {
    if (item.id === currentUser?.id) {
      toast.error("You can't delete your own account")
      return
    }
    const ok = await confirm({ title: 'Delete user', description: `Delete "${item.name}"? This cannot be undone.` })
    if (ok) deleteOne.mutate(item.id)
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (item) => item.name,
      render: (item) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted">{item.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortValue: (item) => item.role, render: (item) => <Badge variant={item.role === 'ADMIN' ? 'info' : 'neutral'}>{item.role}</Badge> },
    { key: 'status', header: 'Status', render: (item) => <Badge variant={item.isActive ? 'success' : 'danger'}>{item.isActive ? 'Active' : 'Deactivated'}</Badge> },
    { key: 'createdAt', header: 'Created', sortValue: (item) => item.createdAt, render: (item) => new Date(item.createdAt).toLocaleDateString() },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Admin and editor accounts with access to this dashboard."
        action={
          <Button onClick={() => navigate('/users/new')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New User
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
        getSearchText={(item) => `${item.name} ${item.email}`}
        searchPlaceholder="Search users..."
        emptyMessage="No users yet."
        rowActions={(item) => <RowActions onEdit={() => navigate(`/users/${item.id}`)} onDelete={() => handleDelete(item)} />}
        canBulkDelete
        onBulkDelete={async (ids) => {
          const targetIds = ids.filter((id) => id !== currentUser?.id)
          if (targetIds.length === 0) {
            toast.error("You can't delete your own account")
            return
          }
          const ok = await confirm({ title: `Delete ${targetIds.length} users`, description: 'This cannot be undone.' })
          if (!ok) return
          await Promise.all(targetIds.map((id) => usersApi.remove(id)))
          queryClient.invalidateQueries({ queryKey: ['users'] })
          toast.success(`${targetIds.length} users deleted`)
        }}
      />
      {dialog}
    </div>
  )
}
