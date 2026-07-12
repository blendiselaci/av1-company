import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Input } from '../ui/Input'

const LOCALES: { suffix: 'En' | 'De' | 'Sq'; tag: string }[] = [
  { suffix: 'En', tag: 'EN' },
  { suffix: 'De', tag: 'DE' },
  { suffix: 'Sq', tag: 'SQ' },
]

interface LocalizedTextFieldProps<T extends FieldValues> {
  label: string
  baseName: string
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  required?: boolean
}

/** Every content resource carries the same En/De/Sq trio for most text fields
 *  (titleEn/titleDe/titleSq, ...) — one composite instead of hand-writing three
 *  near-identical TextFields per field, per resource. */
export function LocalizedTextField<T extends FieldValues>({
  label,
  baseName,
  register,
  errors,
  required,
}: LocalizedTextFieldProps<T>) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {LOCALES.map(({ suffix, tag }) => {
          const name = `${baseName}${suffix}` as Path<T>
          const error = errors[name]?.message as string | undefined
          return (
            <div key={suffix}>
              <label htmlFor={name} className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                {tag}
              </label>
              <Input id={name} invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...register(name)} />
              {error && (
                <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-danger">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
