import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { testimonialsApi } from '../../api/resources'
import { SelectField } from '../../components/form/SelectField'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { TextField } from '../../components/form/TextField'
import { ImageUploadField } from '../../components/media/ImageUploadField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const formSchema = z.object({
  clientName: z.string().trim().min(1, 'Required'),
  location: z.string().trim().min(1, 'Required'),
  projectType: z.string().trim().min(1, 'Required'),
  textEn: z.string().trim().min(1, 'Required'),
  textDe: z.string().trim().min(1, 'Required'),
  textSq: z.string().trim().min(1, 'Required'),
  rating: z.coerce.number().int().min(1).max(5),
  image: z.object({ url: z.string(), publicId: z.string().nullable() }).nullable(),
  date: z.string().trim().min(1, 'Required'),
  isPublished: z.boolean(),
  order: z.coerce.number().int(),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  clientName: '',
  location: '',
  projectType: '',
  textEn: '',
  textDe: '',
  textSq: '',
  rating: 5,
  image: null,
  date: '',
  isPublished: true,
  order: 0,
}

export default function TestimonialFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['testimonials', id],
    queryFn: () => testimonialsApi.get(id as string),
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
        clientName: existing.clientName,
        location: existing.location,
        projectType: existing.projectType,
        textEn: existing.textEn,
        textDe: existing.textDe,
        textSq: existing.textSq,
        rating: existing.rating,
        image: existing.image ? { url: existing.image, publicId: existing.imagePublicId } : null,
        date: existing.date,
        isPublished: existing.isPublished,
        order: existing.order,
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        clientName: values.clientName,
        location: values.location,
        projectType: values.projectType,
        textEn: values.textEn,
        textDe: values.textDe,
        textSq: values.textSq,
        rating: values.rating,
        image: values.image?.url ?? null,
        imagePublicId: values.image?.publicId ?? null,
        date: values.date,
        isPublished: values.isPublished,
        order: values.order,
      }
      return isEdit ? testimonialsApi.update(id as string, payload) : testimonialsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success(isEdit ? 'Testimonial updated' : 'Testimonial created')
      navigate('/testimonials')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading testimonial" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit Testimonial' : 'New Testimonial'} backTo="/testimonials">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Client Name" required registration={register('clientName')} error={errors.clientName?.message} />
          <TextField label="Location" required registration={register('location')} error={errors.location?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Project Type" required registration={register('projectType')} error={errors.projectType?.message} />
          <TextField label="Date" required registration={register('date')} error={errors.date?.message} placeholder="May 2024" />
        </div>

        <LocalizedTextareaField label="Testimonial Text" baseName="text" register={register} errors={errors} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Rating"
            required
            registration={register('rating')}
            error={errors.rating?.message}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? 's' : ''}` }))}
          />
          <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />
        </div>

        <ImageUploadField name="image" control={control} label="Avatar (optional)" category="TESTIMONIAL_AVATAR" />

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/testimonials" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
