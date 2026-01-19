import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { updateUsername } from '../firebase/firestore'
import { changeUserPassword, updateAuthDisplayName } from '../firebase/auth'
import { getMissingProfileFields, isProfileComplete, SOCIAL_PLATFORM_FIELDS, REQUIRED_PROFILE_LABELS } from '../utils/profile'

const COUNTRY_OPTIONS = [
  { code: '', label: 'Select country' },
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'SG', label: 'Singapore' },
  { code: 'JP', label: 'Japan' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ZA', label: 'South Africa' },
]

const WEBSITE_REGEX = /^https?:\/\//i

const EMPTY_SOCIAL_LINKS = SOCIAL_PLATFORM_FIELDS.reduce((accumulator, { key }) => {
  return { ...accumulator, [key]: '' }
}, {})

export default function AccountSettingsPage() {
  const { user, profile, updateProfile, refreshProfile, initializing } = useAuth()
  const [basicState, setBasicState] = useState({
    displayName: '',
    placementsCell: '',
    headline: '',
    bio: '',
    website: '',
    country: '',
    upiId: '',
    aadhaarNumber: '',
  })
  const [socialState, setSocialState] = useState(() => ({ ...EMPTY_SOCIAL_LINKS }))
  const [usernameDraft, setUsernameDraft] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [passwordState, setPasswordState] = useState({ current: '', next: '', confirm: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileAttempted, setProfileAttempted] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const canChangePassword = Boolean(user?.providerData?.some((provider) => provider.providerId === 'password'))

  useEffect(() => {
    if (!user || profile || profileAttempted) return
    let active = true
    setProfileAttempted(true)
    refreshProfile()
      .then((result) => {
        if (!active) return
        if (!result) {
          setProfileError(new Error('Profile document not found.'))
        }
      })
      .catch((error) => {
        if (!active) return
        const normalized =
          error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unable to load profile.')
        setProfileError(normalized)
      })
    return () => {
      active = false
    }
  }, [user, profile, profileAttempted, refreshProfile])

  useEffect(() => {
    if (profile) {
      setProfileError(null)
      setProfileAttempted(false)
    }
  }, [profile])

  useEffect(() => {
    if (!profile) return
    setBasicState({
      displayName: profile.displayName || '',
      placementsCell: profile.placementsCell || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      website: profile.website || '',
      country: profile.country || '',
      upiId: profile.upiId || '',
      aadhaarNumber: profile.aadhaarNumber || '',
    })
    setSocialState(() => {
      const incoming = profile.socialLinks || {}
      return SOCIAL_PLATFORM_FIELDS.reduce((accumulator, { key }) => {
        return { ...accumulator, [key]: incoming[key] || '' }
      }, {})
    })
    setUsernameDraft(profile.username || '')
  }, [profile])

  const missingFields = useMemo(() => getMissingProfileFields(profile), [profile])
  const profileShareUrl = useMemo(() => {
    const slug = profile?.username || user?.uid || ''
    if (!slug) return ''
    if (typeof window === 'undefined') {
      return `https://strangeprompt.com/profile/${slug}`
    }
    const origin = window.location.origin.replace(/\/$/, '')
    return `${origin}/profile/${slug}`
  }, [profile?.username, user?.uid])

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    if (!user) return
    const trimmedName = basicState.displayName.trim()
    if (!trimmedName) {
      toast.error('Display name is required')
      return
    }

    const trimmedPlacementsCell = basicState.placementsCell.trim()
    if (!trimmedPlacementsCell) {
      toast.error('Placements cell is required')
      return
    }

    const trimmedHeadline = basicState.headline.trim()
    if (!trimmedHeadline) {
      toast.error('Headline is required')
      return
    }

    const trimmedWebsite = basicState.website.trim()
    if (!trimmedWebsite || !WEBSITE_REGEX.test(trimmedWebsite)) {
      toast.error('Use a full https:// link for your website')
      return
    }

    const selectedCountry = basicState.country?.toString().trim()
    if (!selectedCountry) {
      toast.error('Select your country')
      return
    }

    const trimmedBio = basicState.bio.trim()
    if (!trimmedBio) {
      toast.error('Bio cannot be empty')
      return
    }

    const trimmedSocialLinks = SOCIAL_PLATFORM_FIELDS.reduce((accumulator, { key }) => {
      const value = socialState[key]?.toString().trim()
      if (value) {
        accumulator[key] = value
      }
      return accumulator
    }, {})

    const hasSocialLink = Object.keys(trimmedSocialLinks).length > 0
    if (!hasSocialLink) {
      toast.error('Add at least one social profile link')
      return
    }

    setSavingProfile(true)
    try {
      const nextProfileCheck = {
        ...profile,
        ...basicState,
        displayName: trimmedName,
        placementsCell: trimmedPlacementsCell,
        headline: trimmedHeadline,
        bio: trimmedBio,
        website: trimmedWebsite,
        country: selectedCountry,
        upiId: basicState.upiId.trim(),
        aadhaarNumber: basicState.aadhaarNumber.trim(),
        socialLinks: trimmedSocialLinks,
        username: profile?.username,
      }

      const pendingFields = getMissingProfileFields(nextProfileCheck).filter(
        (label) => label !== REQUIRED_PROFILE_LABELS.username,
      )
      if (pendingFields.length > 0) {
        toast.error(`Complete required fields: ${pendingFields.slice(0, 3).join(', ')}`)
        return
      }
      await updateProfile({
        displayName: trimmedName,
        placementsCell: trimmedPlacementsCell,
        headline: trimmedHeadline,
        bio: trimmedBio,
        website: trimmedWebsite,
        country: selectedCountry,
        upiId: basicState.upiId.trim(),
        aadhaarNumber: basicState.aadhaarNumber.trim(),
        socialLinks: trimmedSocialLinks,
        profileCompletionStatus: isProfileComplete(nextProfileCheck),
      })
      if (user.displayName !== trimmedName) {
        await updateAuthDisplayName(trimmedName)
      }
      await refreshProfile()
      toast.success('Profile details updated')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUsernameSave = async (event) => {
    event.preventDefault()
    if (!user) return
    const trimmed = usernameDraft.trim()
    if (!trimmed) {
      toast.error('Username cannot be empty')
      return
    }
    if (trimmed === profile?.username) {
      toast.success('Username updated')
      return
    }

    setSavingUsername(true)
    try {
      const assigned = await updateUsername(user.uid, trimmed)
      await refreshProfile()
      setUsernameDraft(assigned)
      toast.success('Username updated')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Unable to update username')
    } finally {
      setSavingUsername(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (!canChangePassword) return
    if (!passwordState.current || !passwordState.next || !passwordState.confirm) {
      toast.error('Fill all password fields')
      return
    }
    if (passwordState.next !== passwordState.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordState.next.length < 8) {
      toast.error('Use at least 8 characters')
      return
    }

    setSavingPassword(true)
    try {
      await changeUserPassword({ currentPassword: passwordState.current, newPassword: passwordState.next })
      setPasswordState({ current: '', next: '', confirm: '' })
      toast.success('Password updated')
    } catch (error) {
      console.error(error)
      const message = error.code === 'auth/wrong-password' ? 'Current password is incorrect' : error.message || 'Unable to update password'
      toast.error(message)
    } finally {
      setSavingPassword(false)
    }
  }

  if (!profile) {
    if (profileError && !initializing) {
      return (
        <div className="space-y-4 rounded-3xl bg-[#18101c]/85 p-10 text-center text-brand-200/80 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
          <h1 className="text-xl font-semibold text-brand-50">Account settings unavailable</h1>
          <p className="text-sm text-brand-200/70">
            We could not load your creator profile. Confirm that your Firestore rules allow you to read and write{' '}
            <span className="font-semibold">users/&#123;uid&#125;</span> and <span className="font-semibold">usernames/&#123;handle&#125;</span> documents, then reload this page.
          </p>
          <p className="text-xs text-brand-200/55">
            Error: {profileError.message || 'Missing or insufficient permissions.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setProfileError(null)
              setProfileAttempted(false)
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-black hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
          >
            Try again
          </button>
        </div>
      )
    }
    return (
      <div className="rounded-3xl bg-[#18101c]/85 p-10 text-center text-brand-200/75 shadow-[0_34px_92px_-54px_rgba(229,9,20,0.62)]">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-16 text-brand-200/85">
      <header className="rounded-3xl bg-[#140d15]/85 p-8 shadow-[0_38px_100px_-60px_rgba(229,9,20,0.65)]">
        <h1 className="text-2xl font-semibold text-brand-50">Account settings</h1>
        <p className="mt-2 text-sm text-brand-200/75">Update your identity, payout information, and security preferences.</p>
        {missingFields.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-xs text-amber-100">
            <p className="font-semibold uppercase tracking-[0.32em] text-amber-200/80">Action required</p>
            <p className="mt-2 text-amber-100">
              Complete the following before you can publish: {missingFields.join(', ')}.
            </p>
          </div>
        )}
      </header>

      <section className="rounded-3xl bg-[#18101c]/85 p-8 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
        <form className="space-y-6" onSubmit={handleSaveProfile}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Display name" htmlFor="settings-displayName">
              <input
                id="settings-displayName"
                type="text"
                value={basicState.displayName}
                onChange={(event) => setBasicState((prev) => ({ ...prev, displayName: event.target.value.slice(0, 60) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                maxLength={60}
              />
            </Field>
            <Field label="Placements cell" htmlFor="settings-placements" hint="Share the email or phone your sponsor placements team uses.">
              <input
                id="settings-placements"
                type="text"
                placeholder="placements@studio.com"
                value={basicState.placementsCell}
                onChange={(event) => setBasicState((prev) => ({ ...prev, placementsCell: event.target.value.slice(0, 120) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                maxLength={120}
              />
            </Field>
            <Field label="Headline" htmlFor="settings-headline">
              <input
                id="settings-headline"
                type="text"
                value={basicState.headline}
                onChange={(event) => setBasicState((prev) => ({ ...prev, headline: event.target.value.slice(0, 80) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                maxLength={80}
              />
            </Field>
            <Field label="Website" htmlFor="settings-website">
              <input
                id="settings-website"
                type="url"
                placeholder="https://yourstudio.com"
                value={basicState.website}
                onChange={(event) => setBasicState((prev) => ({ ...prev, website: event.target.value.slice(0, 120) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                maxLength={120}
              />
            </Field>
            <Field label="Country" htmlFor="settings-country">
              <select
                id="settings-country"
                value={basicState.country}
                onChange={(event) => setBasicState((prev) => ({ ...prev, country: event.target.value }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Bio" htmlFor="settings-bio">
            <textarea
              id="settings-bio"
              rows={4}
              value={basicState.bio}
              onChange={(event) => setBasicState((prev) => ({ ...prev, bio: event.target.value.slice(0, 240) }))}
              className="w-full rounded-2xl border border-brand-500/20 bg-[#140d15] px-4 py-3 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              maxLength={240}
            />
            <p className="mt-1 text-right text-[10px] text-brand-200/60">{basicState.bio.length}/240</p>
          </Field>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-200/65">Social reach</p>
            <p className="text-xs text-brand-200/55">Share at least one social profile so sponsors can contact you directly.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {SOCIAL_PLATFORM_FIELDS.map(({ key, label, placeholder }) => (
                <Field key={key} label={label} htmlFor={`settings-social-${key}`}>
                  <input
                    id={`settings-social-${key}`}
                    type="text"
                    placeholder={placeholder}
                    value={socialState[key]}
                    onChange={(event) =>
                      setSocialState((prev) => ({
                        ...prev,
                        [key]: event.target.value.slice(0, 160),
                      }))
                    }
                    className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    maxLength={160}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="UPI ID" htmlFor="settings-upi">
              <input
                id="settings-upi"
                type="text"
                placeholder="name@bank"
                value={basicState.upiId}
                onChange={(event) => setBasicState((prev) => ({ ...prev, upiId: event.target.value.slice(0, 80) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </Field>
            <Field label="Aadhaar number" htmlFor="settings-aadhaar" hint="Required for creators based in India">
              <input
                id="settings-aadhaar"
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={basicState.aadhaarNumber}
                onChange={(event) => setBasicState((prev) => ({ ...prev, aadhaarNumber: event.target.value.replace(/[^0-9-]/g, '').slice(0, 14) }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 px-6 py-2 text-sm font-semibold text-white shadow-[0_24px_60px_-32px_rgba(229,9,20,0.65)] transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
        {profileShareUrl && (
          <div className="mt-4 space-y-2 rounded-3xl border border-brand-500/20 bg-[#140d15]/70 px-5 py-4 text-xs text-brand-200/75">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-semibold text-brand-50">{profileShareUrl}</span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (typeof navigator === 'undefined' || !navigator.clipboard) {
                      throw new Error('Clipboard unavailable')
                    }
                    await navigator.clipboard.writeText(profileShareUrl)
                    toast.success('Profile link copied')
                  } catch (error) {
                    console.error(error)
                    toast.error('Unable to copy link')
                  }
                }}
                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
              >
                Copy link
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-brand-200/55">Public profile URL</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-[#18101c]/85 p-8 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
        <form className="space-y-4" onSubmit={handleUsernameSave}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-200/65">Username</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-200/45">@</span>
              <input
                type="text"
                value={usernameDraft}
                onChange={(event) => {
                  const normalized = event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                  setUsernameDraft(normalized.slice(0, 24))
                }}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] py-2 pl-8 pr-4 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                maxLength={24}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#140d15] px-5 py-2 text-sm font-semibold text-brand-50 ring-1 ring-brand-500/30 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={savingUsername}
            >
              {savingUsername ? 'Saving…' : 'Update username'}
            </button>
          </div>
          <p className="text-xs text-brand-200/60">You can change your username up to five times. Letters, numbers, and hyphens only.</p>
        </form>
      </section>

      <section className="rounded-3xl bg-[#18101c]/85 p-8 shadow-[0_36px_96px_-52px_rgba(229,9,20,0.7)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-200/65">Security</h2>
          {!canChangePassword && <span className="text-xs text-brand-200/60">Managed by your provider</span>}
        </div>
        {canChangePassword ? (
          <form className="mt-4 space-y-4" onSubmit={handlePasswordChange}>
            <Field label="Current password" htmlFor="settings-currentPassword">
              <input
                id="settings-currentPassword"
                type="password"
                value={passwordState.current}
                onChange={(event) => setPasswordState((prev) => ({ ...prev, current: event.target.value }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </Field>
            <Field label="New password" htmlFor="settings-newPassword">
              <input
                id="settings-newPassword"
                type="password"
                value={passwordState.next}
                onChange={(event) => setPasswordState((prev) => ({ ...prev, next: event.target.value }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </Field>
            <Field label="Confirm new password" htmlFor="settings-confirmPassword">
              <input
                id="settings-confirmPassword"
                type="password"
                value={passwordState.confirm}
                onChange={(event) => setPasswordState((prev) => ({ ...prev, confirm: event.target.value }))}
                className="w-full rounded-full border border-brand-500/20 bg-[#140d15] px-4 py-2 text-sm text-brand-50 focus:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </Field>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 px-6 py-2 text-sm font-semibold text-white shadow-[0_24px_60px_-32px_rgba(229,9,20,0.65)] transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 text-xs text-brand-200/70">Password is managed by your social login provider. Use their security settings to update it.</p>
        )}
      </section>
    </div>
  )
}

function Field({ label, htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm text-brand-200/80">
      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-200/65">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1 text-xs text-brand-200/55">{hint}</p>}
    </label>
  )
}
