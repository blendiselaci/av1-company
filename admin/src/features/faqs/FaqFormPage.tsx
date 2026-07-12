import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { faqsApi } from '../../api/resources'
import { SwitchField } from '../../components/form/SwitchField'
import { LocalizedTextField } from '../../components/form/LocalizedTextField'
import { LocalizedTextareaField } from '../../components/form/LocalizedTextareaField'
import { TextField } from '../../components/form/TextField'
import { FormPageLayout } from '../../components/shared/FormPageLayout'
import { FormActions } from '../../components/shared/FormActions'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const formSchema = z.object({
  questionEn: z.string().trim().min(1, 'Required'),
  questionDe: z.string().trim().min(1, 'Required'),
  questionSq: z.string().trim().min(1, 'Required'),
  answerEn: z.string().trim().min(1, 'Required'),
  answerDe: z.string().trim().min(1, 'Required'),
  answerSq: z.string().trim().min(1, 'Required'),
  isPublished: z.boolean(),
  order: z.coerce.number().int(),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  questionEn: '',
  questionDe: '',
  questionSq: '',
  answerEn: '',
  answerDe: '',
  answerSq: '',
  isPublished: true,
  order: 0,
}

export default function FaqFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id) && id !== 'new'
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['faqs', id],
    queryFn: () => faqsApi.get(id as string),
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
        questionEn: existing.questionEn,
        questionDe: existing.questionDe,
        questionSq: existing.questionSq,
        answerEn: existing.answerEn,
        answerDe: existing.answerDe,
        answerSq: existing.answerSq,
        isPublished: existing.isPublished,
        order: existing.order,
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => (isEdit ? faqsApi.update(id as string, values) : faqsApi.create(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
      toast.success(isEdit ? 'FAQ updated' : 'FAQ created')
      navigate('/faqs')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading FAQ" />
      </div>
    )
  }

  return (
    <FormPageLayout title={isEdit ? 'Edit FAQ' : 'New FAQ'} backTo="/faqs">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5">
        <LocalizedTextField label="Question" baseName="question" register={register} errors={errors} required />
        <LocalizedTextareaField label="Answer" baseName="answer" register={register} errors={errors} required rows={4} />

        <TextField label="Order" type="number" registration={register('order')} error={errors.order?.message} />

        <SwitchField name="isPublished" control={control} label="Published" />

        <FormActions backTo="/faqs" saving={isSubmitting || mutation.isPending} />
      </form>
    </FormPageLayout>
  )
}
