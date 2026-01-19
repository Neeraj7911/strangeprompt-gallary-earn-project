import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import AuthModal from './AuthModal'
import AdRedirectModal from './AdRedirectModal'
import ImageDetailModal from './ImageDetailModal'
import ReportModal from './ReportModal'
import {
  incrementCopy,
  incrementShare,
  incrementView,
  reportImage,
  scheduleNotification,
  toggleLike,
  fetchPopularImages,
} from '../firebase/firestore'
import { DEFAULT_REDIRECTS } from '../utils/constants'

export default function GlobalModals() {
  const {
    authModal,
    closeAuthModal,
    openAuthModal,
    adRedirect,
    clearAdRedirect,
    completeAdRedirect,
    imageModal,
    closeImageDetail,
    triggerAdRedirect,
    openImageDetail,
  } = useUI()
  const { isAuthenticated, user } = useAuth()
  const [relatedImages, setRelatedImages] = useState([])

  const selectedImage = imageModal.image
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)

  useEffect(() => {
    if (authModal.isOpen && isAuthenticated) {
      closeAuthModal()
    }
  }, [authModal.isOpen, isAuthenticated, closeAuthModal])

  useEffect(() => {
    if (!selectedImage?.id) return
    incrementView(selectedImage.id).catch(console.error)
  }, [selectedImage])

  useEffect(() => {
    let isCancelled = false
    async function loadRelated() {
      if (!selectedImage?.tags?.length) {
        setRelatedImages([])
        return
      }
      try {
        const snapshot = await fetchPopularImages({
          searchTerm: selectedImage.tags[0],
          pageSize: 6,
        })
        if (!isCancelled) {
          const docs = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((doc) => doc.id !== selectedImage.id)
          setRelatedImages(docs)
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadRelated()
    return () => {
      isCancelled = true
    }
  }, [selectedImage])

  const handleLike = (image) => {
    if (!image) return
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    const perform = async () => {
      try {
          const liked = await toggleLike({ imageId: image.id, userId: user.uid })
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
        console.error(error)
        toast.error('Could not like this prompt')
      }
    }

    if (Math.random() < 0.5) {
      triggerAdRedirect({
        actionLabel: 'finish liking this prompt',
        redirectUrl: DEFAULT_REDIRECTS.like,
        duration: 4000,
        postId: image.id,
        onComplete: perform,
      })
    } else {
      perform()
    }
  }

  const handleCopy = (image) => {
    if (!image) return
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    const perform = async () => {
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
    }

    triggerAdRedirect({
      actionLabel: 'copy this prompt',
      redirectUrl: DEFAULT_REDIRECTS.copy,
      duration: 5000,
      postId: image.id,
      onComplete: perform,
    })
  }

  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Discover this StrangePrompt upload', url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied for sharing')
      }
      if (selectedImage?.id) {
        await incrementShare(selectedImage.id)
        try {
          await scheduleNotification({
            userId: selectedImage.creatorId,
            type: 'share',
            imageId: selectedImage.id,
            message: `${user?.displayName || 'Someone'} shared your upload`,
          })
        } catch (err) {
          console.error('Failed to send share notification', err)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReport = async (image) => {
    if (!image) return
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    setReportTarget(image)
    setReportModalOpen(true)
  }

  return (
    <>
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={closeAuthModal}
        onSwitchMode={(mode) => openAuthModal(mode)}
      />

      <AdRedirectModal
        isOpen={adRedirect.isOpen}
        actionLabel={adRedirect.actionLabel}
        redirectUrl={adRedirect.redirectUrl}
        duration={adRedirect.duration}
        onClose={clearAdRedirect}
        onCompleted={completeAdRedirect}
      />

      <ImageDetailModal
        image={selectedImage}
        relatedImages={relatedImages}
        onClose={closeImageDetail}
        onLike={handleLike}
        onCopy={handleCopy}
        onReport={handleReport}
        onShare={handleShare}
        onOpenRelated={(image) => {
          if (!image) return
          triggerAdRedirect({
            actionLabel: 'view this related prompt',
            redirectUrl: DEFAULT_REDIRECTS.profile,
            duration: 3000,
              postId: image.id,
              onComplete: () => {
              closeImageDetail()
              setTimeout(() => openImageDetail(image), 200)
            },
          })
        }}
      />
      <ReportModal
        isOpen={reportModalOpen}
        image={reportTarget}
        reporterId={user?.uid}
        onClose={() => {
          setReportModalOpen(false)
          setReportTarget(null)
        }}
      />
    </>
  )
}
