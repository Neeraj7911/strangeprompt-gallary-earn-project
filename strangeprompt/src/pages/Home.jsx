import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useUI } from '../context/UIContext'
import { useAuth } from '../context/AuthContext'
import { listenToRecentUploads, subscribeToUserLikes, toggleLike, scheduleNotification } from '../firebase/firestore'
import { DEFAULT_REDIRECTS, CATEGORIES, TAG_SUGGESTIONS } from '../utils/constants'
import CategoryTabs from '../components/CategoryTabs'
import { formatNumber } from '../utils/format'

function getEngagementScore(item = {}) {
  const likes = Number.isFinite(item.likes) ? item.likes : 0
  const copies = Number.isFinite(item.copies) ? item.copies : 0
  const views = Number.isFinite(item.views) ? item.views : 0
  return copies * 5 + likes * 3 + views * 0.05
}

function HomePage() {
  const { openImageDetail, openAuthModal, triggerAdRedirect } = useUI()
  const { user, isAuthenticated } = useAuth()
  const [category, setCategory] = useState('Explore')
  const [items, setItems] = useState([])
  const [likedIds, setLikedIds] = useState(() => new Set())
  const [feedError, setFeedError] = useState(null)

  const heroMetrics = [
    {
      label: 'Creators gaining traction',
      value: '8.4K',
      caption: 'Active members remixing and publishing StrangePrompt recipes every day.',
    },
    {
      label: 'Social reach amplified',
      value: '2.7M+',
      caption: 'Combined views from prompts shared across Instagram, TikTok, and YouTube.',
    },
    {
      label: 'Prompt success rate',
      value: '93%',
      caption: 'Approved templates that hit explore or trend pages within 48 hours.',
    },
  ]

  const spotlightStories = [
    {
      headline: 'Beauty carousel blitz',
      body: 'GlossLab used a StrangePrompt skin-care prompt to launch a 4-slide carousel that reached 320k viewers overnight with zero ad spend.',
    },
    {
      headline: 'Anime drops going viral',
      body: 'Indie illustrator Kira posted a stylized cyberpunk set built from our anime deck and gained 18k new followers in a weekend.',
    },
    {
      headline: 'Product mockups in minutes',
      body: 'DTC brand Vault replaced studio shoots with AI bottle renders, cutting production time from 3 days to 35 minutes.',
    },
  ]

  const creatorPillars = [
    {
      title: 'Signal-ready templates',
      detail: 'Premium prompt bundles are tuned for ChatGPT (Images), Midjourney, and Stable Diffusion so you can generate once and repurpose everywhere.',
    },
    {
      title: 'Team-curated marketplace',
      detail: 'Uploads remain private until the StrangePrompt review team verifies originality, visual polish, and sponsor safety.',
    },
    {
      title: 'Earn when others remix',
      detail: 'Approved prompts activate sponsor redirects, meaning every copy, view, and click can credit your account.',
    },
  ]

  const enrichedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        liked: likedIds.has(item.id),
      })),
    [items, likedIds],
  )

  const trendingCategories = useMemo(() => {
    if (!items.length) return CATEGORIES
    const scoreByCategory = new Map()
    items.forEach((item) => {
      const name = item.category || 'Explore'
      const score = getEngagementScore(item) + 1
      scoreByCategory.set(name, (scoreByCategory.get(name) ?? 0) + score)
    })
    const ranked = Array.from(scoreByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
    const ordered = ['Explore', ...ranked.filter((name) => name && name !== 'Explore')]
    CATEGORIES.forEach((name) => {
      if (!ordered.includes(name)) {
        ordered.push(name)
      }
    })
    return ordered.slice(0, CATEGORIES.length)
  }, [items])

  const trendingKeywords = useMemo(() => {
    if (!items.length) {
      return TAG_SUGGESTIONS.slice(0, 8).map((keyword) => `#${keyword.replace(/^#/i, '')}`)
    }
    const weighted = new Map()
    items.slice(0, 24).forEach((item) => {
      const weight = getEngagementScore(item) + 1
      const tagList = Array.isArray(item.tags) ? item.tags : []
      tagList.forEach((tag) => {
        if (typeof tag !== 'string') return
        const normalized = tag.trim().toLowerCase()
        if (!normalized) return
        weighted.set(normalized, (weighted.get(normalized) ?? 0) + weight)
      })
    })
    if (!weighted.size) {
      return TAG_SUGGESTIONS.slice(0, 8).map((keyword) => `#${keyword.replace(/^#/i, '')}`)
    }
    return Array.from(weighted.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword]) => `#${keyword.replace(/^#/i, '')}`)
  }, [items])

  const filteredItems = useMemo(() => {
    if (category === 'Explore') return enrichedItems
    return enrichedItems.filter((item) => item.category === category)
  }, [category, enrichedItems])

  useEffect(() => {
    if (!trendingCategories.includes(category)) {
      setCategory('Explore')
    }
  }, [category, trendingCategories])

  useEffect(() => {
    setFeedError(null)
    let unsubscribe = () => {}
    try {
      unsubscribe = listenToRecentUploads(
        (snapshot) => {
          const nextItems = snapshot.docs
            .map((docSnapshot) => {
              const data = docSnapshot.data()
              const status = typeof data.status === 'string' ? data.status.trim().toLowerCase() : 'pending'
              const tags = Array.isArray(data.tags)
                ? data.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
                : []
              const createdAtMs = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : 0
              const approvedAtMs = typeof data.approvedAt?.toMillis === 'function' ? data.approvedAt.toMillis() : createdAtMs
              return {
                id: docSnapshot.id,
                ...data,
                title: data.title || data.prompt || 'Untitled prompt',
                prompt: data.prompt || '',
                category: data.category || 'Explore',
                status,
                likes: data.likes ?? 0,
                views: data.views ?? 0,
                copies: data.copies ?? 0,
                shareSlug: data.shareSlug || null,
                tags,
                createdAtMs,
                approvedAtMs,
              }
            })
            .filter((item) => item.status === 'approved')
            .sort((a, b) => {
              const scoreB = getEngagementScore(b)
              const scoreA = getEngagementScore(a)
              if (scoreB !== scoreA) return scoreB - scoreA
              if ((b.copies ?? 0) !== (a.copies ?? 0)) return (b.copies ?? 0) - (a.copies ?? 0)
              if ((b.likes ?? 0) !== (a.likes ?? 0)) return (b.likes ?? 0) - (a.likes ?? 0)
              if (b.approvedAtMs !== a.approvedAtMs) return b.approvedAtMs - a.approvedAtMs
              return b.createdAtMs - a.createdAtMs
            })
          setItems(nextItems)
        },
        24,
        (error) => {
          console.error('Failed to load recent uploads', error)
          setItems([])
          setFeedError('We could not load the live gallery feed. Check Firestore rules and indexes for the images collection.')
        },
      )
    } catch (error) {
      console.error('Failed to subscribe to recent uploads', error)
      setItems([])
      setFeedError('We could not load the live gallery feed. Check Firestore rules and indexes for the images collection.')
    }

    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set())
      return undefined
    }

    const unsubscribe = subscribeToUserLikes(user.uid, (snapshot) => {
      const next = new Set()
      snapshot.forEach((docSnapshot) => {
        const imageId = docSnapshot.ref.parent.parent?.id
        if (imageId) {
          next.add(imageId)
        }
      })
      setLikedIds(next)
    })

    return () => unsubscribe?.()
  }, [user])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const targets = Array.from(document.querySelectorAll('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
            entry.target.classList.remove('reveal-prep')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -60px 0px' },
    )

    targets.forEach((target) => {
      target.classList.add('reveal-prep')
      observer.observe(target)

      const rect = target.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        target.classList.add('reveal-active')
        target.classList.remove('reveal-prep')
      }
    })

    return () => {
      observer.disconnect()
      targets.forEach((target) => target.classList.remove('reveal-prep', 'reveal-active'))
    }
  }, [])

  const handleOpen = (image) => {
    openImageDetail(image)
  }

  const handleToggleLike = async (imageId) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login')
      toast.error('Sign in to like prompts')
      return
    }

    const perform = async () => {
      try {
        const liked = await toggleLike({ imageId, userId: user.uid })
        setLikedIds((current) => {
          const next = new Set(current)
          if (liked) {
            next.add(imageId)
          } else {
            next.delete(imageId)
          }
          return next
        })
        if (liked) {
          try {
            const item = items.find((it) => it.id === imageId)
            if (item?.creatorId) {
              await scheduleNotification({
                userId: item.creatorId,
                type: 'like',
                imageId,
                message: `${user.displayName || 'Someone'} liked your prompt`,
              })
            }
          } catch (err) {
            console.error('Failed to send like notification', err)
          }
        }
      } catch (error) {
        toast.error('Unable to update like right now')
      }
    }

    // Always show sponsor redirect before registering like
    triggerAdRedirect({
      actionLabel: 'register your like',
      redirectUrl: DEFAULT_REDIRECTS.like,
      duration: 3500,
      postId: imageId,
      onComplete: perform,
    })
  }

  return (
    <div className="space-y-12 pb-12">
      <section id="gallery-section" className="space-y-10">
        <header className="space-y-6" data-reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] shadow-[0_18px_44px_-26px_rgba(229,9,20,0.3)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.26)] dark:bg-[rgba(12,7,18,0.82)] dark:text-[rgba(255,236,240,0.9)] dark:shadow-[0_18px_44px_-26px_rgba(229,9,20,0.5)]">
            Live gallery feed
          </div>
          <div className="flex flex-col gap-4 text-[var(--text-muted)] transition-colors duration-500 lg:flex-row lg:items-center lg:justify-between dark:text-[rgba(255,240,244,0.85)]">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-[var(--text-base)] sm:text-3xl lg:text-4xl">
                Explore community-sourced AI prompts the moment they drop.
              </h1>
              <p className="max-w-2xl text-sm sm:text-base">
                Scroll the StrangePrompt gallery for fresh concepts, copy any prompt into ChatGPT (Images) or your favorite generator, and publish across Instagram, TikTok, Pinterest, and more.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#gallery-section"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[rgba(116,103,255,0.85)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_24px_58px_-36px_rgba(229,9,20,0.55)] transition duration-300 hover:brightness-110"
              >
                Jump to gallery
              </a>
              <Link
                to="/earn"
                className="inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)] transition duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-[rgba(255,126,140,0.28)] dark:text-[rgba(255,236,240,0.9)]"
              >
                Learn to earn
              </Link>
            </div>
          </div>
        </header>
        <CategoryTabs active={category} onSelect={setCategory} categories={trendingCategories} />
        <TrendingKeywords keywords={trendingKeywords} />
        {feedError ? (
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-[0_34px_92px_-54px_rgba(229,9,20,0.32)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#18101c]/85 dark:text-brand-200/75 dark:shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
            {feedError}
          </div>
        ) : (
          <GalleryGrid items={filteredItems} onOpen={handleOpen} onLike={handleToggleLike} />
        )}
        <section className="grid gap-4 text-[var(--text-muted)] sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {spotlightStories.map((story) => (
            <div
              key={story.headline}
              className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)]/80 px-6 py-6 text-sm shadow-[0_24px_82px_-48px_rgba(229,9,20,0.5)] transition duration-500 hover:border-[var(--accent)]/70 dark:border-[rgba(255,126,140,0.2)] dark:bg-[rgba(12,7,18,0.78)] dark:shadow-[0_30px_90px_-52px_rgba(229,9,20,0.75)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--text-muted)]/70">
                Spotlight
              </p>
              <h2 className="mt-3 text-base font-semibold text-[var(--text-base)]">{story.headline}</h2>
              <p className="mt-2 text-[13px] leading-relaxed dark:text-[rgba(255,235,240,0.78)]">
                {story.body}
              </p>
            </div>
          ))}
        </section>
        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start" data-reveal>
          <div className="space-y-5 rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)]/75 p-8 text-[var(--text-muted)] shadow-[0_34px_92px_-48px_rgba(229,9,20,0.5)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.22)] dark:bg-[rgba(12,7,18,0.78)] dark:text-[rgba(255,236,240,0.78)] sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(229,9,20,0.14)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]/80 dark:text-[rgba(255,236,240,0.82)]">
              Creator runway
            </span>
            <h2 className="text-2xl font-semibold text-[var(--text-base)] sm:text-3xl">
              Upload prompts, pass review, and get featured.
            </h2>
            <p className="text-sm">
              Once your prompt is gallery-ready, head to the earn studio to submit it for team approval. Sponsors activate automatically when your prompt clears review.
            </p>
            <Link
              to="/earn"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[rgba(116,103,255,0.85)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_24px_58px_-36px_rgba(229,9,20,0.55)] transition duration-300 hover:brightness-110 sm:w-auto"
            >
              Visit earn studio
            </Link>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creatorPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)]/70 px-5 py-5 text-sm shadow-[0_28px_82px_-52px_rgba(229,9,20,0.48)] transition duration-500 hover:border-[var(--accent)]/70 dark:border-[rgba(255,126,140,0.18)] dark:bg-[rgba(10,5,16,0.86)]"
                >
                  <h3 className="text-base font-semibold text-[var(--text-base)]">{pillar.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed dark:text-[rgba(255,235,240,0.78)]">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card)]/75 p-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-1">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)]/80 px-5 py-4 shadow-[0_24px_70px_-46px_rgba(229,9,20,0.45)]">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]/70">
                  {metric.label}
                </p>
                <p className="text-2xl font-semibold text-[var(--text-base)]">{metric.value}</p>
                <p className="text-xs text-[var(--text-muted)]/80">{metric.caption}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}

