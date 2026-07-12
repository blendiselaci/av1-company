import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'sq', label: 'SQ' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
] as const

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('header.chooseLanguage')}
      className={cn('flex items-center gap-1 text-xs font-semibold tracking-wide', className)}
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={i18n.resolvedLanguage === code}
          className={cn(
            'rounded-full px-2 py-1 transition-colors',
            i18n.resolvedLanguage === code ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
