import { formatDate, estimateEarnings } from '../utils/format'

export default function DashboardTable({ uploads }) {
  if (!uploads.length) {
    return (
      <div className="rounded-3xl bg-[#18101c]/85 p-10 text-center text-brand-200/75 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
        No uploads yet. Share your first prompt to unlock analytics.
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-[#1a111d]/85 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
      <div className="overflow-x-auto">
        <table className="min-w-[780px] divide-y divide-brand-900/40 text-left text-sm text-brand-200/80">
        <thead className="bg-[#140d15] text-xs uppercase tracking-widest text-brand-200/70">
          <tr>
            <th className="px-6 py-4 font-semibold">Upload</th>
            <th className="px-6 py-4 font-semibold">Prompt</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Likes</th>
            <th className="px-6 py-4 font-semibold">Copies</th>
            <th className="px-6 py-4 font-semibold">Views</th>
            <th className="px-6 py-4 font-semibold">Earnings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-900/40">
          {uploads.map((item) => (
            <tr key={item.id} className="transition hover:bg-brand-900/20">
              <td className="px-6 py-4">
                <img
                  src={item.imageUrl}
                  alt={item.title ? `${item.title} artwork` : 'Dashboard upload artwork'}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              </td>
              <td className="px-6 py-4 text-brand-200/60">Prompt hidden — use Copy prompt.</td>
              <td className="px-6 py-4">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-6 py-4 text-brand-200/70">{formatDate(item.createdAt)}</td>
              <td className="px-6 py-4 font-semibold text-brand-50">{item.likes || 0}</td>
              <td className="px-6 py-4 font-semibold text-brand-50">{item.copies || 0}</td>
              <td className="px-6 py-4 font-semibold text-brand-50">{item.views || 0}</td>
              <td className="px-6 py-4 font-semibold text-brand-300">
                ${estimateEarnings({ views: item.views, copies: item.copies, shares: item.shares })}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const normalized = typeof status === 'string' ? status.trim().toLowerCase() : 'pending'
  const presets = {
    pending: {
      label: 'Pending review',
      style: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
    },
    rejected: {
      label: 'Needs changes',
      style: 'bg-rose-500/15 text-rose-200 border border-rose-500/30',
    },
    approved: {
      label: 'Approved',
      style: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
    },
  }

  const fallbackLabel = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Unknown'
  const { label, style } = presets[normalized] || {
    label: fallbackLabel,
    style: 'bg-slate-500/15 text-slate-200 border border-slate-500/30',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${style}`}>
      {label}
    </span>
  )
}
