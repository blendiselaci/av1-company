import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Mail, Trash2 } from 'lucide-react'
import * as contactApi from '../../api/contactMessages'
import { CONTACT_STATUSES, type ContactMessage, type ContactStatus } from '../../types/models'
import { DataTable, type Column } from '../../components/table/DataTable'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuth } from '../../auth/useAuth'
import { useToast } from '../../hooks/useToast'
import { useConfirm } from '../../hooks/useConfirm'
import { extractErrorMessage } from '../../lib/errors'

const STATUS_VARIANT: Record<ContactStatus, 'info' | 'success' | 'neutral'> = {
  NEW: 'info',
  READ: 'success',
  REPLIED: 'neutral',
}

export default function ContactMessagesListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { confirm, dialog } = useConfirm()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ContactStatus | ''>('')
  const [viewing, setViewing] = useState<ContactMessage | null>(null)

  const params = { page, limit: 20, ...(status ? { status } : {}) }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['contact-messages', params],
    queryFn: () => contactApi.listContactMessages(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['contact-messages'] })

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: ContactStatus }) => contactApi.updateContactMessageStatus(id, next),
    onSuccess: (updated) => {
      invalidate()
      setViewing((prev) => (prev && prev.id === updated.id ? updated : prev))
    },
    onError: (error) => toast.error('Update failed', extractErrorMessage(error)),
  })

  const deleteOne = useMutation({
    mutationFn: (id: string) => contactApi.deleteContactMessage(id),
    onSuccess: () => {
      invalidate()
      toast.success('Message deleted')
      setViewing(null)
    },
    onError: (error) => toast.error('Delete failed', extractErrorMessage(error)),
  })

  function handleView(message: ContactMessage) {
    setViewing(message)
    if (message.status === 'NEW') {
      updateStatus.mutate({ id: message.id, next: 'READ' })
    }
  }

  async function handleDelete(message: ContactMessage) {
    const ok = await confirm({
      title: 'Delete message',
      description: `Delete the message from "${message.firstName} ${message.lastName}"? This cannot be undone.`,
    })
    if (ok) deleteOne.mutate(message.id)
  }

  const columns: Column<ContactMessage>[] = [
    {
      key: 'name',
      header: 'From',
      sortValue: (item) => item.firstName,
      render: (item) => (
        <div>
          <p className="font-medium">
            {item.firstName} {item.lastName}
          </p>
          <p className="text-xs text-muted">{item.email}</p>
        </div>
      ),
    },
    { key: 'service', header: 'Service', render: (item) => item.service ?? '—' },
    {
      key: 'message',
      header: 'Message',
      render: (item) => <span className="line-clamp-1 max-w-xs text-muted">{item.message}</span>,
    },
    {
      key: 'date',
      header: 'Received',
      sortValue: (item) => item.createdAt,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    { key: 'status', header: 'Status', render: (item) => <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge> },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Contact Messages" description="Inbox for messages submitted through the public contact form." />

      <DataTable
        columns={columns}
        items={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onPageChange={setPage}
        getSearchText={(item) => `${item.firstName} ${item.lastName} ${item.email} ${item.message}`}
        searchPlaceholder="Search messages..."
        emptyMessage="No messages yet."
        rowActions={(item) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleView(item)} aria-label="View message">
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} aria-label="Delete message">
              <Trash2 className="h-4 w-4 text-danger" aria-hidden="true" />
            </Button>
          </div>
        )}
        filters={
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ContactStatus | '')
              setPage(1)
            }}
            aria-label="Filter by status"
            className="w-auto"
          >
            <option value="">All statuses</option>
            {CONTACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
        canBulkDelete={user?.role === 'ADMIN'}
        onBulkDelete={async (ids) => {
          const ok = await confirm({ title: `Delete ${ids.length} messages`, description: 'This cannot be undone.' })
          if (!ok) return
          await Promise.all(ids.map((id) => contactApi.deleteContactMessage(id)))
          invalidate()
          toast.success(`${ids.length} messages deleted`)
        }}
      />

      <Modal isOpen={viewing !== null} onClose={() => setViewing(null)} title="Message details" size="md">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">
                  {viewing.firstName} {viewing.lastName}
                </p>
                <a href={`mailto:${viewing.email}`} className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {viewing.email}
                </a>
                {viewing.phone && <p className="text-sm text-muted">{viewing.phone}</p>}
              </div>
              <Badge variant={STATUS_VARIANT[viewing.status]}>{viewing.status}</Badge>
            </div>

            {viewing.service && (
              <p className="text-sm">
                <span className="font-medium text-foreground">Interested in:</span> <span className="text-muted">{viewing.service}</span>
              </p>
            )}

            <p className="whitespace-pre-wrap rounded-lg bg-background p-3 text-sm text-foreground">{viewing.message}</p>

            <p className="text-xs text-muted">Received {new Date(viewing.createdAt).toLocaleString()}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex gap-2">
                {CONTACT_STATUSES.filter((s) => s !== viewing.status).map((s) => (
                  <Button
                    key={s}
                    variant="secondary"
                    size="sm"
                    onClick={() => updateStatus.mutate({ id: viewing.id, next: s })}
                    loading={updateStatus.isPending}
                  >
                    Mark as {s.toLowerCase()}
                  </Button>
                ))}
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDelete(viewing)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {dialog}
    </div>
  )
}
