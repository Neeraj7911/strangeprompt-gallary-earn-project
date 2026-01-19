const MODES = [
  { id: 'full', label: 'Full width' },
  { id: 'masonry', label: 'Masonry' },
]

export default function ViewModeToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#140d15]/80 p-1 text-xs font-semibold text-brand-200 shadow-[0_24px_70px_-40px_rgba(229,9,20,0.6)]">
      {MODES.map((mode) => {
        const isActive = value === mode.id
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange && onChange(mode.id)}
            className={`rounded-full px-4 py-2 transition ${
              isActive
                ? 'bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 text-white shadow-[0_16px_44px_-24px_rgba(229,9,20,0.7)]'
                : 'text-brand-200/70 hover:text-brand-100'
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
