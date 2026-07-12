import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../../api/resources'
import { PROJECT_CATEGORIES } from '../../types/models'
import { TextField } from '../../components/form/TextField'
import { SelectField } from '../../components/form/SelectField'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextField } from '../../components/form/LocalizedTextField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { ImageUploadField } from '../../components/media/ImageUploadField'
import { MultiImageUploadField } from '../../components/media/MultiImageUploadField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const imageValueSchema = z.object({ url: z.string(), publicId: z.string().nullable() }).nullable()

const formSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
  titleEn: z.string().trim().min(1, 'Required'),
  titleDe: z.string().trim().min(1, 'Required'),
  titleSq: z.string().trim().min(1, 'Required'),
  descriptionEn: z.string().trim().min(1, 'Required'),
  descriptionDe: z.string().trim().min(1, 'Required'),
  descriptionSq: z.string().trim().min(1, 'Required'),
  category: z.enum(['GARDENS', 'YARDS', 'POOLS', 'TERRACES', 'PAVING']),
  location: z.string().trim().min(1, 'Required'),
  year: z.coerce.number().int().min(1900).max(2100),
  image: imageValueSchema,
  gallery: z.array(z.string()).default([]),
  servicesText: z.string().optional(),
  isPublished: z.boolean(),
  order: z.coerce.number().int(),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  slug: '',
  titleEn: '',
  titleDe: '',
  titleSq: '',
  descriptionEn: '',
  descriptionDe: '',
  descriptionSq: '',
  category: 'GARDENS',
  location: '',
  year: new Date().getFullYear(),
  image: null,
  gallery: [],
  servicesText: '',
  isPublished: true,
  order: 0,
}

export default function ProjectFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [imageError, setImageError] = useState<string | undefined>()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id as string),
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
        slug: existing.slug,
        titleEn: existing.titleEn,
        titleDe: existing.titleDe,
        titleSq: existing.titleSq,
        descriptionEn: existing.descriptionEn,
        descriptionDe: existing.descriptionDe,
        descriptionSq: existing.descriptionSq,
        category: existing.category,
        location: existing.location,
        year: existing.year,
        image: { url: existing.image, publicId: existing.imagePublicId },
        gallery: existing.gallery,
        servicesText: existing.services.join(', '),
        isPublished: existing.isPublished,
        order: existing.order,
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        slug: values.slug,
        titleEn: values.titleEn,
        titleDe: values.titleDe,
        titleSq: values.titleSq,
        descriptionEn: values.descriptionEn,
        descriptionDe: values.descriptionDe,
        descriptionSq: values.descriptionSq,
        category: values.category,
        location: values.location,
        year: values.year,
        image: values.image!.url,
        imagePublicId: values.image!.publicId,
        gallery: values.gallery,
        services: (values.servicesText ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? projectsApi.update(id as string, payload) : projectsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(isEdit ? 'Project updated' : 'Project created')
      navigate('/projects')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  function onSubmit(values: FormValues) {
    if (!values.image) {
      setImageError('Cover image is required')
      return
    }
    setImageError(undefined)
    mutation.mutate(values)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading project" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Project' : 'New Project'} backTo="/projects">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <TextField label="Slug" required registration={register('slug')} error={errors.slug?.message} placeholder="villa-garden-tirana" />
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
          <TextField label="Location" required registration={register('location')} error={errors.location?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Year" type="number" required registration={register('year')} error={errors.year?.message} />
          <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />
        </div>

        <TextField
          label="Services (comma-separated)"
          registration={register('servicesText')}
          error={errors.servicesText?.message}
          placeholder="Garden Design, Greenery Maintenance"
        />

        <ImageUploadField name="image" control={control} label="Cover Image" category="PROJECT_COVER" required error={imageError} />
        <MultiImageUploadField name="gallery" control={control} label="Additional Gallery Images" category="GALLERY" />

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/projects" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
