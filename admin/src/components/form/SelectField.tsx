import type { UseFormRegisterReturn } from 'react-hook-form'
import { Select } from '../ui/Select'

interface SelectFieldProps {
  label: string
  registration: UseFormRegisterReturn
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  placeholder?: string
}

export function SelectField({ label, registration, options, error, required, placeholder }: SelectFieldProps) {
  const id = registration.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <Select id={id} invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
