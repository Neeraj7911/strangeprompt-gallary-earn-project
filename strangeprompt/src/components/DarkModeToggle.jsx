import { useEffect, useState } from 'react'

const STORAGE_KEY = 'strangeprompt-theme'

function getStoredTheme() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveInitialTheme() {
  const stored = getStoredTheme()
  if (stored === 'system') return getSystemPrefersDark() ? 'dark' : 'light'
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  return 'dark'
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState(resolveInitialTheme)
  const [followSystem, setFollowSystem] = useState(() => getStoredTheme() === 'system')

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const root = document.documentElement
    const enableDark = theme === 'dark'

    root.classList.toggle('dark', enableDark)
    root.style.colorScheme = enableDark ? 'dark' : 'light'

    window.localStorage.setItem(STORAGE_KEY, followSystem ? 'system' : theme)

    return undefined
  }, [theme, followSystem])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => {
      if (followSystem) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [followSystem])

  const handleToggle = (event) => {
    if (event.altKey) {
      setFollowSystem(true)
      setTheme(getSystemPrefersDark() ? 'dark' : 'light')
      return
    }

    setFollowSystem(false)
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="Click to toggle, Alt-click to follow system"
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 focus:ring-offset-transparent ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-black via-brand-900 to-black text-brand-50 shadow-[0_18px_48px_-26px_rgba(229,9,20,0.68)]'
          : 'bg-gradient-to-r from-brand-500/15 via-brand-200/15 to-brand-500/15 text-brand-400 shadow-[0_16px_42px_-24px_rgba(229,9,20,0.45)] hover:text-brand-500 hover:bg-brand-500/20'
      }`}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0zm0 15a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0zm8-8a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1zM4 12a1 1 0 0 1-1 1H2a1 1 0 0 1 0-2h1a1 1 0 0 1 1 1zm13.66-6.95a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM6.34 17.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM17.66 17.66a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM6.34 6.34a1 1 0 0 1 0-1.41l.71-.71a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      )}
      <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