export default HomePage

function TrendingKeywords({ keywords }) {
  if (!keywords?.length) return null

  return (
    <div
      className="flex flex-col gap-3 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)]/80 px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)] shadow-[0_26px_78px_-44px_rgba(229,9,20,0.4)] transition-colors duration-500 sm:flex-row sm:items-center sm:justify-between dark:border-[rgba(255,126,140,0.24)] dark:bg-[rgba(12,7,18,0.78)] dark:text-[rgba(255,230,236,0.78)]"
      data-reveal
    >
      <span className="text-[11px] font-semibold">Trending keywords</span>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-card-strong)] px-3 py-1 text-[10px] font-semibold tracking-[0.2em] transition duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-[rgba(255,126,140,0.26)] dark:bg-[rgba(12,6,18,0.84)] dark:hover:border-[rgba(255,126,140,0.34)] dark:hover:text-[rgba(255,255,255,0.88)]"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  )
}

function GalleryGrid({ items, onOpen, onLike }) {
  const supportsInteractiveHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const handlePointerEnter = (event) => {
    if (!supportsInteractiveHover) return
    event.currentTarget.classList.add('is-hovered')
  }

  const handlePointerMove = (event) => {
    if (!supportsInteractiveHover) return
    const target = event.currentTarget
    const reference = 'touches' in event ? event.touches[0] : event
    if (!reference) return
    const rect = target.getBoundingClientRect()
    const relX = ((reference.clientX ?? 0) - rect.left) / rect.width
    const relY = ((reference.clientY ?? 0) - rect.top) / rect.height
    const rotateX = (0.5 - relY) * 10
    const rotateY = (relX - 0.5) * 12
    const translateX = (relX - 0.5) * 22
    const translateY = (relY - 0.5) * 22

    target.style.setProperty('--hover-rotate-x', `${rotateX.toFixed(2)}deg`)
    target.style.setProperty('--hover-rotate-y', `${rotateY.toFixed(2)}deg`)
    target.style.setProperty('--hover-translate-x', `${translateX.toFixed(2)}px`)
    target.style.setProperty('--hover-translate-y', `${translateY.toFixed(2)}px`)
  }

  const handlePointerLeave = (event) => {
    if (!supportsInteractiveHover) return
    const target = event.currentTarget
    target.classList.remove('is-hovered')
    target.style.removeProperty('--hover-rotate-x')
    target.style.removeProperty('--hover-rotate-y')
    target.style.removeProperty('--hover-translate-x')
    target.style.removeProperty('--hover-translate-y')
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-[0_34px_92px_-54px_rgba(229,9,20,0.32)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#18101c]/85 dark:text-brand-200/75 dark:shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
        No visuals available yet.
      </div>
    )
  }

  return (
    <div className="relative w-full" data-reveal>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-full bg-gradient-to-b from-[rgba(229,9,20,0.18)] via-[rgba(18,8,26,0.72)] to-transparent blur-3xl" aria-hidden="true" />
      <div className="columns-1 gap-x-6 pb-24 sm:columns-2 sm:pb-28 xl:columns-3 2xl:columns-4">
        {items.map((item) => {
          const displayTitle = item.title || item.prompt || 'Untitled prompt'
          return (
            <figure
              key={item.id}
              role="button"
              tabIndex={0}
              data-reveal
              onClick={() => onOpen && onOpen(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpen && onOpen(item)
                }
              }}
              onMouseEnter={handlePointerEnter}
              onMouseMove={handlePointerMove}
              onMouseLeave={handlePointerLeave}
              onTouchStart={handlePointerEnter}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerLeave}
              className="motion-card group relative mb-8 break-inside-avoid overflow-hidden rounded-[32px] border border-[var(--surface-border)] bg-[var(--surface-card-strong)] shadow-[0_38px_112px_-54px_rgba(229,9,20,0.4)] transition-shadow duration-500 hover:shadow-[0_48px_140px_-58px_rgba(229,9,20,0.62)] focus:outline-none focus:ring-2 focus:ring-[rgba(229,9,20,0.45)] dark:border-[rgba(255,126,140,0.24)] dark:bg-[rgba(12,7,18,0.88)] dark:shadow-[0_38px_112px_-54px_rgba(229,9,20,0.78)] dark:hover:shadow-[0_48px_140px_-58px_rgba(229,9,20,0.88)]"
            >
              <div className="absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.16),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-70 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(229,9,20,0.2),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(34,16,44,0.36)] via-transparent to-transparent opacity-45 dark:from-[rgba(12,6,20,0.68)]" />
              </div>
              <img
                src={item.imageUrl}
                alt={`${displayTitle} artwork`}
                loading="lazy"
                className="block h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <span aria-hidden="true" className="watermark-overlay" data-watermark="STRANGE PROMPT">
                STRANGE PROMPT
              </span>
              <div className="absolute inset-x-6 top-5 flex items-center justify-end">
                <div className="group/like relative flex">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onLike && onLike(item.id)
                    }}
                    aria-label={item.liked ? 'Remove like' : 'Like image'}
                    aria-pressed={item.liked}
                    className="relative flex h-10 w-10 items-center justify-center bg-transparent transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(229,9,20,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 transition duration-300 ${
                        item.liked ? 'drop-shadow-[0_0_18px_rgba(229,9,20,0.7)]' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        d="M12 21s-7-4.434-7-10.01C5 7.486 6.99 5.5 9.35 5.5c1.394 0 2.6.8 3.2 1.958C13.05 6.3 14.258 5.5 15.65 5.5 18.01 5.5 20 7.486 20 10.99 20 16.566 12 21 12 21z"
                        fill={item.liked ? '#ff4b5d' : '#ffffff'}
                        stroke={item.liked ? '#ff4b5d' : 'rgba(148, 122, 132, 0.55)'}
                        strokeWidth="1.1"
                      />
                    </svg>
                    <span className="sr-only">Toggle like</span>
                  </button>
                  <span className="pointer-events-none absolute left-1/2 top-[115%] -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,236,240,0.75)] opacity-0 transition duration-200 group-hover/like:opacity-100 group-focus-within/like:opacity-100">
                    {formatNumber(item.likes || 0)}
                  </span>
                </div>
              </div>

              <figcaption className="absolute inset-x-6 bottom-6 flex translate-y-4 flex-col gap-3 rounded-3xl border border-[var(--surface-border-strong)] bg-[var(--surface-elevated)] p-5 text-xs text-[var(--text-muted)] opacity-0 backdrop-blur-xl transition duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-[rgba(255,126,140,0.26)] dark:bg-[rgba(13,7,19,0.9)] dark:text-[rgba(255,236,240,0.82)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-base)]">{displayTitle}</span>
                  <span className="rounded-full border border-[var(--surface-border)] bg-[rgba(229,9,20,0.12)] px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-[rgba(120,28,48,0.82)] dark:border-[rgba(255,126,140,0.3)] dark:bg-[rgba(229,9,20,0.16)] dark:text-[rgba(255,229,234,0.9)]">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--text-muted)] dark:text-[rgba(255,235,240,0.7)]">Prompt hidden — use Copy prompt to grab it.</p>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[rgba(120,40,58,0.68)] dark:text-[rgba(255,226,232,0.78)]">
                  <span>♥ {formatNumber(item.likes ?? 0)}</span>
                  <span>👁 {formatNumber(item.views ?? 0)}</span>
                  <span>⟳ {formatNumber(item.copies ?? 0)}</span>
                </div>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
