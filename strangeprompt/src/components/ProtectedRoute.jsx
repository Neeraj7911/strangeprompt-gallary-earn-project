import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const { openAuthModal } = useUI()
  const location = useLocation()

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      openAuthModal('signup')
    }
  }, [initializing, isAuthenticated, openAuthModal])

  if (initializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Initializing…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}
