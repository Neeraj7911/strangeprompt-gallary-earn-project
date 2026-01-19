export function formatNumber(value) {
  if (value === undefined || value === null) return '0'
  if (value < 1000) return `${value}`
  if (value < 1000000) return `${(value / 1000).toFixed(1)}k`
  return `${(value / 1000000).toFixed(1)}m`
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function estimateEarnings({ views = 0, copies = 0, shares = 0 }) {
  // Lowered view rate to reduce estimated earnings from ad views
  const viewRate = 0.15
  const copyRate = 0.15
  const shareRate = 0.15
  const total = views * viewRate + copies * copyRate + shares * shareRate
  return Number(total.toFixed(2))
}

export function truncatePrompt(prompt, length = 90) {
  if (!prompt) return ''
  if (prompt.length <= length) return prompt
  return `${prompt.slice(0, length)}…`
}
