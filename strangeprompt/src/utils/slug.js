const SHARE_SLUG_MAX_LENGTH = 64

export function normalizeSlug(source = '') {
  if (!source) return ''
  return source
    .toString()
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SHARE_SLUG_MAX_LENGTH)
}

export function deriveSlugFromTitle(title = '', fallback = 'image') {
  const normalizedTitle = normalizeSlug(title)
  if (normalizedTitle) return normalizedTitle
  const normalizedFallback = normalizeSlug(fallback)
  return normalizedFallback || 'image'
}

export function getShareSlugPreview({ desiredSlug, title, fallback = 'image' }) {
  if (desiredSlug) {
    const normalized = normalizeSlug(desiredSlug)
    if (normalized) return normalized
  }
  return deriveSlugFromTitle(title, fallback)
}

export { SHARE_SLUG_MAX_LENGTH }
