import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { recordRedirectForImage } from '../firebase/firestore'
import { useAuth } from './AuthContext'

const DEFAULT_AD_URL = 'https://affiliate.example.com/redirect?s=strangeprompt'

// In-memory per-post redirect counts (resets on full page reload).
if (typeof window !== 'undefined' && !window.__sp_postCounts) {
  window.__sp_postCounts = {}
  window.__sp_openCount = 0
  window.__sp_clientNavigated = false
}

const UIContext = createContext({})

export function UIProvider({ children }) {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' })
  const [imageModal, setImageModal] = useState({ isOpen: false, image: null })
  const [adRedirect, setAdRedirect] = useState({
    isOpen: false,
    actionLabel: '',
    redirectUrl: DEFAULT_AD_URL,
    duration: 5000,
    onComplete: null,
  })

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModal({ isOpen: true, mode })
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal((state) => ({ ...state, isOpen: false }))
  }, [])

  const openImageDetail = useCallback((image) => {
    setImageModal({ isOpen: true, image })
    try {
      if (typeof window !== 'undefined') {
        window.__sp_openCount = (window.__sp_openCount || 0) + 1
        if (window.__sp_openCount > 1) window.__sp_clientNavigated = true
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const closeImageDetail = useCallback(() => {
    setImageModal({ isOpen: false, image: null })
  }, [])

  const triggerAdRedirect = useCallback(
    ({ actionLabel, onComplete, redirectUrl = DEFAULT_AD_URL, duration = 5000, postId = null }) => {
      // Always open the ad URL synchronously in the click handler to avoid popup blockers.
      try {
        if (typeof window !== 'undefined' && redirectUrl) {
          try {
            window.open(redirectUrl, '_blank', 'noopener,noreferrer')
            window.__sp_adOpened = true
          } catch (e) {
            // ignore popup open errors; modal will still show
          }
        }
      } catch (e) {
        // ignore
      }

      setAdRedirect({
        isOpen: true,
        actionLabel,
        redirectUrl,
        duration,
        onComplete,
        postId,
      })
    },
    [],
  )

  const clearAdRedirect = useCallback(() => {
    setAdRedirect((state) => ({ ...state, isOpen: false, onComplete: null }))
  }, [])

  const { isAuthenticated, user } = useAuth()

  const completeAdRedirect = useCallback(() => {
    let capturedOnComplete = null
    let capturedPostId = null

    setAdRedirect((state) => {
      capturedOnComplete = state.onComplete
      capturedPostId = state.postId || null
      return { ...state, isOpen: false, onComplete: null, postId: null }
    })

    try {
      const key = 'sp_ad_redirects'
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(key)
        const count = raw ? parseInt(raw, 10) || 0 : 0
        window.localStorage.setItem(key, String(count + 1))
      }

      if (capturedPostId && typeof window !== 'undefined') {
        window.__sp_postCounts = window.__sp_postCounts || {}
        window.__sp_postCounts[capturedPostId] = (window.__sp_postCounts[capturedPostId] || 0) + 1
      }
    } catch (err) {
      // ignore storage errors
    }

    if (typeof capturedOnComplete === 'function') {
      try {
        capturedOnComplete()
      } catch (e) {
        console.error('onComplete callback failed', e)
      }
    }

    if (capturedPostId) {
      try {
        // pass viewer ID when available so earnings can be audited
        recordRedirectForImage(capturedPostId, user?.uid).catch((e) => console.error('credit redirect failed', e))
      } catch (e) {
        console.error('recordRedirectForImage error', e)
      }
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      authModal,
      imageModal,
      adRedirect,
      openAuthModal,
      closeAuthModal,
      openImageDetail,
      closeImageDetail,
      triggerAdRedirect,
      clearAdRedirect,
      completeAdRedirect,
    }),
    [adRedirect, authModal, clearAdRedirect, closeAuthModal, closeImageDetail, imageModal, openAuthModal, openImageDetail, triggerAdRedirect],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  return useContext(UIContext)
}
