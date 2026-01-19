import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProfileHeader from '../components/ProfileHeader'
import ImageCard from '../components/ImageCard'
import {
  fetchUserProfile,
  fetchUserProfileByUsername,
  incrementCopy,
  scheduleNotification,
  subscribeToUserUploads,
  subscribeToFollowStatus,
  toggleLike,
  toggleFollowUser,
} from '../firebase/firestore'
import { useUI } from '../context/UIContext'
import { DEFAULT_REDIRECTS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { triggerAdRedirect, openImageDetail, openAuthModal } = useUI()
  const [profile, setProfile] = useState(null)
  const [uploads, setUploads] = useState([])
  const [resolvedUserId, setResolvedUserId] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwner = Boolean(resolvedUserId && user?.uid === resolvedUserId)

  useEffect(() => {
    if (!slug) return undefined
    let active = true
    setProfile(null)
    setUploads([])
    setResolvedUserId(null)
    setProfileError(null)
    setLoadingProfile(true)
    setIsFollowing(false)
    setFollowLoading(false)

    async function loadProfile() {
      try {
        const profileByUsername = await fetchUserProfileByUsername(slug)
        let nextProfile = profileByUsername
        if (!nextProfile) {
          nextProfile = await fetchUserProfile(slug)
        }
        if (!active) return
        if (!nextProfile) {
          setProfileError('Creator not found')
          toast.error('Creator not found')
          return
        }
        setProfile(nextProfile)
        setResolvedUserId(nextProfile.id)
      } catch (error) {
        if (!active) return
        console.error(error)
        setProfileError('Unable to load profile')
        toast.error('Unable to load profile')
      } finally {
        if (active) {
          setLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (!resolvedUserId) return undefined
    const unsubscribe = subscribeToUserUploads(
      resolvedUserId,
      (snapshot) => {
        const docs = snapshot.docs.map((docItem) => {
          const data = docItem.data()
          const rawStatus = typeof data.status === 'string' ? data.status.trim().toLowerCase() : 'pending'
          const status = ['approved', 'pending', 'rejected'].includes(rawStatus) ? rawStatus : 'pending'
          return { id: docItem.id, ...data, status }
        })
        setUploads(docs)
        const aggregates = docs.reduce(
          (acc, item) => {
            acc.likes += Number.isFinite(item.likes) ? item.likes : 0
            acc.views += Number.isFinite(item.views) ? item.views : 0
            acc.copies += Number.isFinite(item.copies) ? item.copies : 0
            acc.shares += Number.isFinite(item.shares) ? item.shares : 0
            return acc
          },
          { likes: 0, views: 0, copies: 0, shares: 0 },
        )
        setProfile((current) =>
          current
            ? {
                ...current,
                totalLikes: aggregates.likes,
                totalViews: aggregates.views,
                totalCopies: aggregates.copies,
                totalShares: aggregates.shares,
              }
            : current,
        )
        setProfileError(null)
      },
      {
        includeAllStatuses: isOwner,
        onError: (error) => {
          console.error(error)
          const needsOwnerIndex = Boolean(isOwner)
          const guidance = needsOwnerIndex
            ? 'Add the Firestore composite index on images: creatorId ASC, createdAt DESC.'
            : 'Add the Firestore composite index on images: creatorId ASC, status ASC, createdAt DESC.'
          setProfileError(`Unable to load uploads for this creator. ${guidance}`)
          toast.error(guidance)
        },
      },
    )

    return () => {
      unsubscribe?.()
    }
  }, [resolvedUserId, isOwner])

  useEffect(() => {
    if (!resolvedUserId || !user || user.uid === resolvedUserId) {
      setIsFollowing(false)
      return undefined
    }

    const unsubscribe = subscribeToFollowStatus(resolvedUserId, user.uid, (following) => {
      setIsFollowing(following)
    })

    return () => {
      unsubscribe?.()
    }
  }, [resolvedUserId, user])

  const handleLike = (image) => {
    if (!user) {
      openAuthModal('login')
      toast.error('Sign in to like prompts')
      return
    }

    triggerAdRedirect({
      actionLabel: 'register your like',
      redirectUrl: DEFAULT_REDIRECTS.like,
      duration: 4000,
      postId: image.id,
      onComplete: async () => {
        try {
          await toggleLike({ imageId: image.id, userId: user.uid })
        } catch (error) {
          console.error(error)
          toast.error('Could not update like')
        }
      },
    })
  }

  const handleCopy = (image) => {
    if (!user) {
      openAuthModal('login')
      toast.error('Sign in to copy prompts')
      return
    }

    triggerAdRedirect({
      actionLabel: 'copy this prompt',
      redirectUrl: DEFAULT_REDIRECTS.copy,
      duration: 5000,
      postId: image.id,
      onComplete: async () => {
        try {
          await navigator.clipboard.writeText(image.prompt)
          await incrementCopy(image.id)
          await scheduleNotification({
            userId: image.creatorId,
            type: 'copy',
            imageId: image.id,
            message: `${user.displayName || 'Someone'} copied your prompt`,
          })
          toast.success('Prompt copied')
        } catch (error) {
          console.error(error)
          toast.error('Unable to copy prompt')
        }
      },
    })
  }

  const handleToggleFollow = async () => {
    if (!resolvedUserId) return
    if (!user) {
      openAuthModal('login')
      toast.error('Sign in to follow creators')
      return
    }

    if (user.uid === resolvedUserId || followLoading) return

    try {
      setFollowLoading(true)
      const followed = await toggleFollowUser({ targetUserId: resolvedUserId, follower: user })
      setIsFollowing(followed)
      const display = profile?.displayName || 'creator'
      toast.success(followed ? `Following ${display}` : `Unfollowed ${display}`)
      if (followed) {
        try {
          await scheduleNotification({
            userId: resolvedUserId,
            type: 'follow',
            imageId: null,
            message: `${user.displayName || 'Someone'} started following you`,
          })
        } catch (err) {
          console.error('Failed to send follow notification', err)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="pb-16">
        <div className="space-y-3 rounded-3xl bg-[#18101c]/85 p-10 text-center text-brand-200/75 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
          <p>{loadingProfile ? 'Loading profile…' : profileError || 'Creator not found.'}</p>
          {!loadingProfile && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.back()
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-16 text-brand-200/85">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        onFollow={handleToggleFollow}
        isFollowing={isFollowing}
        followLoading={followLoading}
        triggerAdRedirect={triggerAdRedirect}
      />
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-200/70">Uploads</h2>
        <div className="mt-6 columns-1 gap-x-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {uploads.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onOpen={openImageDetail}
              onLike={handleLike}
              onCopy={handleCopy}
              showStatus={isOwner}
              className="mb-8"
            />
          ))}
        </div>
        {!uploads.length && (
          <div className="mt-6 rounded-3xl bg-[#18101c]/85 p-8 text-center text-brand-200/75 shadow-[0_30px_84px_-52px_rgba(229,9,20,0.6)]">
            No uploads yet.
          </div>
        )}
      </section>
    </div>
  )
}
