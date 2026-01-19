import { useEffect, useMemo, useState } from 'react'
import { estimateEarnings, formatNumber } from '../utils/format'
import { SOCIAL_PLATFORM_FIELDS } from '../utils/profile'
import { DEFAULT_REDIRECTS } from '../utils/constants'

const EMAIL_REVEAL_REQUIRED_CLICKS = 3
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

function extractHandle(rawValue) {
  if (typeof rawValue !== 'string') return ''
  const trimmed = rawValue.trim()
  if (!trimmed) return ''

  const ensurePrefixed = (value) => {
    const cleaned = value.replace(/^@+/, '')
    return cleaned ? `@${cleaned}` : ''
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return ensurePrefixed(trimmed)
  }

  try {
    const url = new URL(trimmed)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const lastSegment = pathSegments.length ? decodeURIComponent(pathSegments[pathSegments.length - 1]) : ''
    const normalized = lastSegment.replace(/\?.*$/, '').replace(/#.*$/, '').trim()
    if (normalized) {
      return ensurePrefixed(normalized)
    }
    const hostname = url.hostname.replace(/^www\./i, '')
    return hostname ? ensurePrefixed(hostname) : ''
  } catch (error) {
    console.error('extractHandle', error)
    return ensurePrefixed(trimmed)
  }
}

function extractEmail(value) {
  if (typeof value !== 'string') return ''
  const match = value.match(EMAIL_PATTERN)
  return match ? match[0].trim() : ''
}

function buildSocialHref(platform, rawValue, handle) {
  if (typeof rawValue !== 'string') return null
  const trimmed = rawValue.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const normalizedHandle = (handle || '').replace(/^@+/, '').replace(/\s+/g, '')
  if (!normalizedHandle) return null

  const encoded = encodeURIComponent(normalizedHandle)
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${encoded}`
    case 'pinterest':
      return `https://pinterest.com/${encoded}`
    case 'twitter':
      return `https://twitter.com/${encoded}`
    case 'tiktok':
      return `https://www.tiktok.com/@${encoded}`
    case 'youtube':
      return `https://www.youtube.com/@${encoded}`
    case 'behance':
      return `https://www.behance.net/${encoded}`
    default:
      return null
  }
}

