import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '../../api/resources'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextField } from '../../components/form/LocalizedTextField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { TextField } from '../../components/form/TextField'
import { ImageUploadField } from '../../components/media/ImageUploadField'
import { MultiImageUploadField } from '../../components/media/MultiImageUploadField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const formSchema = z.object({
  titleEn: z.string().trim().min(1, 'Required'),
  titleDe: z.string().trim().min(1, 'Required'),
  titleSq: z.string().trim().min(1, 'Required'),
  descriptionEn: z.string().trim().min(1, 'Required'),
  descriptionDe: z.string().trim().min(1, 'Required'),
  descriptionSq: z.string().trim().min(1, 'Required'),
  icon: z.string().trim().min(1, 'Required'),
  image: z.object({ url: z.string(), publicId: z.string().nullable() }).nullable(),
  // One benefit per line — converted to/from string[] at the API boundary.
  benefitsEn: z.string(),
  benefitsDe: z.string(),
  benefitsSq: z.string(),
  galleryImages: z.array(z.string()).default([]),
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
  icon: '',
  image: null,
  benefitsEn: '',
  benefitsDe: '',
  benefitsSq: '',
  galleryImages: [],
  isPublished: true,
  order: 0,
}

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function ServiceFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.get(id as string),
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
        icon: existing.icon,
        image: existing.image ? { url: existing.image, publicId: existing.imagePublicId } : null,
        benefitsEn: existing.benefitsEn.join('\n'),
        benefitsDe: existing.benefitsDe.join('\n'),
        benefitsSq: existing.benefitsSq.join('\n'),
        galleryImages: existing.galleryImages,
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
        icon: values.icon,
        image: values.image?.url ?? null,
        imagePublicId: values.image?.publicId ?? null,
        benefitsEn: linesToList(values.benefitsEn),
        benefitsDe: linesToList(values.benefitsDe),
        benefitsSq: linesToList(values.benefitsSq),
        galleryImages: values.galleryImages,
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? servicesApi.update(id as string, payload) : servicesApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success(isEdit ? 'Service updated' : 'Service created')
      navigate('/services')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading service" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Service' : 'New Service'} backTo="/services">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <LocalizedTextField label="Title" baseName="title" register={register} errors={errors} required />
        <LocalizedTextareaField label="Description" baseName="description" register={register} errors={errors} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Icon identifier"
            required
            registration={register('icon')}
            error={errors.icon?.message}
            placeholder="garden-design"
          />
          <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />
        </div>

        <ImageUploadField name="image" control={control} label="Hero Image" category="SERVICE" />

        <LocalizedTextareaField
          label="Benefits (one per line)"
          baseName="benefits"
          register={register}
          errors={errors}
          rows={4}
        />

        <MultiImageUploadField name="galleryImages" control={control} label="Additional Gallery Images" category="SERVICE" />

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/services" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
