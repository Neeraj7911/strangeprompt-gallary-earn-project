import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import ImageCard from '../components/ImageCard'
import CategoryTabs from '../components/CategoryTabs'
import { useUI } from '../context/UIContext'
import { DEFAULT_REDIRECTS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import { incrementCopy, subscribeToApprovedImages, subscribeToUserLikes, toggleLike, scheduleNotification } from '../firebase/firestore'

const FEATURED_GENRES = ['Concept Art', 'Portraits', 'Product', 'Photography']

export default function GalleryPage() {
  const { openImageDetail, openAuthModal, triggerAdRedirect } = useUI()
  const { user, isAuthenticated } = useAuth()
  const [activeCategory, setActiveCategory] = useState('Explore')
  const [images, setImages] = useState([])
  const [likedIds, setLikedIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErrorMessage(null)
    let unsubscribe = () => {}
    try {
      unsubscribe = subscribeToApprovedImages(
        { category: activeCategory, take: 96 },
        (snapshot) => {
          const nextImages = snapshot.docs
            .map((docSnapshot) => {
              const data = docSnapshot.data()
              const status = typeof data.status === 'string' ? data.status.trim().toLowerCase() : 'pending'
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
              }
            })
            .filter((item) => item.status === 'approved')
          setImages(nextImages)
          setLoading(false)
        },
        (error) => {
          console.error('Failed to load approved images', error)
          setImages([])
          setErrorMessage('We could not load the gallery. Confirm your Firestore rules and composite indexes allow status-filtered reads.')
          setLoading(false)
        },
      )
    } catch (error) {
      console.error('Failed to subscribe to approved images', error)
      setImages([])
      setErrorMessage('We could not load the gallery. Confirm your Firestore rules and composite indexes allow status-filtered reads.')
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [activeCategory])

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

  const enrichedImages = useMemo(
    () =>
      images.map((item) => ({
        ...item,
        liked: likedIds.has(item.id),
      })),
    [images, likedIds],
  )

  const filteredImages = useMemo(() => {
    if (activeCategory === 'Explore') return enrichedImages
    return enrichedImages.filter((item) => item.category === activeCategory)
  }, [activeCategory, enrichedImages])

  const handleOpen = (image) => {
    openImageDetail(image)
  }

  const handleToggleLike = async (image) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login')
      toast.error('Sign in to like prompts')
      return
    }

    const perform = async () => {
      try {
        const liked = await toggleLike({ imageId: image.id, userId: user.uid })
        setLikedIds((current) => {
          const next = new Set(current)
          if (liked) {
            next.add(image.id)
          } else {
            next.delete(image.id)
          }
          return next
        })
        if (liked) {
          try {
            await scheduleNotification({
              userId: image.creatorId,
              type: 'like',
              imageId: image.id,
              message: `${user.displayName || 'Someone'} liked your prompt`,
            })
          } catch (err) {
            console.error('Failed to send like notification', err)
          }
        }
      } catch (error) {
        toast.error('Unable to update like right now')
      }
    }

    triggerAdRedirect({
      actionLabel: 'register your like',
      redirectUrl: DEFAULT_REDIRECTS.like,
      duration: 3500,
      postId: image.id,
      onComplete: perform,
    })
  }

  const handleCopyPrompt = async (image) => {
    if (!isAuthenticated) {
      openAuthModal('login')
      toast.error('Sign in to copy prompts')
      return
    }
    if (!navigator?.clipboard) {
      toast.error('Clipboard access is not available')
      return
    }
    const perform = async () => {
      try {
        await navigator.clipboard.writeText(image.prompt || '')
        await incrementCopy(image.id)
        try {
          await scheduleNotification({
            userId: image.creatorId,
            type: 'copy',
            imageId: image.id,
            message: `${user.displayName || 'Someone'} copied your prompt`,
          })
        } catch (err) {
          console.error('Failed to send copy notification', err)
        }
        toast.success('Prompt copied to clipboard')
      } catch (error) {
        toast.error('Unable to copy prompt right now')
      }
    }

    triggerAdRedirect({
      actionLabel: 'copy this prompt',
      redirectUrl: DEFAULT_REDIRECTS.copy,
      duration: 4200,
      postId: image.id,
      onComplete: perform,
    })
  }

  return (
    <div className="space-y-16 pb-20">
      <GalleryHero featured={FEATURED_GENRES} total={images.length} />
      <section className="space-y-10">
        <CategoryTabs active={activeCategory} onSelect={setActiveCategory} />
        {errorMessage ? (
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-[0_34px_92px_-54px_rgba(229,9,20,0.32)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#18101c]/85 dark:text-brand-200/75 dark:shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
            {errorMessage}
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-[0_34px_92px_-54px_rgba(229,9,20,0.32)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#18101c]/85 dark:text-brand-200/75 dark:shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
            Loading gallery…
          </div>
        ) : !filteredImages.length ? (
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-[0_34px_92px_-54px_rgba(229,9,20,0.32)] transition-colors duration-500 dark:border-[rgba(255,126,140,0.24)] dark:bg-[#18101c]/85 dark:text-brand-200/75 dark:shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
            No visuals available yet.
          </div>
        ) : (
          <div className="columns-1 gap-x-6 pb-28 sm:columns-2 xl:columns-3 2xl:columns-4">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onOpen={handleOpen}
                onLike={handleToggleLike}
                onCopy={handleCopyPrompt}
                className="mb-8"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function GalleryHero({ featured, total }) {
  return (
    <section className="relative overflow-hidden rounded-[38px] bg-[#140d15]/80 px-5 py-14 shadow-[0_60px_160px_-70px_rgba(229,9,20,0.7)] backdrop-blur-2xl sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-500/50 via-brand-700/40 to-black/60 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-gradient-to-tl from-brand-600/45 via-red-900/35 to-black/55 blur-[130px]" aria-hidden="true" />
      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
        <div className="space-y-6 text-brand-200/85">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-200 shadow-[0_18px_44px_-28px_rgba(229,9,20,0.6)]">
            Editor’s Picks
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-brand-50 sm:text-5xl">
            Discover cinematic renders curated for moodboards that feel bespoke.
          </h1>
          <p className="max-w-xl text-sm text-brand-200/80 sm:text-base">
            Every gallery submission passes through our stylists for quality, composition, and narrative coherence. Explore hundreds of high-definition prompts ready for your next concept brief.
          </p>
          <dl className="grid max-w-md grid-cols-2 gap-6 text-sm text-brand-200/75">
            <div>
              <dt className="text-lg font-semibold text-brand-50">{total}+ visuals</dt>
              <dd>Hand-reviewed entries you can remix instantly.</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-brand-50">Realtime curation</dt>
              <dd>Collections refresh daily with community votes.</dd>
            </div>
          </dl>
        </div>
        <div className="grid gap-4 rounded-3xl bg-[#1a111d]/80 p-5 shadow-[0_34px_94px_-48px_rgba(229,9,20,0.6)] backdrop-blur-xl text-brand-200/80 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-200/70">
            Trending genres
          </h2>
          <div className="flex flex-wrap gap-3">
            {featured.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-brand-200 shadow-[0_22px_46px_-30px_rgba(229,9,20,0.55)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-400 via-brand-600 to-black" />
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-brand-200/75">
            Breathe new life into product campaigns, cinematic stills, and editorial portraits tailored to your visual strategy.
          </p>
        </div>
      </div>
    </section>
  )
}
