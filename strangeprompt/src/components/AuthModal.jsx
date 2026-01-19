import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const modalRoot = typeof document !== 'undefined' ? document.body : null

export default function AuthModal({ isOpen, mode, onClose, onSwitchMode }) {
  const { signIn, signUp, signInGoogle } = useAuth()
  const [formState, setFormState] = useState({ email: '', password: '', displayName: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormState({ email: '', password: '', displayName: '' })
    }
  }, [isOpen])

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen || !modalRoot) return null

  const isSignUp = mode === 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (!formState.displayName.trim()) {
          toast.error('Display name is required')
          setLoading(false)
          return
        }
        await signUp({
          email: formState.email,
          password: formState.password,
          displayName: formState.displayName,
        })
      } else {
        await signIn({ email: formState.email, password: formState.password })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInGoogle()
      onClose()
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#140d15]/90 p-8 text-brand-200/85 shadow-[0_48px_140px_-70px_rgba(229,9,20,0.78)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-brand-200/60 transition hover:text-brand-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <header className="mb-6 space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-brand-50">
            {isSignUp ? 'Join StrangePrompt' : 'Welcome back'}
          </h2>
          <p className="text-sm text-brand-200/70">
            {isSignUp
              ? 'Upload your AI prompts and connect with a creative community.'
              : 'Access your dashboard and engage with the community.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={formState.displayName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, displayName: event.target.value }))
                }
                className="w-full rounded-full bg-[#1a111d]/85 px-4 py-2 text-sm text-brand-50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-full bg-[#1a111d]/85 px-4 py-2 text-sm text-brand-50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              className="w-full rounded-full bg-[#1a111d]/85 px-4 py-2 text-sm text-brand-50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 py-2 text-sm font-semibold text-white shadow-[0_26px_70px_-32px_rgba(229,9,20,0.72)] transition hover:from-brand-400 hover:via-brand-500 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-brand-200/60">
          <span className="h-px flex-1 bg-brand-900/40" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-brand-900/40" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-brand-50 transition hover:bg-black/60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M21.35 11.1h-8.9v2.96h5.14c-.22 1.26-.9 2.33-1.93 3.05v2.54h3.12c1.83-1.69 2.87-4.19 2.87-7.07 0-.68-.06-1.35-.2-1.98z"
              fill="#4285f4"
            />
            <path
              d="M12.45 22c2.61 0 4.8-.86 6.39-2.35l-3.12-2.54c-.86.58-1.96.92-3.27.92-2.51 0-4.63-1.69-5.39-3.96H3.78v2.5C5.36 19.98 8.66 22 12.45 22z"
              fill="#34a853"
            />
            <path
              d="M7.06 14.07c-.2-.58-.32-1.2-.32-1.83s.12-1.25.32-1.83V7.91H3.78A9.56 9.56 0 0 0 3 12.24c0 1.53.36 2.98.78 4.33z"
              fill="#fbbc05"
            />
            <path
              d="M12.45 6.4c1.42 0 2.7.49 3.71 1.45l2.77-2.77C17.24 3.14 15.06 2.3 12.45 2.3 8.66 2.3 5.36 4.32 3.78 7.5l3.28 2.5c.76-2.26 2.88-3.96 5.39-3.96z"
              fill="#ea4335"
            />
          </svg>
          Google
        </button>

        <p className="mt-6 text-center text-xs text-brand-200/70">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => onSwitchMode(isSignUp ? 'login' : 'signup')}
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <p className="mt-4 text-center text-[10px] text-brand-200/60">
          By continuing you agree to our community guidelines and content policies.
        </p>
      </div>
    </div>,
    modalRoot,
  )
}
