import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as settingsApi from '../../api/settings'
import { TextField } from '../../components/form/TextField'
import { PageHeader } from '../../components/shared/PageHeader'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'

const formSchema = z.object({
  companyName: z.string().trim().min(1, 'Required'),
  phone: z.string().trim().min(1, 'Required'),
  email: z.string().trim().email('Enter a valid email address'),
  address: z.string().trim().min(1, 'Required'),
  workingHours: z.string().trim().min(1, 'Required'),
  facebookUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  instagramUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  mapsUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

export default function SettingsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.getSettings })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  useEffect(() => {
    if (data) {
      reset({
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        facebookUrl: data.facebookUrl ?? '',
        instagramUrl: data.instagramUrl ?? '',
        mapsUrl: data.mapsUrl ?? '',
      })
    }
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => settingsApi.updateSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved')
    },
    onError: (error) => toast.error('Save failed', extractErrorMessage(error)),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" label="Loading settings" />
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState description="Couldn't load site settings." onRetry={refetch} />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="Website Settings" description="Business info shown across the public site (footer, contact section, structured data)." />

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-5 rounded-xl border border-border bg-surface p-5">
        <TextField label="Company Name" required registration={register('companyName')} error={errors.companyName?.message} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Phone" required registration={register('phone')} error={errors.phone?.message} />
          <TextField label="Email" type="email" required registration={register('email')} error={errors.email?.message} />
        </div>

        <TextField label="Address" required registration={register('address')} error={errors.address?.message} />
        <TextField label="Working Hours" required registration={register('workingHours')} error={errors.workingHours?.message} placeholder="Mon – Sat: 08:00 – 18:00" />

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Facebook URL" registration={register('facebookUrl')} error={errors.facebookUrl?.message} />
          <TextField label="Instagram URL" registration={register('instagramUrl')} error={errors.instagramUrl?.message} />
          <TextField label="Google Maps URL" registration={register('mapsUrl')} error={errors.mapsUrl?.message} />
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
