import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../api/resources'
import { TextField } from '../../components/form/TextField'
import { SelectField } from '../../components/form/SelectField'
import { SwitchField } from '../../components/form/SwitchField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const baseSchema = {
  name: z.string().trim().min(1, 'Required'),
  role: z.enum(['ADMIN', 'EDITOR']),
  isActive: z.boolean(),
}

const createSchema = z.object({
  ...baseSchema,
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const editSchema = z.object({
  ...baseSchema,
  password: z.union([z.string().length(0), z.string().min(8, 'Password must be at least 8 characters')]).optional(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export default function UserFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id as string),
    enabled: isEdit,
  })

  const form = useForm<CreateValues | EditValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { name: '', role: 'EDITOR', isActive: true, ...(isEdit ? { password: '' } : { email: '', password: '' }) },
  })
  const { register, control, handleSubmit, reset, formState } = form
  const errors = formState.errors as Partial<Record<'name' | 'email' | 'password' | 'role', { message?: string }>>

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name, role: existing.role, isActive: existing.isActive, password: '' })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: CreateValues | EditValues) => {
      if (isEdit) {
        const { name, role, isActive, password } = values as EditValues
        return usersApi.update(id as string, { name, role, isActive, ...(password ? { password } : {}) })
      }
      const { name, role, isActive, email, password } = values as CreateValues
      return usersApi.create({ name, role, isActive, email, password })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(isEdit ? 'User updated' : 'User created')
      navigate('/users')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading user" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit User' : 'New User'} backTo="/users">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <TextField label="Full Name" required registration={register('name')} error={errors.name?.message} />

        {!isEdit && (
          <TextField
            label="Email"
            type="email"
            required
            registration={register('email' as 'name')}
            error={errors.email?.message}
          />
        )}

        <TextField
          label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
          type="password"
          required={!isEdit}
          registration={register('password' as 'name')}
          error={errors.password?.message}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Role"
            required
            registration={register('role')}
            error={errors.role?.message}
            options={[
              { value: 'EDITOR', label: 'Editor' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
          <div className="flex items-end pb-2">
            <SwitchField name="isActive" control={control} label="Account active" />
          </div>
        </div>

        <FormActions backTo="/users" saving={formState.isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
