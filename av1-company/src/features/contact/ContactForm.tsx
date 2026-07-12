import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { apiPost, ApiRequestError } from '@/lib/api'

interface ContactFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  message: string
  privacy: boolean
}

const INITIAL_VALUES: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  privacy: false,
}

type FormErrors = Partial<Record<keyof ContactFormValues, string>>

export interface ContactFormLabels {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  servicePlaceholder: string
  services: string[]
  message: string
  messagePlaceholder: string
  privacy: string
  submit: string
  submitting: string
  successTitle: string
  successMessage: string
  sendAnother: string
  errors: {
    required: string
    email: string
    privacy: string
    submit: string
  }
}

interface ContactFormProps {
  labels: ContactFormLabels
}

export function ContactForm({ labels }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!values.firstName.trim()) next.firstName = labels.errors.required
    if (!values.lastName.trim()) next.lastName = labels.errors.required
    if (!values.email.trim()) next.email = labels.errors.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = labels.errors.email
    if (!values.message.trim()) next.message = labels.errors.required
    if (!values.privacy) next.privacy = labels.errors.privacy
    return next
  }

  function handleChange<K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === 'submitting') return // guards against a double Enter/click firing two requests

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')
    setSubmitError(null)

    try {
      await apiPost('/contact-messages', {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        service: values.service || undefined,
        message: values.message.trim(),
      })
      setStatus('success')
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : labels.errors.submit
      setSubmitError(message)
      setStatus('error')
    }
  }

  function handleReset() {
    setValues(INITIAL_VALUES)
    setErrors({})
    setSubmitError(null)
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-av1-green/30 bg-av1-green/5 p-10 text-center backdrop-blur-md"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-av1-green text-white"
        >
          <CheckCircle2 size={32} aria-hidden="true" />
        </motion.span>
        <h3 className="text-xl font-semibold text-foreground">{labels.successTitle}</h3>
        <p className="max-w-sm text-sm text-foreground/70">{labels.successMessage}</p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-2 text-sm font-medium text-av1-green underline-offset-4 hover:underline"
        >
          {labels.sendAnother}
        </button>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label={labels.firstName} htmlFor="firstName" error={errors.firstName}>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            aria-required="true"
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            value={values.firstName}
            onChange={(event) => handleChange('firstName', event.target.value)}
            error={Boolean(errors.firstName)}
          />
        </FormField>

        <FormField label={labels.lastName} htmlFor="lastName" error={errors.lastName}>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            aria-required="true"
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            value={values.lastName}
            onChange={(event) => handleChange('lastName', event.target.value)}
            error={Boolean(errors.lastName)}
          />
        </FormField>

        <FormField label={labels.email} htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? 'email-error' : undefined}
            value={values.email}
            onChange={(event) => handleChange('email', event.target.value)}
            error={Boolean(errors.email)}
          />
        </FormField>

        <FormField label={labels.phone} htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
          />
        </FormField>

        <FormField label={labels.service} htmlFor="service" className="sm:col-span-2">
          <Select
            id="service"
            name="service"
            value={values.service}
            onChange={(event) => handleChange('service', event.target.value)}
          >
            <option value="">{labels.servicePlaceholder}</option>
            {labels.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={labels.message} htmlFor="message" error={errors.message} className="sm:col-span-2">
          <Textarea
            id="message"
            name="message"
            rows={5}
            placeholder={labels.messagePlaceholder}
            aria-required="true"
            aria-describedby={errors.message ? 'message-error' : undefined}
            value={values.message}
            onChange={(event) => handleChange('message', event.target.value)}
            error={Boolean(errors.message)}
          />
        </FormField>
      </div>

      <div className="mt-6">
        <Checkbox
          id="privacy"
          name="privacy"
          checked={values.privacy}
          error={Boolean(errors.privacy)}
          aria-required="true"
          aria-describedby={errors.privacy ? 'privacy-error' : undefined}
          onChange={(event) => handleChange('privacy', event.target.checked)}
        >
          {labels.privacy}
        </Checkbox>
        <AnimatePresence initial={false}>
          {errors.privacy && (
            <motion.p
              id="privacy-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 pl-8 text-xs font-medium text-red-500"
              role="alert"
            >
              {errors.privacy}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {status === 'error' && submitError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-600"
          >
            {submitError}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" size="lg" isLoading={status === 'submitting'} className="mt-8 w-full sm:w-auto">
        {status === 'submitting' ? labels.submitting : labels.submit}
      </Button>
    </form>
  )
}
