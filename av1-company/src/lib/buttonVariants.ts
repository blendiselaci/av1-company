export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghostLight'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonBaseClass =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-av1-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 disabled:opacity-50'

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-av1-green text-av1-white shadow-sm shadow-av1-green/20 hover:bg-av1-green-dark hover:shadow-lg hover:shadow-av1-green/25',
  secondary: 'bg-av1-dark text-av1-white shadow-sm hover:bg-av1-dark/90 hover:shadow-lg hover:shadow-black/20',
  outline: 'border border-av1-green text-av1-green hover:bg-av1-green hover:text-av1-white hover:shadow-md hover:shadow-av1-green/15',
  ghostLight: 'border border-white/50 text-white hover:bg-white hover:text-av1-dark hover:shadow-md',
}

export const buttonSizeClass: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}