function renderSocialIcon(platform) {
  const commonProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className: 'h-4 w-4',
  }

  switch (platform) {
    case 'instagram':
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4.25" />
          <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'pinterest':
      return (
        <svg {...commonProps}>
          <path
            d="M12 4.5c-3.4 0-6.25 2.53-6.25 5.65 0 2.38 1.47 4.24 3.58 4.9l-1 3.75a.75.75 0 0 0 1.4.5l1.23-3.35h.12c3.43 0 6.22-2.54 6.22-5.65C17.3 7.03 15.08 4.5 12 4.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10.5 14.4c2.17.28 4.5-1.42 4.5-3.8 0-1.78-1.45-3.23-3.25-3.23-1.8 0-3.25 1.45-3.25 3.23 0 .92.38 1.74.99 2.33" />
        </svg>
      )
    case 'twitter':
      return (
        <svg {...commonProps}>
          <path d="M7 7l10 10M17 7l-10 10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg {...commonProps}>
          <path
            d="M14.75 5.5c.7 1.45 1.82 2.3 3.25 2.43v2.2a5.14 5.14 0 0 1-2.81-.82v5.14a4.45 4.45 0 1 1-4.45-4.45c.3 0 .6.03.88.09v2.25a2.1 2.1 0 1 0 1.57 2.03V5.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...commonProps}>
          <path d="M4.5 8.5c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2v-7Z" />
          <path d="M11 10.5v4l3.25-2Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'behance':
      return (
        <svg {...commonProps}>
          <path
            d="M6.5 7h3.25a2.1 2.1 0 0 1 0 4.2H6.5Zm0 4.2h3.5a2.3 2.3 0 0 1 0 4.6H6.5ZM14 9h5M14 14.2c0-1.73 1.32-3.2 3.1-3.2a3.1 3.1 0 1 1-3.1 3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'email':
      return (
        <svg {...commonProps}>
          <rect x="3.75" y="5.5" width="16.5" height="13" rx="2.5" />
          <path d="M5.5 7.25 12 12.5l6.5-5.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="5" />
        </svg>
      )
  }
}

function ProfileHeader({
  profile,
  onFollow,
  isOwner,
  isFollowing = false,
  followLoading = false,
  triggerAdRedirect,
}) {
  if (!profile) return null

  const earnings = estimateEarnings({
    views: profile.totalViews || 0,
    copies: profile.totalCopies || 0,
    shares: profile.totalShares || 0,
  })

  const socialEntries = useMemo(() => {
    return SOCIAL_PLATFORM_FIELDS.map(({ key, label }) => {
      const rawValue = profile.socialLinks?.[key]
      if (typeof rawValue !== 'string') return null
      const trimmed = rawValue.trim()
      if (!trimmed) return null
      const handle = extractHandle(trimmed)
      const href = buildSocialHref(key, trimmed, handle)
      if (!href) return null
      return {
        key,
        label,
        handle,
        href,
      }
    }).filter(Boolean)
  }, [profile.socialLinks])

  const placementsSource = typeof profile.placementsCell === 'string' ? profile.placementsCell.trim() : ''
  const placementsEmail = useMemo(() => extractEmail(placementsSource), [placementsSource])
  const hasRevealableEmail = Boolean(placementsEmail)

  const [emailClicks, setEmailClicks] = useState(0)
  const [emailVisible, setEmailVisible] = useState(false)
  const [emailPending, setEmailPending] = useState(false)

  useEffect(() => {
    setEmailClicks(0)
    setEmailVisible(false)
    setEmailPending(false)
  }, [profile?.id])

  const handleEmailClick = () => {
    if (!hasRevealableEmail || emailPending) return
    if (emailVisible) {
      try {
        if (typeof window !== 'undefined') {
          window.location.href = `mailto:${placementsEmail}`
        }
      } catch (error) {
        console.error('mailto navigation failed', error)
      }
      return
    }

    const nextAttempt = emailClicks + 1
    const finalize = () => {
      setEmailClicks((prev) => {
        const next = prev + 1
        if (next >= EMAIL_REVEAL_REQUIRED_CLICKS) {
          setEmailVisible(true)
        }
        return next
      })
      setEmailPending(false)
    }

    const runAd = () => {
      setEmailPending(true)
      try {
        triggerAdRedirect?.({
          actionLabel: nextAttempt >= EMAIL_REVEAL_REQUIRED_CLICKS ? 'reveal placements email' : 'unlock placements email',
          redirectUrl: DEFAULT_REDIRECTS.profile,
          duration: 4500,
          onComplete: finalize,
        })
      } catch (error) {
        console.error('email reveal redirect failed', error)
        finalize()
      }
    }

    if (triggerAdRedirect) {
      runAd()
    } else {
      finalize()
    }
  }

  const emailTapsRemaining = emailVisible ? 0 : Math.max(EMAIL_REVEAL_REQUIRED_CLICKS - emailClicks, 1)

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-[#18101c]/85 p-8 text-brand-200/85 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)] md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/30 text-2xl font-semibold uppercase text-white">
            {(profile.displayName || 'C')[0]}
          </span>
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-brand-50">{profile.displayName || 'Creator'}</h1>
          {profile.username && (
            <a
              href={`/profile/${profile.username}`}
              className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-200/60 transition hover:text-brand-200"
            >
              @{profile.username}
            </a>
          )}
          {profile.headline && <p className="text-sm font-medium text-brand-200/80">{profile.headline}</p>}
          <p className="text-sm text-brand-200/75">{profile.bio || 'No bio yet. Share your creative process!'}</p>
          <div className="flex flex-wrap gap-4 text-xs text-brand-200/70">
            <span>{formatNumber(profile.totalLikes || 0)} likes</span>
            <span>{formatNumber(profile.totalViews || 0)} views</span>
            <span>{formatNumber(profile.totalCopies || 0)} copies</span>
          </div>
          {placementsSource && (
            <div className="mt-4 flex items-center gap-3">
              {hasRevealableEmail ? (
                emailVisible ? (
                  <>
                    <a
                      href={`mailto:${placementsEmail}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-200/80 transition hover:text-brand-200"
                      aria-label={`Email ${placementsEmail}`}
                      title={placementsEmail}
                    >
                      <span className="sr-only">Email {placementsEmail}</span>
                      {renderSocialIcon('email')}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                            navigator.clipboard.writeText(placementsEmail)
                          }
                        } catch (error) {
                          console.error('copy email failed', error)
                        }
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-200/80 transition hover:text-brand-200"
                      aria-label={`Copy email ${placementsEmail}`}
                      title={`Copy ${placementsEmail}`}
                    >
                      <span className="sr-only">Copy email {placementsEmail}</span>
                      {renderSocialIcon('email')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEmailClick}
                    disabled={emailPending}
                    aria-label={`Unlock placements email (${emailTapsRemaining} more ${emailTapsRemaining === 1 ? 'tap' : 'taps'})`}
                    title={`Tap the envelope icon ${emailTapsRemaining} more ${emailTapsRemaining === 1 ? 'time' : 'times'} to reveal the email`}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-200/80 transition hover:text-brand-200 ${
                      emailPending ? 'cursor-wait opacity-80' : ''
                    }`}
                  >
                    <span className="sr-only">
                      Unlock placements email ({emailTapsRemaining} more {emailTapsRemaining === 1 ? 'tap' : 'taps'})
                    </span>
                    {renderSocialIcon('email')}
                  </button>
                )
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-200/60" title={placementsSource} aria-label={placementsSource}>
                  <span className="sr-only">{placementsSource}</span>
                  {renderSocialIcon('email')}
                </span>
              )}
            </div>
          )}
          {socialEntries.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialEntries.map(({ key, label, handle, href }) => {
                const accessibleLabel = handle ? `${label}: ${handle}` : label
                const icon = renderSocialIcon(key)
                if (!icon) return null
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={accessibleLabel}
                    title={accessibleLabel}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-500/20 text-brand-200/80 transition hover:border-brand-500/40 hover:text-brand-200"
                  >
                    <span className="sr-only">{accessibleLabel}</span>
                    {icon}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {!isOwner && (
        <button
          type="button"
          onClick={onFollow}
          disabled={followLoading}
          aria-pressed={isFollowing}
          className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
            isFollowing
              ? 'bg-brand-500 text-black shadow-[0_18px_48px_-26px_rgba(229,9,20,0.55)] hover:brightness-110'
              : 'bg-brand-500/15 text-brand-50 hover:bg-brand-500/25'
          } ${followLoading ? 'cursor-wait opacity-80' : ''}`}
        >
          {followLoading ? 'Working…' : isFollowing ? 'Following' : 'Follow creator'}
        </button>
      )}
      {isOwner && (
        <div className="rounded-3xl bg-gradient-to-r from-brand-500/15 via-brand-700/20 to-black/70 px-6 py-4 text-center text-sm text-brand-200">
          Estimated redirect earnings: <span className="font-semibold text-brand-50">${earnings.toFixed(2)}</span>
        </div>
      )}
    </section>
  )
}

export default ProfileHeader
