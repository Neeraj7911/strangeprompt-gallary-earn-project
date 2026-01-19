import { formatDate } from '../utils/format'

export default function CommunityFeed({ items = [], onOpen }) {
  if (!items.length) return null

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen && onOpen(item)}
          className="w-64 flex-shrink-0 overflow-hidden rounded-3xl bg-[#18101c]/85 text-left text-brand-200/80 shadow-[0_26px_70px_-38px_rgba(229,9,20,0.65)] transition hover:-translate-y-1 hover:shadow-[0_36px_96px_-46px_rgba(229,9,20,0.75)]"
        >
          <img
            src={item.imageUrl}
            alt={item.title ? `${item.title} artwork` : 'Community gallery artwork'}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
          <div className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200/70">{item.category}</p>
            <p className="text-sm text-brand-50/60">Prompt hidden — tap Copy prompt to use it.</p>
            <p className="text-[11px] text-brand-200/60">{formatDate(item.createdAt)}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
