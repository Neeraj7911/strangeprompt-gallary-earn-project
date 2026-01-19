import { useState } from 'react'
import { formatNumber } from '../utils/format'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'

const statusDetails = {
  approved: { label: 'Approved', tone: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40' },
  pending: { label: 'Pending review', tone: 'bg-amber-500/15 text-amber-100 border border-amber-500/40' },
  rejected: { label: 'Needs changes', tone: 'bg-rose-500/15 text-rose-100 border border-rose-500/40' },
}

export default function ImageCard({ image, onOpen, onLike, onCopy, className = '', showStatus = false }) {
  const [hasError, setHasError] = useState(false)

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true)
    }
  }

  return (
    <article
      className={`group relative w-full break-inside-avoid cursor-pointer overflow-hidden rounded-[28px] border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-[0_32px_90px_-48px_rgba(229,9,20,0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_44px_120px_-56px_rgba(229,9,20,0.58)] focus:outline-none focus:ring-2 focus:ring-brand-400/50 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#140d15]/80 dark:shadow-[0_32px_90px_-48px_rgba(229,9,20,0.7)] dark:hover:shadow-[0_44px_120px_-56px_rgba(229,9,20,0.82)] ${className}`}
      onClick={() => onOpen && onOpen(image)}
    >
      <img
        src={hasError ? FALLBACK_IMAGE : image.imageUrl}
        alt={image.title ? `${image.title} artwork` : 'StrangePrompt gallery artwork'}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={handleImageError}
        className="block w-full rounded-[inherit] object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <span aria-hidden="true" className="watermark-overlay" data-watermark="STRANGE PROMPT">
        STRANGE PROMPT
      </span>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(34,16,44,0.32)] via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100 dark:from-[rgba(18,8,26,0.55)] dark:via-transparent" />

      <div className="absolute inset-x-5 top-4 flex items-center justify-between gap-3">
        <div className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 opacity-0 shadow-[0_22px_46px_-32px_rgba(229,9,20,0.6)] ring-1 ring-brand-500/25 backdrop-blur-sm transition duration-500 group-hover:opacity-100">
          <span className="sr-only">Decorative marker</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            onPress={(event) => {
              event.stopPropagation()
              onCopy && onCopy(image)
            }}
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M8 8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2zm-4-3a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1H9a3 3 0 0 0-3 3v10H4a2 2 0 0 1-2-2z"
                  fill="currentColor"
                />
              </svg>
            }
            label="Copy prompt"
          />
          <LikeButton
            active={Boolean(image.liked)}
            likes={formatNumber(image.likes || 0)}
            onPress={(event) => {
              event.stopPropagation()
              onLike && onLike(image)
            }}
          />
        </div>
      </div>
      {showStatus && image.status && statusDetails[image.status] && (
        <div className={`absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] shadow-[0_18px_44px_-32px_rgba(229,9,20,0.6)] ${statusDetails[image.status].tone}`}>
          {statusDetails[image.status].label}
        </div>
      )}
    </article>
  )
}

function IconButton({ icon, label, onPress }) {
  const baseClass =
    'flex h-10 w-10 items-center justify-center bg-transparent text-brand-200 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:text-brand-50'

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      className={baseClass}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  )
}

function LikeButton({ active, likes, onPress }) {
  return (
    <div className="group/like relative flex">
      <button
        type="button"
        onClick={onPress}
        aria-label={active ? 'Remove like' : 'Like image'}
        aria-pressed={active}
        className="relative flex h-10 w-10 items-center justify-center bg-transparent transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition duration-300 ${
            active ? 'drop-shadow-[0_0_18px_rgba(229,9,20,0.7)]' : ''
          }`}
          aria-hidden="true"
        >
          <path
            d="M12 21s-7-4.434-7-10.01C5 7.486 6.99 5.5 9.35 5.5c1.394 0 2.6.8 3.2 1.958C13.05 6.3 14.258 5.5 15.65 5.5 18.01 5.5 20 7.486 20 10.99 20 16.566 12 21 12 21z"
            fill={active ? '#ff4b5d' : '#ffffff'}
            stroke={active ? '#ff4b5d' : 'rgba(148, 122, 132, 0.55)'}
            strokeWidth="1.2"
          />
        </svg>
        <span className="sr-only">{active ? 'Remove like' : 'Like image'}</span>
      </button>
      <span className="pointer-events-none absolute left-1/2 top-[115%] -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,236,240,0.75)] opacity-0 transition duration-200 group-hover/like:opacity-100 group-focus-within/like:opacity-100">
        {likes}
      </span>
    </div>
  )
}
