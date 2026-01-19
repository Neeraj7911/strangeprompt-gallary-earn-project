import { useEffect, useState } from 'react'

export default function SearchBar({ value, onChange, onSubmit }) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSubmit) onSubmit(localValue.trim())
  }

  const handleInput = (event) => {
    const nextValue = event.target.value
    setLocalValue(nextValue)
    if (onChange) onChange(nextValue)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-3 rounded-full bg-[#140d15]/85 p-2 pl-6 text-brand-200 shadow-[0_22px_60px_-34px_rgba(229,9,20,0.6)] transition focus-within:ring-2 focus-within:ring-brand-400/70 focus-within:shadow-[0_28px_70px_-36px_rgba(229,9,20,0.68)]"
    >
      <input
        type="search"
        value={localValue}
        onChange={handleInput}
        placeholder="Describe what you want to see"
        className="w-full bg-transparent text-sm text-brand-50 placeholder-brand-200/50 focus:outline-none"
        aria-label="Search prompts and image tags"
      />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:from-brand-400 hover:via-brand-500 hover:to-brand-700"
      >
        Generate
      </button>
    </form>
  )
}
