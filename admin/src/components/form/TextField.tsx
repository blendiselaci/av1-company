import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '../ui/Input'

interface TextFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  autoComplete?: string
}

export function TextField({ label, registration, error, required, type = 'text', placeholder, autoComplete }: TextFieldProps) {
  const id = registration.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
