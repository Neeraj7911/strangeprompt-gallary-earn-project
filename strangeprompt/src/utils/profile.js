export const REQUIRED_PROFILE_LABELS = {
  displayName: 'Display name',
  placementsCell: 'Placements cell',
  headline: 'Headline',
  website: 'Website',
  country: 'Country',
  bio: 'Bio',
  username: 'Username',
  upiId: 'UPI ID',
  aadhaarNumber: 'Aadhaar number',
  social: 'Social profile link',
}

export const SOCIAL_PLATFORM_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourhandle' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://twitter.com/yourhandle' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@yourhandle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/yourhandle' },
]

const WEBSITE_REGEX = /^https?:\/\//i

export function hasValidSocialLink(socialLinks = {}) {
  return SOCIAL_PLATFORM_FIELDS.some(({ key }) => {
    const value = socialLinks[key]
    return typeof value === 'string' && value.trim().length > 0
  })
}

export function getMissingProfileFields(profile) {
  if (!profile) {
    return [
      REQUIRED_PROFILE_LABELS.displayName,
      REQUIRED_PROFILE_LABELS.placementsCell,
      REQUIRED_PROFILE_LABELS.headline,
      REQUIRED_PROFILE_LABELS.website,
      REQUIRED_PROFILE_LABELS.country,
      REQUIRED_PROFILE_LABELS.bio,
      REQUIRED_PROFILE_LABELS.username,
      REQUIRED_PROFILE_LABELS.social,
    ]
  }

  const missing = []

  const trimmedDisplayName = profile.displayName?.toString().trim()
  if (!trimmedDisplayName) {
    missing.push(REQUIRED_PROFILE_LABELS.displayName)
  }

  const trimmedPlacementsCell = profile.placementsCell?.toString().trim()
  if (!trimmedPlacementsCell) {
    missing.push(REQUIRED_PROFILE_LABELS.placementsCell)
  }

  const trimmedHeadline = profile.headline?.toString().trim()
  if (!trimmedHeadline) {
    missing.push(REQUIRED_PROFILE_LABELS.headline)
  }

  const website = profile.website?.toString().trim()
  if (!website || !WEBSITE_REGEX.test(website)) {
    missing.push(REQUIRED_PROFILE_LABELS.website)
  }

  const country = profile.country?.toString().trim()
  if (!country) {
    missing.push(REQUIRED_PROFILE_LABELS.country)
  }

  const bio = profile.bio?.toString().trim()
  if (!bio) {
    missing.push(REQUIRED_PROFILE_LABELS.bio)
  }

  const username = profile.username?.toString().trim()
  if (!username) {
    missing.push(REQUIRED_PROFILE_LABELS.username)
  }

  const isIndian = country?.toUpperCase() === 'IN' || country?.toLowerCase() === 'india'
  if (isIndian) {
    const upiId = profile.upiId?.toString().trim()
    if (!upiId) {
      missing.push(REQUIRED_PROFILE_LABELS.upiId)
    }
    const aadhaarNumber = profile.aadhaarNumber?.toString().trim()
    if (!aadhaarNumber) {
      missing.push(REQUIRED_PROFILE_LABELS.aadhaarNumber)
    }
  }

  if (!hasValidSocialLink(profile.socialLinks)) {
    missing.push(REQUIRED_PROFILE_LABELS.social)
  }

  return Array.from(new Set(missing))
}

export function isProfileComplete(profile) {
  return getMissingProfileFields(profile).length === 0
}
