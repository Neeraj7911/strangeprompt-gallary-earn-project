export default function NotificationsPanel({
  notifications = [],
  loading = false,
  error = null,
  onNext = () => {},
  onPrevious = () => {},
  hasMore = false,
  hasPrevious = false,
}) {
  const isEmpty = !loading && !notifications.length

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          {error}
        </div>
      )}

      {loading && !notifications.length ? (
        <div className="rounded-3xl bg-[#18101c]/85 p-8 text-center text-sm text-brand-200/70 shadow-[0_30px_80px_-50px_rgba(229,9,20,0.6)]">
          Loading updates…
        </div>
      ) : null}

      {isEmpty && !error ? (
        <div className="rounded-3xl bg-[#18101c]/85 p-8 text-center text-sm text-brand-200/75 shadow-[0_30px_80px_-50px_rgba(229,9,20,0.6)]">
          No updates yet. We will let you know when your uploads gain traction.
        </div>
      ) : null}

      {!isEmpty && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-3xl bg-[#1a111d]/80 p-4 text-sm text-brand-200/80 shadow-[0_26px_70px_-40px_rgba(229,9,20,0.6)]"
            >
              <p>{notification.message}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-200/65">
                {notification.type} · {formatNotificationTimestamp(notification.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || loading}
          className="inline-flex items-center rounded-full border border-brand-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-200/75 transition hover:border-brand-400/50 hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMore || loading}
          className="inline-flex items-center rounded-full border border-brand-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-200/75 transition hover:border-brand-400/50 hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function formatNotificationTimestamp(createdAt) {
  if (!createdAt) return 'Just now'
  try {
    if (createdAt instanceof Date) {
      return createdAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    }
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    }
  } catch (error) {
    console.error('Failed to format notification timestamp', error)
  }
  return 'Just now'
}
