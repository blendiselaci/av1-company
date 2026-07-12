import { useEffect, useState } from 'react'

const STORAGE_KEY = 'av1-admin-theme'

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Applied once, synchronously, before React mounts (see main.tsx) — so the
 *  correct theme is present on the very first paint even on routes that never
 *  render the Topbar (e.g. /login), instead of only taking effect once a
 *  component happens to call useDarkMode(). */
export function applyInitialTheme(): void {
  document.documentElement.classList.toggle('dark', getInitialTheme())
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, toggle: () => setIsDark((prev) => !prev) }
}
