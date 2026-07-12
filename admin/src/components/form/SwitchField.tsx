import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Switch } from '../ui/Switch'

interface SwitchFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
}

export function SwitchField<T extends FieldValues>({ name, control, label }: SwitchFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switch checked={Boolean(field.value)} onChange={field.onChange} label={label} />
      )}
    />
  )
}
