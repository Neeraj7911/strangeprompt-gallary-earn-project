import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import DashboardTable from '../components/DashboardTable'
import AnalyticsCharts from '../components/AnalyticsCharts'
import NotificationsPanel from '../components/NotificationsPanel'
import UploadForm from '../components/UploadForm'
import { estimateEarnings } from '../utils/format'
import {
  bumpEarningsForAction,
  scheduleNotification,
  subscribeToUserUploads,
  fetchNotificationsPage,
  purgeOldNotifications,
} from '../firebase/firestore'
import { useUI } from '../context/UIContext'
import { DEFAULT_REDIRECTS } from '../utils/constants'

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { triggerAdRedirect } = useUI()
  const NOTIFICATIONS_PAGE_SIZE = 5
  const [uploads, setUploads] = useState([])
  const [notificationPages, setNotificationPages] = useState([])
  const [currentNotificationPage, setCurrentNotificationPage] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState(null)

  const currentNotifications = notificationPages[currentNotificationPage]?.items || []
  const currentPageMeta = notificationPages[currentNotificationPage] || { hasMore: false }

  useEffect(() => {
    if (!user) return undefined
    const unsubscribeUploads = subscribeToUserUploads(
      user.uid,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data()
          const rawStatus = typeof data.status === 'string' ? data.status.trim().toLowerCase() : 'pending'
          const status = ['approved', 'pending', 'rejected'].includes(rawStatus) ? rawStatus : 'pending'
          return {
            id: doc.id,
            ...data,
            status,
            statusLabel:
              status === 'approved'
                ? 'Approved'
                : status === 'pending'
                  ? 'Pending review'
                  : status === 'rejected'
                    ? 'Needs changes'
                    : status || 'Unknown',
          }
        })
        setUploads(docs)
      },
      {
        includeAllStatuses: true,
        onError: (error) => {
          console.error(error)
          toast.error('Create the Firestore composite index on images: creatorId ASC, createdAt DESC.')
        },
      },
    )

    return () => {
      unsubscribeUploads?.()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setNotificationPages([])
      setCurrentNotificationPage(0)
      return undefined
    }

    let active = true
    const loadNotifications = async () => {
      setNotificationsLoading(true)
      setNotificationsError(null)
      try {
        await purgeOldNotifications({ userId: user.uid, olderThanDays: 60 })
      } catch (error) {
        console.error('Failed to purge outdated notifications', error)
      }

      try {
        const page = await fetchNotificationsPage({ userId: user.uid, limitTo: NOTIFICATIONS_PAGE_SIZE })
        if (!active) return
        const normalizedPage = page.items.length || page.hasMore ? page : { items: [], cursorDoc: null, hasMore: false }
        setNotificationPages([normalizedPage])
        setCurrentNotificationPage(0)
      } catch (error) {
        console.error(error)
        if (active) {
          setNotificationsError('Unable to load updates right now.')
          setNotificationPages([{ items: [], cursorDoc: null, hasMore: false }])
        }
      } finally {
        if (active) {
          setNotificationsLoading(false)
        }
      }
    }

    loadNotifications()

    return () => {
      active = false
    }
  }, [user])

  const handleNotificationNext = async () => {
    const nextIndex = currentNotificationPage + 1
    const existing = notificationPages[nextIndex]
    if (existing) {
      setCurrentNotificationPage(nextIndex)
      return
    }

    const lastPage = notificationPages[currentNotificationPage]
    if (!lastPage?.cursorDoc || !lastPage.hasMore || !user) return

    setNotificationsLoading(true)
    setNotificationsError(null)
    try {
      const nextPage = await fetchNotificationsPage({
        userId: user.uid,
        limitTo: NOTIFICATIONS_PAGE_SIZE,
        startAfterDoc: lastPage.cursorDoc,
      })
      const normalizedNextPage = nextPage.items.length || nextPage.hasMore ? nextPage : { items: [], cursorDoc: null, hasMore: false }
      setNotificationPages((prev) => [...prev, normalizedNextPage])
      setCurrentNotificationPage(nextIndex)
    } catch (error) {
      console.error(error)
      setNotificationsError('Unable to load more updates.')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handleNotificationPrevious = () => {
    if (currentNotificationPage === 0) return
    setCurrentNotificationPage((prev) => Math.max(prev - 1, 0))
  }

  useEffect(() => {
    if (!profile && user) {
      refreshProfile()
    }
  }, [profile, refreshProfile, user])

  const totals = useMemo(() => {
    const likeCount = uploads.reduce((sum, item) => sum + (item.likes || 0), 0)
    const copyCount = uploads.reduce((sum, item) => sum + (item.copies || 0), 0)
    const viewCount = uploads.reduce((sum, item) => sum + (item.views || 0), 0)
    const earningEstimate = uploads.reduce(
      (sum, item) => sum + estimateEarnings({ views: item.views, copies: item.copies, shares: item.shares }),
      0,
    )
    return { likeCount, copyCount, viewCount, earningEstimate }
  }, [uploads])

  const statusSummary = useMemo(() => {
    return uploads.reduce(
      (acc, item) => {
        const key = item.status || 'pending'
        if (key === 'approved') acc.approved += 1
        else if (key === 'rejected') acc.rejected += 1
        else acc.pending += 1
        return acc
      },
      { approved: 0, pending: 0, rejected: 0 },
    )
  }, [uploads])

  const handleBoost = () => {
    if (!user) return
    triggerAdRedirect({
      actionLabel: 'refresh analytics',
      redirectUrl: DEFAULT_REDIRECTS.profile,
      duration: 4000,
      onComplete: async () => {
        try {
          await bumpEarningsForAction(user.uid, 0.1)
          await scheduleNotification({
            userId: user.uid,
            type: 'boost',
            message: 'We applied a sponsor boost to your estimated earnings.',
          })
          toast.success('Boost applied')
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <div className="layout-shell space-y-10 pb-16 text-brand-200/85">
      <header className="flex flex-col gap-4 rounded-3xl bg-[#140d15]/85 p-8 shadow-[0_38px_100px_-60px_rgba(229,9,20,0.65)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-50">Creator dashboard</h1>
          <p className="mt-2 text-sm text-brand-200/80">Track how your prompts perform across the community.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-brand-200/80">
          <Metric label="Likes" value={totals.likeCount} />
          <Metric label="Copies" value={totals.copyCount} />
          <Metric label="Views" value={totals.viewCount} />
          <Metric label="Estimated earnings" value={`$${totals.earningEstimate.toFixed(2)}`} />
        </div>
      </header>

      {uploads.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <StatusSummaryCard label="Approved" value={statusSummary.approved} tone="emerald" description="Ready in gallery" />
          <StatusSummaryCard label="Pending review" value={statusSummary.pending} tone="amber" description="Waiting for team" />
          <StatusSummaryCard label="Needs changes" value={statusSummary.rejected} tone="rose" description="Requires updates" />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <UploadForm
          onUploaded={() => {
            toast.success('Submission received. We will notify you after review.')
          }}
        />
        <div className="rounded-3xl bg-[#18101c]/85 p-6 text-sm text-brand-200/75 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-200/65">Review tips</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-2xl border border-brand-500/15 bg-black/40 px-4 py-3">
              Use a public CDN link for your image. Local files are not supported yet.
            </li>
            <li className="rounded-2xl border border-brand-500/15 bg-black/40 px-4 py-3">
              Paste the exact prompt you ran so other creators can remix it without guesswork.
            </li>
            <li className="rounded-2xl border border-brand-500/15 bg-black/40 px-4 py-3">
              Add at least three tags to improve sponsor discovery and approval speed.
            </li>
          </ul>
        </div>
      </section>

      <DashboardTable uploads={uploads} />
      <AnalyticsCharts uploads={uploads} />

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl bg-[#18101c]/85 p-6 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-200/70">Updates</h2>
          <NotificationsPanel
            notifications={currentNotifications}
            loading={notificationsLoading}
            error={notificationsError}
            onNext={handleNotificationNext}
            onPrevious={handleNotificationPrevious}
            hasMore={Boolean(currentPageMeta?.hasMore)}
            hasPrevious={currentNotificationPage > 0}
          />
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-brand-500/15 via-brand-900/35 to-black/70 p-6 text-sm text-brand-200/80 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
          <h3 className="text-base font-semibold text-brand-50">Redirect earnings simulation</h3>
          <p className="mt-3">
            Earnings are estimated based on sponsor redirects triggered by your uploads. Increase your reach to grow this number.
          </p>
          <button
            type="button"
            onClick={handleBoost}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 py-2 text-sm font-semibold text-white shadow-[0_24px_60px_-28px_rgba(229,9,20,0.68)]"
          >
            Trigger sponsor boost
          </button>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <span className="inline-flex flex-col rounded-2xl bg-[#1a111d]/80 px-4 py-2 shadow-[0_24px_60px_-34px_rgba(229,9,20,0.6)]">
      <span className="text-[10px] uppercase tracking-widest text-brand-200/70">{label}</span>
      <span className="text-sm font-semibold text-brand-50">{value}</span>
    </span>
  )
}

function StatusSummaryCard({ label, value, tone, description }) {
  const toneStyles = {
    emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
    rose: 'border-rose-500/25 bg-rose-500/10 text-rose-200',
  }

  return (
    <div className={`rounded-3xl border px-5 py-4 text-sm shadow-[0_24px_70px_-40px_rgba(229,9,20,0.5)] ${toneStyles[tone] || 'border-brand-500/20 bg-brand-500/10 text-brand-200'}`}>
      <p className="text-[11px] uppercase tracking-[0.32em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-xs opacity-80">{description}</p>
    </div>
  )
}
