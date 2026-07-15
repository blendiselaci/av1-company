import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi, videosApi } from '../../api/resources'
import { useCategories } from '../../hooks/useCategories'
import { SelectField } from '../../components/form/SelectField'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextField } from '../../components/form/LocalizedTextField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { TextField } from '../../components/form/TextField'
import { ImageUploadField } from '../../components/media/ImageUploadField'
import { VideoUploadField } from '../../components/media/VideoUploadField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const mediaValueSchema = z.object({ url: z.string(), publicId: z.string().nullable() }).nullable()

const formSchema = z.object({
  titleEn: z.string().trim().min(1, 'Required'),
  titleDe: z.string().trim().min(1, 'Required'),
  titleSq: z.string().trim().min(1, 'Required'),
  descriptionEn: z.string().trim().min(1, 'Required'),
  descriptionDe: z.string().trim().min(1, 'Required'),
  descriptionSq: z.string().trim().min(1, 'Required'),
  categoryId: z.string().min(1, 'Required'),
  duration: z.string().trim().min(1, 'Required (e.g. 1:45)'),
  thumbnail: mediaValueSchema,
  video: mediaValueSchema,
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
  categoryId: '',
  duration: '',
  thumbnail: null,
  video: null,
  projectId: '',
  isPublished: true,
  order: 0,
}

export default function VideoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [mediaErrors, setMediaErrors] = useState<{ thumbnail?: string; video?: string }>({})
  const { options: categoryOptions } = useCategories()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosApi.get(id as string),
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
        categoryId: existing.categoryId ?? '',
        duration: existing.duration,
        thumbnail: { url: existing.thumbnail, publicId: existing.thumbnailPublicId },
        video: { url: existing.videoUrl, publicId: existing.videoPublicId },
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
        categoryId: values.categoryId,
        duration: values.duration,
        thumbnail: values.thumbnail!.url,
        thumbnailPublicId: values.thumbnail!.publicId,
        videoUrl: values.video!.url,
        videoPublicId: values.video!.publicId,
        projectId: values.projectId || null,
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? videosApi.update(id as string, payload) : videosApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast.success(isEdit ? 'Video updated' : 'Video created')
      navigate('/videos')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  function onSubmit(values: FormValues) {
    const nextErrors: { thumbnail?: string; video?: string } = {}
    if (!values.thumbnail) nextErrors.thumbnail = 'Thumbnail is required'
    if (!values.video) nextErrors.video = 'Video file is required'
    if (nextErrors.thumbnail || nextErrors.video) {
      setMediaErrors(nextErrors)
      return
    }
    setMediaErrors({})
    mutation.mutate(values)
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading video" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Video' : 'New Video'} backTo="/videos">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <LocalizedTextField label="Title" baseName="title" register={register} errors={errors} required />
        <LocalizedTextareaField label="Description" baseName="description" register={register} errors={errors} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Category"
            required
            registration={register('categoryId')}
            error={errors.categoryId?.message}
            options={categoryOptions}
            placeholder="Select a category"
          />
          <TextField label="Duration" required registration={register('duration')} error={errors.duration?.message} placeholder="1:45" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Linked Project"
            registration={register('projectId')}
            error={errors.projectId?.message}
            placeholder="None"
            options={(projectOptions?.items ?? []).map((project) => ({ value: project.id, label: project.titleEn }))}
          />
          <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField name="thumbnail" control={control} label="Thumbnail" category="VIDEO_THUMBNAIL" required error={mediaErrors.thumbnail} />
          <VideoUploadField name="video" control={control} label="Video File" required error={mediaErrors.video} />
        </div>

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/videos" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
