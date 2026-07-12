import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { galleryApi, projectsApi } from '../../api/resources'
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
  category: z.enum(['GARDENS', 'YARDS', 'POOLS', 'TERRACES', 'PAVING']),
  image: imageValueSchema,
  projectId: z.string(),
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
  category: 'GARDENS',
  image: null,
  projectId: '',
  isPublished: true,
  order: 0,
}

export default function GalleryFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [imageError, setImageError] = useState<string | undefined>()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: () => galleryApi.get(id as string),
    enabled: isEdit,
  })

  const { data: projectOptions } = useQuery({
    queryKey: ['projects', 'picker'],
    queryFn: () => projectsApi.list({ page: 1, limit: 100 }),
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
        category: existing.category,
        image: { url: existing.image, publicId: existing.imagePublicId },
        projectId: existing.projectId ?? '',
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
        category: values.category,
        image: values.image!.url,
        imagePublicId: values.image!.publicId,
        projectId: values.projectId || null,
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? galleryApi.update(id as string, payload) : galleryApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success(isEdit ? 'Image updated' : 'Image created')
      navigate('/gallery')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  function onSubmit(values: FormValues) {
    if (!values.image) {
      setImageError('Image is required')
      return
    }
    setImageError(undefined)
    mutation.mutate(values)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading image" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Gallery Image' : 'New Gallery Image'} backTo="/gallery">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <LocalizedTextField label="Title" baseName="title" register={register} errors={errors} required />
        <LocalizedTextareaField label="Description" baseName="description" register={register} errors={errors} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Category"
            required
            registration={register('category')}
            error={errors.category?.message}
            options={PROJECT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <SelectField
            label="Linked Project"
            registration={register('projectId')}
            error={errors.projectId?.message}
            placeholder="None"
            options={(projectOptions?.items ?? []).map((project) => ({ value: project.id, label: project.titleEn }))}
          />
        </div>

        <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />

        <ImageUploadField name="image" control={control} label="Image" category="GALLERY" required error={imageError} />

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/gallery" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
