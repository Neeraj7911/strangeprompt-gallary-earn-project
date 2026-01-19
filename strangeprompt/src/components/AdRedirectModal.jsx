import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const modalRoot = typeof document !== 'undefined' ? document.body : null

export default function AdRedirectModal({ isOpen, actionLabel, redirectUrl, duration, onClose, onCompleted }) {
  const [remaining, setRemaining] = useState(duration)
  const adWindowOpened = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    setRemaining(duration)
    adWindowOpened.current = false
  }, [duration, isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(interval)
          if (onCompleted) onCompleted()
          if (onClose) onClose()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, onClose, onCompleted])

  useEffect(() => {
    if (!isOpen) return
    if (adWindowOpened.current) return
    // If the window was already opened synchronously (to avoid popup blockers), skip opening again
    try {
      if (typeof window !== 'undefined' && window.__sp_adOpened) {
        adWindowOpened.current = true
        try {
          delete window.__sp_adOpened
        } catch (e) {
          window.__sp_adOpened = false
        }
        return
      }
    } catch (e) {
      // ignore
    }

    if (isOpen && redirectUrl && !adWindowOpened.current) {
      adWindowOpened.current = true
      window.open(redirectUrl, '_blank', 'noopener,noreferrer')
    }
  }, [isOpen, redirectUrl])

  if (!isOpen || !modalRoot) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl bg-[#140d15]/90 p-6 text-center text-brand-200/80 shadow-[0_38px_110px_-60px_rgba(229,9,20,0.7)]">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-300/80">Sponsor redirect</p>
        <h3 className="mt-3 text-lg font-semibold text-brand-50">
          Supporting the community keeps StrangePrompt free
        </h3>
        <p className="mt-4 text-sm text-brand-200/70">
          We are sending you to a sponsor page before we {actionLabel}. The page opens in a new tab.
        </p>
        <p className="mt-6 text-3xl font-bold text-brand-50">{Math.ceil(remaining / 1000)}s</p>
        <button
          type="button"
          onClick={() => {
            if (onCompleted) onCompleted()
            if (onClose) onClose()
          }}
          className="mt-6 w-full rounded-full bg-brand-500/15 py-2 text-sm font-semibold text-brand-50 transition hover:bg-brand-500/25"
        >
          Already visited the page
        </button>
      </div>
    </div>,
    modalRoot,
  )
}
