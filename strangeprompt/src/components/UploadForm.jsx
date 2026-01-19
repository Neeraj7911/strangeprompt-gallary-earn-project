import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveImageMetadata } from '../firebase/firestore'
import { CATEGORIES, MAX_PROMPT_LENGTH, TAG_SUGGESTIONS } from '../utils/constants'
import { deriveSlugFromTitle, getShareSlugPreview, normalizeSlug, SHARE_SLUG_MAX_LENGTH } from '../utils/slug'
import { getMissingProfileFields } from '../utils/profile'

export default function UploadForm({ onUploaded }) {
  const { user, profile } = useAuth()
  const [imageUrl, setImageUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [tags, setTags] = useState([])
  const [category, setCategory] = useState('Explore')
  const [uploading, setUploading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [shareSlug, setShareSlug] = useState('')

  const profileRequirements = useMemo(() => {
    const missing = getMissingProfileFields(profile)
    return {
      isComplete: missing.length === 0,
      missing,
    }
  }, [profile])

  const handleAddTag = (tag) => {
    setTags((prev) => {
      if (prev.includes(tag)) return prev
      return [...prev, tag]
    })
  }

  const handleRemoveTag = (tag) => {
    setTags((prev) => prev.filter((item) => item !== tag))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) {
      toast.error('Please sign in to upload')
      return
    }
    if (!profileRequirements.isComplete) {
      toast.error('Complete your account settings before publishing')
      return
    }
    if (!imageUrl.trim()) {
      toast.error('Paste an image address first')
      return
    }
    if (!/^https?:\/\//i.test(imageUrl.trim())) {
      toast.error('Use a valid http(s) image URL')
      return
    }
    if (!prompt.trim()) {
      toast.error('Prompt cannot be empty')
      return
    }

    setUploading(true)

    try {
      const desiredSlug = normalizeSlug(shareSlug).slice(0, SHARE_SLUG_MAX_LENGTH)

      const metadata = await saveImageMetadata({
        prompt: prompt.trim(),
        tags,
        category,
        imageUrl: imageUrl.trim(),
        storagePath: null,
        creator: user,
        creatorProfile: profile,
        width: null,
        height: null,
        shareSlug: desiredSlug,
      })

      toast.success('Upload complete')
      setImageUrl('')
      setPrompt('')
      setTags([])
      setPreviewError(false)
      setShareSlug('')
      if (onUploaded) onUploaded({ id: metadata.id, imageUrl: metadata.imageUrl })
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-[#18101c]/85 p-8 text-brand-200/80 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
      {!profileRequirements.isComplete && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-xs text-amber-100">
          <p className="font-semibold uppercase tracking-[0.32em] text-amber-200/80">Finish your account setup</p>
          <p className="mt-2">
            Add your {profileRequirements.missing.join(', ')} in the{' '}
            <Link to="/profile/settings" className="font-semibold text-amber-50 underline-offset-2 hover:underline">
              account settings
            </Link>{' '}
            before submitting new prompts.
          </p>
        </div>
      )}

      <div className="space-y-3 rounded-2xl bg-brand-500/10 px-4 py-4 text-xs text-brand-200">
        <p>
          Hosting images? Paste any public image link from your CDN, storage bucket, or favourite AI image generator (Midjourney, DALL-E, Leonardo, etc.). We will stream it directly—no manual uploads required.
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-200/70">
          Every submission is reviewed by the StrangePrompt review team before it goes live.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="prompt">
          Prompt description
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value.slice(0, MAX_PROMPT_LENGTH))}
          placeholder="Share the full prompt you used elsewhere"
          rows={4}
          className="w-full rounded-2xl bg-[#1a111d]/85 px-4 py-3 text-sm text-brand-50 shadow-[0_20px_52px_-30px_rgba(229,9,20,0.62)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
          maxLength={MAX_PROMPT_LENGTH}
          required
        />
        <p className="text-right text-[10px] text-brand-200/60">
          {prompt.length}/{MAX_PROMPT_LENGTH} characters
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="shareSlug">
          Share link (optional)
        </label>
        <div className="flex items-center gap-2 rounded-full bg-[#1a111d]/85 px-4 py-3 text-sm text-brand-50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus-within:ring-2 focus-within:ring-brand-400/70">
          <span className="text-xs uppercase tracking-[0.35em] text-brand-200/50">/image/</span>
          <input
            id="shareSlug"
            type="text"
            value={shareSlug}
            onChange={(event) => setShareSlug(normalizeSlug(event.target.value).slice(0, SHARE_SLUG_MAX_LENGTH))}
            placeholder={deriveSlugFromTitle(prompt || 'your-title')}
            className="flex-1 bg-transparent text-sm text-brand-50 placeholder-brand-200/50 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <p className="text-[10px] text-brand-200/60">
          Preview: {typeof window !== 'undefined' ? `${window.location.origin}/image/` : ''}
          {getShareSlugPreview({ desiredSlug: shareSlug, title: prompt })}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-full bg-[#1a111d]/85 px-4 py-2 text-sm text-brand-50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/70">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-50"
            >
              #{tag} ×
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-brand-200/70">
          {TAG_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="rounded-full bg-black/60 px-3 py-1 transition hover:bg-brand-500/20"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-brand-200/70" htmlFor="imageUrl">
            Image address (https://...)
          </label>
          <div className="relative group">
            <button
              type="button"
              aria-label="How to find an image address"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-500/40 text-[10px] font-semibold text-brand-200/80 transition group-hover:border-brand-400 group-hover:text-brand-200"
            >
              ?
            </button>
            <div className="pointer-events-none absolute right-0 top-8 hidden w-64 rounded-2xl border border-brand-500/30 bg-[#1a111d]/95 p-4 text-xs text-brand-50 shadow-[0_28px_70px_-32px_rgba(229,9,20,0.72)] group-hover:block group-focus-within:block">
              <p className="font-semibold uppercase tracking-[0.28em] text-brand-200/70">Need a direct link?</p>
              <p className="mt-2 text-[11px] text-brand-200/70">
                Copy the image URL from your AI generator (right-click → Copy image address). Drop it here—we will handle the rest.
              </p>
              <div className="mt-3 h-28 w-full overflow-hidden rounded-xl bg-black/40" aria-hidden="true">
                {/* TODO: Replace background with instructional GIF */}
                <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.25),transparent_70%)]" />
              </div>
            </div>
          </div>
        </div>
        <input
          id="imageUrl"
          type="url"
          placeholder="https://cdn.example.com/your-image.jpg"
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value)
            setPreviewError(false)
          }}
          className="w-full rounded-full bg-[#1a111d]/85 px-4 py-3 text-sm text-brand-50 placeholder-brand-200/50 shadow-[0_18px_48px_-28px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-brand-400/70"
          required
        />
        {imageUrl && (
          <div className="overflow-hidden rounded-3xl bg-[#140d15]/80">
            {previewError ? (
              <div className="px-4 py-6 text-center text-xs text-brand-200">
                We could not load that address. Double-check the URL and that it allows hotlinking.
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Preview"
                className="h-48 w-full object-cover"
                onError={() => setPreviewError(true)}
              />
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading || !profileRequirements.isComplete}
        className="w-full rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 py-3 text-sm font-semibold text-white shadow-[0_28px_70px_-32px_rgba(229,9,20,0.72)] transition hover:from-brand-400 hover:via-brand-500 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {uploading ? 'Submitting…' : 'Submit for approval'}
      </button>
    </form>
  )
}
