import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../utils/constants'

export default function CategoryTabs({ active = 'Explore', onSelect, categories = CATEGORIES }) {
  const [offset, setOffset] = useState(128)
  const [isDocked, setIsDocked] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const updateOffset = () => {
      const topbar = document.getElementById('site-topbar')
      const measured = topbar?.getBoundingClientRect().height ?? 0
      const safeHeight = measured > 0 ? measured : 88
      const nextOffset = Math.round(safeHeight + 28)
      setOffset((current) => (current === nextOffset ? current : nextOffset))
    }

    updateOffset()
    const topbar = document.getElementById('site-topbar')
    let resizeObserver
    if (typeof ResizeObserver !== 'undefined' && topbar) {
      resizeObserver = new ResizeObserver(updateOffset)
      resizeObserver.observe(topbar)
    }
    window.addEventListener('resize', updateOffset)
    return () => {
      window.removeEventListener('resize', updateOffset)
      resizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleScroll = () => {
      const sentinel = sentinelRef.current
      if (!sentinel) return
      const rect = sentinel.getBoundingClientRect()
      const docked = rect.top <= offset + 0.5
      setIsDocked((current) => (current === docked ? current : docked))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [offset])

  const stickyStyle = { top: `${offset}px` }

  return (
    <>
      <span ref={sentinelRef} className="pointer-events-none block h-0 w-full" aria-hidden="true" />
      <div
        className={`${
          isDocked
            ? 'sticky z-50 px-4 sm:px-8 lg:px-10'
            : 'sticky z-40 px-2 sm:px-0'
        } transition-all duration-500`}
        style={stickyStyle}
      >
        <div
          className={`relative mx-auto w-full max-w-6xl transition-all duration-500 origin-top ${
            isDocked ? 'scale-[1.012]' : 'scale-100'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.18),transparent_70%)] blur-3xl transition-opacity duration-500 ${isDocked ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden="true"
          />
          <span
            className={`pointer-events-none absolute inset-y-2 left-2 w-8 rounded-full bg-gradient-to-r from-[var(--surface-card)] via-[var(--surface-card)]/70 to-transparent transition-opacity duration-500 sm:hidden ${isDocked ? 'opacity-0' : 'opacity-90'}`}
            aria-hidden="true"
          />
          <span
            className={`pointer-events-none absolute inset-y-2 right-2 w-8 rounded-full bg-gradient-to-l from-[var(--surface-card)] via-[var(--surface-card)]/70 to-transparent transition-opacity duration-500 sm:hidden ${isDocked ? 'opacity-0' : 'opacity-90'}`}
            aria-hidden="true"
          />
          <nav
            className={`no-scrollbar flex items-center gap-2 overflow-x-auto overflow-y-hidden text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] transition-all duration-500 origin-top sm:text-xs sm:tracking-[0.3em] dark:text-[rgba(255,210,220,0.82)] ${
              isDocked
                ? 'w-full rounded-[28px] border border-[var(--surface-border-strong)] bg-[var(--surface-topbar)] px-5 py-3 shadow-[0_26px_70px_-36px_rgba(229,9,20,0.45)] backdrop-blur-3xl sm:justify-between dark:border-[rgba(255,126,140,0.26)] dark:bg-[rgba(6,3,12,0.95)] dark:shadow-[0_36px_90px_-48px_rgba(0,0,0,0.78)]'
                : 'rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-2 shadow-[0_32px_90px_-40px_rgba(229,9,20,0.32)] backdrop-blur-2xl sm:flex-wrap sm:justify-center sm:gap-3 sm:px-4 dark:border-[rgba(255,126,140,0.24)] dark:bg-[rgba(10,6,16,0.82)] dark:shadow-[0_32px_90px_-40px_rgba(229,9,20,0.72)]'
            }`}
          >
            {categories.map((category) => {
              const isActive = active === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelect && onSelect(category)}
                  className={`relative inline-flex shrink-0 items-center overflow-hidden rounded-full px-4 py-2 text-[10px] font-semibold transition duration-300 sm:px-5 sm:text-[11px] ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(229,9,20,0.98)] via-[rgba(197,8,17,0.92)] to-[rgba(121,5,13,0.88)] text-white shadow-[0_24px_60px_-32px_rgba(229,9,20,0.85)]'
                      : 'border border-[var(--surface-border)] bg-[var(--surface-card-strong)] text-[var(--text-muted)] hover:border-[rgba(229,9,20,0.32)] hover:text-[var(--accent)] dark:border-[rgba(255,126,140,0.18)] dark:bg-[rgba(12,6,18,0.78)] dark:text-[rgba(255,212,220,0.82)] dark:hover:border-[rgba(255,126,140,0.3)] dark:hover:text-[rgba(255,255,255,0.9)]'
                  }`}
                >
                  <span className="relative z-10">{category}</span>
                  {isActive && (
                    <span className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite] bg-white/10" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
