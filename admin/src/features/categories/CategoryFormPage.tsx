import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../../api/resources'
import { SwitchField } from '../../components/form/SwitchField'
import { TextField } from '../../components/form/TextField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const formSchema = z.object({
  nameSq: z.string().trim().min(1, 'Required'),
  nameEn: z.string().trim().min(1, 'Required'),
  nameDe: z.string().trim().min(1, 'Required'),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  nameSq: '',
  nameEn: '',
  nameDe: '',
  order: 0,
  isActive: true,
}

export default function CategoryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.get(id as string),
    enabled: isEdit,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: DEFAULT_VALUES })

  useEffect(() => {
    if (existing) {
      reset({
        nameSq: existing.nameSq,
        nameEn: existing.nameEn,
        nameDe: existing.nameDe,
        order: existing.order,
        isActive: existing.isActive,
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => (isEdit ? categoriesApi.update(id as string, values) : categoriesApi.create(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(isEdit ? 'Category updated' : 'Category created')
      navigate('/categories')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading category" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Category' : 'New Category'} backTo="/categories">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <TextField label="Name (Albanian)" required registration={register('nameSq')} error={errors.nameSq?.message} />
        <TextField label="Name (English)" required registration={register('nameEn')} error={errors.nameEn?.message} />
        <TextField label="Name (German)" required registration={register('nameDe')} error={errors.nameDe?.message} />
        <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />

        <SwitchField name="isActive" control={control} label="Active" />

        <FormActions backTo="/categories" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
