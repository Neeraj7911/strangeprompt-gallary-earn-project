import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import HomePage from './pages/Home'
import GalleryPage from './pages/Gallery'
import CollectionsPage from './pages/Collections'
import CommunityPage from './pages/Community'
import DashboardPage from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import AccountSettingsPage from './pages/AccountSettings'
import ProtectedRoute from './components/ProtectedRoute'
import Topbar from './components/Topbar'
import Footer from './components/Footer'
import GlobalModals from './components/GlobalModals'
import TermsPage from './pages/Terms'
import PrivacyPage from './pages/Privacy'
import CookiesPage from './pages/Cookies'
import DisclaimerPage from './pages/Disclaimer'
import EarnPage from './pages/Earn'
import CreatorHubPage from './pages/CreatorHub'
import AdminReportsPage from './pages/AdminReports'

function App() {
  useEffect(() => {
    function handleDragStart(event) {
      if (event.target instanceof HTMLImageElement) {
        event.preventDefault()
      }
    }

    function handleContextMenu(event) {
      const target = event.target instanceof HTMLElement ? event.target.closest('img') : null
      if (target) {
        event.preventDefault()
        toast.dismiss('image-protection')
        toast('Image protection is enabled.', {
          id: 'image-protection',
          icon: '⚠️',
        })
      }
    }

    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="relative min-h-screen overflow-x-hidden bg-[var(--surface-base)] text-[var(--text-base)] transition-colors duration-500">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute inset-x-[-35%] top-[-28%] h-[520px] rotate-[-8deg] rounded-[420px] bg-gradient-to-br from-[rgba(255,122,150,0.16)] via-[rgba(255,200,212,0.2)] to-transparent blur-[160px] dark:hidden" />
              <div className="absolute inset-x-[-25%] bottom-[-40%] h-[620px] rounded-[520px] bg-gradient-to-tr from-[rgba(255,182,200,0.4)] via-[rgba(229,9,20,0.14)] to-transparent blur-[220px] dark:from-[rgba(35,8,18,0.5)] dark:via-[rgba(229,9,20,0.1)] dark:opacity-60" />
              <div className="absolute left-1/2 top-32 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-[rgba(229,112,136,0.18)] bg-[radial-gradient(circle_at_50%_20%,rgba(255,124,152,0.24),transparent_70%)] blur-3xl dark:hidden" />
              <div className="absolute inset-0 dark:hidden">
                <div className="absolute left-1/2 top-[18rem] h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 opacity-[calc(0.2+var(--scroll-progress)*0.4)] blur-[2px] transition-opacity duration-500" style={{ backgroundImage: "url('/aura-signal.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', filter: 'hue-rotate(-12deg) saturate(0.8)' }} />
                <div className="absolute bottom-[-18rem] right-[-12rem] h-[34rem] w-[34rem] opacity-[calc(0.1+var(--scroll-progress)*0.3)]" style={{ backgroundImage: "url('/aura-signal.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', filter: 'blur(4px) hue-rotate(-12deg) saturate(0.7)' }} />
              </div>
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
              <Topbar />
              <main className="page-padding w-full flex-1 pb-6 pt-28 min-h-[calc(100vh-260px)]">
                <div className="flex w-full flex-1 flex-col gap-14">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/earn" element={<EarnPage />} />
                    <Route path="/creator" element={<CreatorHubPage />} />
                    <Route path="/legal/terms" element={<TermsPage />} />
                    <Route path="/legal/privacy" element={<PrivacyPage />} />
                    <Route path="/legal/cookies" element={<CookiesPage />} />
                    <Route path="/legal/disclaimer" element={<DisclaimerPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/admin/reports" element={<AdminReportsPage />} />
                      <Route path="/profile/settings" element={<AccountSettingsPage />} />
                    </Route>
                    <Route path="/profile/:slug" element={<ProfilePage />} />
                    <Route
                      path="*"
                      element={
                        <div className="veil-border mx-auto max-w-xl p-12 text-center text-[var(--text-muted)] shadow-[0_40px_110px_-60px_rgba(229,9,20,0.68)]">
                          Page not found.
                        </div>
                      }
                    />
                  </Routes>
                </div>
              </main>
              <Footer />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--surface-card)',
                    color: 'var(--text-base)',
                    border: '1px solid var(--surface-border)',
                    boxShadow: '0 22px 60px -40px rgba(229, 9, 20, 0.45)',
                    backdropFilter: 'blur(12px)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#e50914',
                      secondary: 'var(--surface-base)',
                    },
                  },
                }}
              />
            </div>
          </div>
          <GlobalModals />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  )
}

export default App

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
