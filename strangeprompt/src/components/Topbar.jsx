import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import DarkModeToggle from './DarkModeToggle'
import NotificationsPanel from './NotificationsPanel'
import { subscribeToNotifications, fetchNotificationsPage, markNotificationsRead } from '../firebase/firestore'

export default function Topbar() {
  const { isAuthenticated, signOut, user, profile } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsList, setNotificationsList] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState(null)
  const { openAuthModal } = useUI()
  const navigate = useNavigate()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const location = useLocation()
  const navItems = [
    { label: 'Discover', to: '/', end: true },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Collections', to: '/collections' },
    { label: 'Community', to: '/community' },
    { label: 'Earn', to: '/earn' },
  ]

  const profileLink = profile?.username ? `/profile/${profile.username}` : user ? `/profile/${user.uid}` : '/profile'
  const settingsLink = '/profile/settings'
  const profileMenuRef = useRef(null)
  const firstMenuItemRef = useRef(null)

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const next = max > 0 ? (window.scrollY / max) * 100 : 0
      const clamped = Math.min(Math.max(next, 0), 100)
      setScrollProgress(clamped)
      if (doc) {
        doc.style.setProperty('--scroll-progress', (clamped / 100).toFixed(4))
      }
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateProgress)
      document.documentElement?.style.setProperty('--scroll-progress', '0')
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!profileMenuOpen) return undefined

    const handleGlobalInteraction = (event) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleGlobalInteraction)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleGlobalInteraction)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [profileMenuOpen])

  useEffect(() => {
    if (profileMenuOpen && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus()
    }
  }, [profileMenuOpen])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return undefined
    }
    const unsub = subscribeToNotifications(user.uid, (snapshot) => {
      const unread = snapshot.docs.filter((d) => !d.data()?.read).length
      setUnreadCount(unread)
    })
    return () => unsub && unsub()
  }, [user])

  const loadNotifications = async () => {
    if (!user) return
    setNotificationsLoading(true)
    setNotificationsError(null)
    try {
      const { items } = await fetchNotificationsPage({ userId: user.uid, limitTo: 8 })
      setNotificationsList(items)
    } catch (err) {
      console.error('loadNotifications', err)
      setNotificationsError('Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const brandPulse = useMemo(() => {
    if (!isAuthenticated) return ''
    if (!profile) {
      return 'Loading profile...'
    }
    if (!profile.username) {
      return 'Complete your profile'
    }
    return `@${profile.username}`
  }, [isAuthenticated, profile])

  return (
    <header
      className="relative isolate overflow-visible border-b border-[var(--surface-border)] bg-[var(--surface-topbar)] shadow-[0_22px_60px_-40px_rgba(229,9,20,0.45)] backdrop-blur-2xl transition duration-300 dark:border-transparent dark:bg-[#03010a] dark:shadow-none dark:backdrop-blur-none"
      style={{ backgroundColor: 'var(--surface-topbar)' }}
    >
      <div className="page-padding flex w-full items-center gap-4 py-4">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group relative flex items-center gap-3 text-lg font-semibold text-[var(--text-base)] transition duration-300 hover:text-[var(--accent)] dark:hover:text-[rgba(255,236,240,0.95)]"
            >
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(10,4,14,0.95)] via-[rgba(229,9,20,0.9)] to-[rgba(112,8,28,0.92)] text-base font-bold tracking-tight text-white shadow-[0_28px_70px_-30px_rgba(229,9,20,0.75)] transition duration-300 group-hover:scale-[1.06]">
                SP
              </span>
              <span className="hidden sm:inline-flex items-center gap-2">
                StrangePrompt
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(229,9,20,0.16)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,126,140,0.8)] shadow-[0_18px_44px_-32px_rgba(229,9,20,0.6)]">
                  Prime
                </span>
              </span>
            </button>
          </div>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-2 py-1 text-xs uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_26px_60px_-38px_rgba(229,9,20,0.35)] backdrop-blur-xl transition duration-300 dark:border-[rgba(255,126,140,0.28)] dark:bg-transparent dark:text-[rgba(255,210,220,0.82)] dark:shadow-none dark:backdrop-blur-none">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold transition duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.85)] to-[rgba(121,5,13,0.8)] text-white shadow-[0_22px_52px_-26px_rgba(229,9,20,0.75)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[rgba(229,9,20,0.12)] dark:text-[rgba(255,210,220,0.78)] dark:hover:text-[rgba(255,255,255,0.92)] dark:hover:bg-[rgba(229,9,20,0.22)]'
                    }`
                  }
                >
                  <span className="h-1 w-1 rounded-full bg-[rgba(229,9,20,0.65)] dark:bg-[rgba(229,9,20,0.8)]" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              {/* Dashboard moved into profile dropdown */}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isAuthenticated && (
              <div className="hidden md:flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-36px_rgba(229,9,20,0.35)] dark:border-[rgba(255,126,140,0.24)] dark:bg-transparent dark:text-[rgba(255,212,220,0.85)] dark:shadow-none">
                <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-[rgba(229,9,20,0.65)] dark:bg-[rgba(229,9,20,0.85)]" aria-hidden="true" />
                {brandPulse}
              </div>
            )}
            <DarkModeToggle />
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={async () => {
                    const next = !notificationsOpen
                    setNotificationsOpen(next)
                    if (next) {
                      // open: load list and mark unread as read
                      loadNotifications()
                      try {
                        await markNotificationsRead(user.uid)
                        setUnreadCount(0)
                      } catch (err) {
                        console.error('markNotificationsRead failed', err)
                      }
                    }
                  }}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-base)] shadow-[0_22px_52px_-28px_rgba(229,9,20,0.4)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && !notificationsOpen && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">{unreadCount}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-11 z-[1000] w-80 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 text-sm text-[var(--text-base)] shadow-[0_28px_70px_-40px_rgba(229,9,20,0.65)]">
                    <NotificationsPanel
                      notifications={notificationsList}
                      loading={notificationsLoading}
                      error={notificationsError}
                      onNext={() => {}}
                      onPrevious={() => {}}
                      hasMore={false}
                      hasPrevious={false}
                    />
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('signup')
                  return
                }
                navigate('/creator')
              }}
              className="hidden rounded-full border border-[var(--surface-border-strong)] bg-[var(--surface-card-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-base)] shadow-[0_24px_58px_-36px_rgba(229,9,20,0.35)] transition duration-300 hover:border-[var(--surface-border)] hover:text-[var(--accent)] dark:border-[rgba(255,126,140,0.26)] dark:bg-transparent dark:text-[rgba(255,212,220,0.88)] dark:shadow-none dark:hover:text-[rgba(255,255,255,0.92)] lg:inline-flex"
            >
              Creator hub
            </button>
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/dashboard')
                  return
                }
                openAuthModal('signup')
              }}
              className="hidden rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.88)] to-[rgba(121,5,13,0.82)] px-5 py-2 text-sm font-semibold text-white shadow-[0_28px_64px_-30px_rgba(229,9,20,0.78)] transition duration-300 hover:brightness-110 md:inline-flex"
            >
              Start creating
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition duration-300 hover:text-[var(--accent)] hover:bg-[rgba(229,9,20,0.12)] dark:border-[rgba(255,126,140,0.18)] dark:bg-transparent dark:text-[rgba(255,210,220,0.85)] dark:hover:text-[rgba(255,255,255,0.92)] dark:hover:bg-[rgba(229,9,20,0.22)] md:inline-flex"
              >
                Sign in
              </button>
            )}
            {isAuthenticated && (
              <div ref={profileMenuRef} className="relative hidden md:flex">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(229,9,20,0.9)] via-[rgba(197,8,17,0.85)] to-[rgba(121,5,13,0.82)] text-sm font-semibold text-white shadow-[0_24px_60px_-32px_rgba(229,9,20,0.65)] transition duration-300 hover:scale-[1.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {(user.displayName || 'C')[0]}
                </button>
                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 z-[1000] w-48 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-2 text-sm text-[var(--text-base)] shadow-[0_28px_70px_-40px_rgba(229,9,20,0.65)]"
                  >
                    <button
                      ref={firstMenuItemRef}
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate(profileLink)
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)] transition duration-200 hover:bg-[rgba(229,9,20,0.12)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70"
                    >
                      Profile
                      <span aria-hidden="true">•</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/dashboard')
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)] transition duration-200 hover:bg-[rgba(229,9,20,0.12)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70"
                    >
                      Dashboard
                      <span aria-hidden="true">•</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate(settingsLink)
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)] transition duration-200 hover:bg-[rgba(229,9,20,0.12)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70"
                    >
                      Settings
                      <span aria-hidden="true">*</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await signOut()
                        } catch (error) {
                          console.error(error)
                        } finally {
                          setProfileMenuOpen(false)
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)] transition duration-200 hover:bg-[rgba(229,9,20,0.12)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70"
                    >
                      Sign out
                      <span aria-hidden="true">x</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-base)] shadow-[0_22px_52px_-28px_rgba(229,9,20,0.4)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)] md:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="page-padding pb-4 md:hidden">
            <div className="space-y-4 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)]/90 p-4 shadow-[0_28px_80px_-48px_rgba(229,9,20,0.52)] backdrop-blur-xl">
              <nav className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-2xl px-4 py-3 transition duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.88)] to-[rgba(121,5,13,0.8)] text-white shadow-[0_24px_64px_-34px_rgba(229,9,20,0.75)]'
                          : 'border border-[var(--surface-border)] bg-[var(--surface-card-strong)] text-[var(--text-muted)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)]'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </NavLink>
                ))}
              </nav>
              <div className="grid gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/dashboard')
                    } else {
                      openAuthModal('signup')
                    }
                    setMobileOpen(false)
                  }}
                  className="rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.88)] to-[rgba(121,5,13,0.82)] px-5 py-3 text-white shadow-[0_24px_64px_-30px_rgba(229,9,20,0.78)] transition duration-300 hover:brightness-110"
                >
                  Start creating
                </button>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut()
                      } catch (error) {
                        console.error(error)
                      }
                      setMobileOpen(false)
                    }}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-3 text-[var(--text-base)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal('login')
                      setMobileOpen(false)
                    }}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-3 text-[var(--text-base)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                  >
                    Sign in
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(profileLink)
                      setMobileOpen(false)
                    }}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-3 text-[var(--text-base)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                  >
                    View profile
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(settingsLink)
                      setMobileOpen(false)
                    }}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-3 text-[var(--text-base)] transition duration-300 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                  >
                    Account settings
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-[rgba(229,9,20,0.12)]">
          <span
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[rgba(229,9,20,0.9)] via-[rgba(255,126,140,0.95)] to-transparent"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />
        </div>
    </header>
  )
}
