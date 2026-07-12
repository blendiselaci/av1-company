import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { beforeAfterApi } from '../../api/resources'
import { PROJECT_CATEGORIES } from '../../types/models'
import { SelectField } from '../../components/form/SelectField'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextField } from '../../components/form/LocalizedTextField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { TextField } from '../../components/form/TextField'
import { ImageUploadField } from '../../components/media/ImageUploadField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const imageValueSchema = z.object({ url: z.string(), publicId: z.string().nullable() }).nullable()

const formSchema = z.object({
  titleEn: z.string().trim().min(1, 'Required'),
  titleDe: z.string().trim().min(1, 'Required'),
  titleSq: z.string().trim().min(1, 'Required'),
  descriptionEn: z.string().trim().min(1, 'Required'),
  descriptionDe: z.string().trim().min(1, 'Required'),
  descriptionSq: z.string().trim().min(1, 'Required'),
  workCompletedEn: z.string().trim().min(1, 'Required'),
  workCompletedDe: z.string().trim().min(1, 'Required'),
  workCompletedSq: z.string().trim().min(1, 'Required'),
  completionTimeEn: z.string().trim().min(1, 'Required'),
  completionTimeDe: z.string().trim().min(1, 'Required'),
  completionTimeSq: z.string().trim().min(1, 'Required'),
  location: z.string().trim().min(1, 'Required'),
  category: z.enum(['GARDENS', 'YARDS', 'POOLS', 'TERRACES', 'PAVING']),
  beforeImage: imageValueSchema,
  afterImage: imageValueSchema,
  year: z.coerce.number().int().min(1900).max(2100),
  isPublished: z.boolean(),
  order: z.coerce.number().int(),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  titleEn: '',
  titleDe: '',
  titleSq: '',
  descriptionEn: '',
  descriptionDe: '',
  descriptionSq: '',
  workCompletedEn: '',
  workCompletedDe: '',
  workCompletedSq: '',
  completionTimeEn: '',
  completionTimeDe: '',
  completionTimeSq: '',
  location: '',
  category: 'GARDENS',
  beforeImage: null,
  afterImage: null,
  year: new Date().getFullYear(),
  isPublished: true,
  order: 0,
}

export default function BeforeAfterFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [imageErrors, setImageErrors] = useState<{ before?: string; after?: string }>({})

  const { data: existing, isLoading } = useQuery({
    queryKey: ['before-after', id],
    queryFn: () => beforeAfterApi.get(id as string),
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
        titleEn: existing.titleEn,
        titleDe: existing.titleDe,
        titleSq: existing.titleSq,
        descriptionEn: existing.descriptionEn,
        descriptionDe: existing.descriptionDe,
        descriptionSq: existing.descriptionSq,
        workCompletedEn: existing.workCompletedEn,
        workCompletedDe: existing.workCompletedDe,
        workCompletedSq: existing.workCompletedSq,
        completionTimeEn: existing.completionTimeEn,
        completionTimeDe: existing.completionTimeDe,
        completionTimeSq: existing.completionTimeSq,
        location: existing.location,
        category: existing.category,
        beforeImage: { url: existing.beforeImage, publicId: existing.beforeImagePublicId },
        afterImage: { url: existing.afterImage, publicId: existing.afterImagePublicId },
        year: existing.year,
        isPublished: existing.isPublished,
        order: existing.order,
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        titleEn: values.titleEn,
        titleDe: values.titleDe,
        titleSq: values.titleSq,
        descriptionEn: values.descriptionEn,
        descriptionDe: values.descriptionDe,
        descriptionSq: values.descriptionSq,
        workCompletedEn: values.workCompletedEn,
        workCompletedDe: values.workCompletedDe,
        workCompletedSq: values.workCompletedSq,
        completionTimeEn: values.completionTimeEn,
        completionTimeDe: values.completionTimeDe,
        completionTimeSq: values.completionTimeSq,
        location: values.location,
        category: values.category,
        beforeImage: values.beforeImage!.url,
        beforeImagePublicId: values.beforeImage!.publicId,
        afterImage: values.afterImage!.url,
        afterImagePublicId: values.afterImage!.publicId,
        year: values.year,
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? beforeAfterApi.update(id as string, payload) : beforeAfterApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after'] })
      toast.success(isEdit ? 'Entry updated' : 'Entry created')
      navigate('/before-after')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  function onSubmit(values: FormValues) {
    const nextErrors: { before?: string; after?: string } = {}
    if (!values.beforeImage) nextErrors.before = 'Before image is required'
    if (!values.afterImage) nextErrors.after = 'After image is required'
    if (nextErrors.before || nextErrors.after) {
      setImageErrors(nextErrors)
      return
    }
    setImageErrors({})
    mutation.mutate(values)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading entry" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Before/After Entry' : 'New Before/After Entry'} backTo="/before-after">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <LocalizedTextField label="Title" baseName="title" register={register} errors={errors} required />
        <LocalizedTextareaField label="Description" baseName="description" register={register} errors={errors} required />
        <LocalizedTextField label="Work Completed" baseName="workCompleted" register={register} errors={errors} required />
        <LocalizedTextField label="Completion Time" baseName="completionTime" register={register} errors={errors} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Location" required registration={register('location')} error={errors.location?.message} />
          <SelectField
            label="Category"
            required
            registration={register('category')}
            error={errors.category?.message}
            options={PROJECT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Year" type="number" required registration={register('year')} error={errors.year?.message} />
          <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField name="beforeImage" control={control} label="Before Image" category="BEFORE_AFTER" required error={imageErrors.before} />
          <ImageUploadField name="afterImage" control={control} label="After Image" category="BEFORE_AFTER" required error={imageErrors.after} />
        </div>

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/before-after" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
