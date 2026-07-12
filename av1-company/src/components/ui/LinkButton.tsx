import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  buttonBaseClass,
  buttonSizeClass,
  buttonVariantClass,
  type ButtonSize,
  type ButtonVariant,
} from '@/lib/buttonVariants'

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function LinkButton({ className, variant = 'primary', size = 'md', ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonBaseClass, buttonVariantClass[variant], buttonSizeClass[size], className)}
      {...props}
    />
  )
}
