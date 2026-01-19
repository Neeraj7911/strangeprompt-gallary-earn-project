import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { formatDate, formatNumber } from '../utils/format'
import { deriveSlugFromTitle, normalizeSlug } from '../utils/slug'

const modalRoot = typeof document !== 'undefined' ? document.body : null

export default function ImageDetailModal({
  image,
  onClose,
  onLike,
  onCopy,
  onReport,
  relatedImages = [],
  onOpenRelated,
  onShare,
}) {
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!modalRoot || !image) return null

  const baseSlugSource = image.title || image.prompt || image.id
  const shareSlug = image.shareSlug ? normalizeSlug(image.shareSlug) : deriveSlugFromTitle(baseSlugSource)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/image/${shareSlug}` : ''
  const creatorProfileUrl = image.creatorUsername ? `/profile/${image.creatorUsername}` : `/profile/${image.creatorId}`

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-backdrop)] p-4 text-[var(--text-base)] backdrop-blur-xl transition-colors duration-500 sm:p-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(12,8,20,0.9),rgba(4,2,12,0.96))] opacity-90 mix-blend-normal" />
        <div className="absolute left-1/2 top-[18%] h-[32rem] w-[32rem] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(80,20,46,0.28),transparent_72%)] opacity-70 blur-[8px]" />
      </div>

      <div className="relative flex h-full w-full max-w-[1200px] flex-col overflow-hidden rounded-[40px] border border-[var(--surface-border-strong)] bg-[var(--surface-modal)] shadow-[0_80px_220px_-120px_rgba(229,9,20,0.55)] backdrop-blur-[26px] transition-colors duration-500 dark:border-[rgba(255,120,140,0.26)] dark:bg-[var(--surface-modal)] dark:shadow-[0_70px_200px_-120px_rgba(0,0,0,0.78)] md:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-modal-contrast)] text-[var(--text-muted)] transition duration-300 hover:border-[rgba(229,9,20,0.32)] hover:text-[rgba(229,9,20,0.86)] dark:border-[rgba(255,140,160,0.32)] dark:text-[rgba(255,230,236,0.9)] dark:hover:border-[rgba(255,140,160,0.5)] dark:hover:text-white"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative flex-1 min-h-[320px] overflow-hidden bg-[linear-gradient(160deg,rgba(16,10,26,0.94),rgba(8,5,18,0.98))] p-6 sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(120,30,58,0.24),transparent_78%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-8 bottom-10 h-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.22),transparent_78%)] blur-3xl" aria-hidden="true" />

          <figure className="relative z-10 mx-auto flex aspect-[4/5] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(170deg,rgba(6,4,14,0.96),rgba(12,6,20,0.92))] shadow-[0_65px_140px_-60px_rgba(0,0,0,0.65)] transition-colors duration-500 dark:border-[rgba(255,136,156,0.18)] dark:shadow-[0_65px_140px_-60px_rgba(0,0,0,0.85)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,28,54,0.22),transparent_78%)] transition-colors duration-500" aria-hidden="true" />
            <img
              src={image.imageUrl}
              alt={image.title ? `${image.title} artwork` : 'StrangePrompt artwork preview'}
              className="relative z-10 h-full w-full object-contain"
            />
            <span aria-hidden="true" className="watermark-overlay" data-watermark="STRANGE PROMPT">
              STRANGE PROMPT
            </span>
          </figure>

          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-3 text-[var(--text-base)] transition-colors duration-500 dark:text-[rgba(255,236,240,0.9)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-modal-accent)] px-4 py-2 text-[11px] uppercase tracking-[0.35em] dark:border-[rgba(255,140,160,0.35)]">
              {image.category}
            </span>
            <span className="rounded-full border border-[rgba(229,9,20,0.32)] bg-[var(--surface-modal-accent-strong)] px-4 py-2 text-xs font-semibold text-[rgba(255,242,246,0.95)] shadow-[0_16px_40px_-20px_rgba(229,9,20,0.45)] dark:border-[rgba(255,140,160,0.3)] dark:text-white dark:shadow-[0_16px_40px_-20px_rgba(229,9,20,0.75)]">
              Uploaded {formatDate(image.createdAt)}
            </span>
          </div>
        </div>

        <div className="glass-scroll flex w-full max-w-[420px] flex-col gap-8 overflow-y-auto border-l border-[var(--surface-border)] bg-[var(--surface-modal-contrast)] px-8 pb-8 pt-16 text-[var(--text-base)] shadow-[0_45px_110px_-90px_rgba(229,9,20,0.65)] transition-colors duration-500 dark:border-[rgba(255,120,140,0.16)] dark:bg-[var(--surface-modal-contrast)] dark:text-[rgba(255,236,240,0.9)] md:pt-12">
          <header className="space-y-5">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold leading-snug text-[var(--text-base)] transition-colors duration-500 dark:text-[rgba(255,244,246,0.96)]">
                {image.title || 'Untitled StrangePrompt upload'}
              </h2>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onShare && onShare(shareUrl)}
                className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--surface-border)] bg-[var(--surface-overlay)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] transition duration-300 hover:border-[rgba(229,9,20,0.32)] hover:text-[rgba(229,9,20,0.86)] dark:border-[rgba(255,140,160,0.28)] dark:bg-[rgba(15,7,22,0.65)] dark:text-[rgba(255,234,238,0.9)] dark:hover:text-white"
              >
                Share link
              </a>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-modal-contrast)] px-4 py-3 text-sm text-[var(--text-base)] transition-colors duration-500 dark:border-[rgba(255,140,160,0.22)] dark:text-[rgba(255,232,236,0.88)]">
              <Avatar name={image.creatorName} photoUrl={image.creatorPhoto} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--text-base)] transition-colors duration-500 dark:text-[rgba(255,240,244,0.92)]">{image.creatorName}</span>
                <a
                  href={creatorProfileUrl}
                  className="text-xs uppercase tracking-[0.35em] text-[var(--text-base)] transition duration-300 hover:text-[rgba(229,9,20,0.82)] dark:text-[rgba(255,210,220,0.75)] dark:hover:text-white"
                >
                  View profile
                </a>
              </div>
            </div>
          </header>

          {/* Minimal modal: show title/header only. Action buttons retained below. */}

          <section className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onLike && onLike(image)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(229,9,20,0.95)] via-[rgba(197,8,17,0.9)] to-[rgba(121,5,13,0.86)] px-5 py-2 text-sm font-semibold text-white shadow-[0_30px_80px_-36px_rgba(229,9,20,0.78)] transition duration-300 hover:brightness-110"
            >
              ♥ Like prompt
            </button>
            <button
              type="button"
              onClick={() => onCopy && onCopy(image)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-5 py-2 text-sm font-semibold text-[var(--text-base)] transition duration-300 hover:border-[rgba(229,9,20,0.42)] hover:text-[rgba(229,9,20,0.9)] dark:border-[rgba(255,140,160,0.28)] dark:bg-[rgba(15,7,22,0.72)] dark:text-[rgba(255,232,236,0.85)] dark:hover:text-white"
            >
              ⧉ Copy prompt
            </button>
            <button
              type="button"
              onClick={() => onReport && onReport(image)}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-[rgba(229,9,20,0.25)] bg-[rgba(229,9,20,0.2)] px-5 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-[rgba(229,9,20,0.28)] dark:border-[rgba(255,80,100,0.38)] dark:bg-[rgba(60,8,18,0.58)] dark:text-[rgba(255,196,204,0.85)] dark:hover:bg-[rgba(60,8,18,0.78)]"
            >
              ! Report
            </button>
          </section>

          {/* related images intentionally hidden for minimal modal */}
        </div>
      </div>
    </div>
  )

  return createPortal(content, modalRoot)
}

function Avatar({ name, photoUrl }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="h-9 w-9 rounded-full object-cover" />
  }

  const initials = (name || 'Creator')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/60 text-xs font-semibold uppercase text-white">
      {initials}
    </span>
  )
}

function Metric({ label, value }) {
  return (
    <span className="inline-flex flex-col gap-1 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-modal-contrast)] px-4 py-3 text-left transition-colors duration-500 dark:border-[rgba(255,140,160,0.26)]">
      <span className="text-[10px] uppercase tracking-[0.35em] text-[rgba(92,18,42,0.78)] transition-colors duration-500 dark:text-[rgba(255,200,210,0.65)]">{label}</span>
      <span className="text-base font-semibold text-[var(--text-base)] transition-colors duration-500 dark:text-[rgba(255,242,246,0.95)]">{value}</span>
    </span>
  )
}
