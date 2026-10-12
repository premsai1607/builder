import { useEffect } from 'react'
import { useUi } from '@/stores/ui'

function resolvedDark(theme: 'light' | 'dark' | 'system') {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeSync() {
  const theme = useUi((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark = resolvedDark(theme)
      root.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name="theme-color"]')
      meta?.setAttribute('content', dark ? '#0F1115' : '#F5F7FA')
    }
    apply()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return null
}
