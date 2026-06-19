import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Camera,
  Download,
  Image as ImageIcon,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Card, SectionHeader } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

type SettingsForm = {
  name: string
  username: string
  email: string
  bio: string
  location: string
  website: string
  yearsRockhounding: string
  favoriteFinds: string
  collectorType: string
  experienceLevel: string
  profileVisibility: string
  showLocation: boolean
  showCollections: boolean
  showFindLocations: boolean
  showEmail: boolean
  showOnlineStatus: boolean
  searchEngineVisibility: boolean
  notifyNewFollowers: boolean
  notifyComments: boolean
  notifyMessages: boolean
  notifyCollectionLikes: boolean
  notifyChallengeCompletions: boolean
  notifyEventReminders: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  whoCanMessageMe: string
  whoCanFollowMe: string
  contentFilterLevel: string
  themePreference: string
  accessibilityMode: string
  fontSizePreference: string
}

const defaultSettings: SettingsForm = {
  name: '',
  username: '',
  email: '',
  bio: '',
  location: '',
  website: '',
  yearsRockhounding: '',
  favoriteFinds: '',
  collectorType: 'hobbyist',
  experienceLevel: 'beginner',
  profileVisibility: 'public',
  showLocation: true,
  showCollections: true,
  showFindLocations: false,
  showEmail: false,
  showOnlineStatus: true,
  searchEngineVisibility: false,
  notifyNewFollowers: true,
  notifyComments: true,
  notifyMessages: true,
  notifyCollectionLikes: true,
  notifyChallengeCompletions: true,
  notifyEventReminders: true,
  emailNotifications: true,
  pushNotifications: false,
  whoCanMessageMe: 'everyone',
  whoCanFollowMe: 'everyone',
  contentFilterLevel: 'standard',
  themePreference: 'system',
  accessibilityMode: 'standard',
  fontSizePreference: 'medium',
}

export default function Settings() {
  const auth = useAuthProfileState()
  const updateProfile = useMutation(api.users.updateProfile)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const getStorageUrl = useMutation(api.uploads.getStorageUrl)
  const [form, setForm] = useState<SettingsForm>(defaultSettings)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const profilePreviewUrl = useMemo(
    () => (profilePhoto ? URL.createObjectURL(profilePhoto) : profileImageUrl),
    [profilePhoto, profileImageUrl],
  )
  const coverPreviewUrl = useMemo(
    () => (coverPhoto ? URL.createObjectURL(coverPhoto) : coverImageUrl),
    [coverPhoto, coverImageUrl],
  )

  useEffect(() => {
    const user = auth.viewer?.user
    if (!user) return

    setForm({
      ...defaultSettings,
      name: user.name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      bio: user.bio ?? '',
      location: user.location ?? '',
      website: readString(user, 'website'),
      yearsRockhounding: user.yearsRockhounding?.toString() ?? '',
      favoriteFinds: readStringArray(user, 'favoriteFinds').join(', '),
      collectorType:
        readString(user, 'collectorType') || defaultSettings.collectorType,
      experienceLevel:
        readString(user, 'experienceLevel') || defaultSettings.experienceLevel,
      profileVisibility:
        readString(user, 'profileVisibility') ||
        defaultSettings.profileVisibility,
      showLocation: readBoolean(user, 'showLocation', true),
      showCollections: readBoolean(user, 'showCollections', true),
      showFindLocations: readBoolean(user, 'showFindLocations', false),
      showEmail: readBoolean(user, 'showEmail', false),
      showOnlineStatus: readBoolean(user, 'showOnlineStatus', true),
      searchEngineVisibility: readBoolean(
        user,
        'searchEngineVisibility',
        false,
      ),
      notifyNewFollowers: readBoolean(user, 'notifyNewFollowers', true),
      notifyComments: readBoolean(user, 'notifyComments', true),
      notifyMessages: readBoolean(user, 'notifyMessages', true),
      notifyCollectionLikes: readBoolean(user, 'notifyCollectionLikes', true),
      notifyChallengeCompletions: readBoolean(
        user,
        'notifyChallengeCompletions',
        true,
      ),
      notifyEventReminders: readBoolean(user, 'notifyEventReminders', true),
      emailNotifications: readBoolean(user, 'emailNotifications', true),
      pushNotifications: readBoolean(user, 'pushNotifications', false),
      whoCanMessageMe:
        readString(user, 'whoCanMessageMe') || defaultSettings.whoCanMessageMe,
      whoCanFollowMe:
        readString(user, 'whoCanFollowMe') || defaultSettings.whoCanFollowMe,
      contentFilterLevel:
        readString(user, 'contentFilterLevel') ||
        defaultSettings.contentFilterLevel,
      themePreference:
        readString(user, 'themePreference') || defaultSettings.themePreference,
      accessibilityMode:
        readString(user, 'accessibilityMode') ||
        defaultSettings.accessibilityMode,
      fontSizePreference:
        readString(user, 'fontSizePreference') ||
        defaultSettings.fontSizePreference,
    })
    setProfileImageUrl(readString(user, 'image'))
    setCoverImageUrl(readString(user, 'bannerImage'))
  }, [auth.viewer])

  useEffect(() => {
    return () => {
      if (profilePhoto && profilePreviewUrl)
        URL.revokeObjectURL(profilePreviewUrl)
      if (coverPhoto && coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPhoto, coverPreviewUrl, profilePhoto, profilePreviewUrl])

  const updateField = <Key extends keyof SettingsForm>(
    key: Key,
    value: SettingsForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSaving(true)

    try {
      if (profilePhoto || coverPhoto) setStatus('Uploading profile images...')
      const uploadedProfileImage = profilePhoto
        ? await uploadSettingsImage(
            profilePhoto,
            generateUploadUrl,
            getStorageUrl,
          )
        : profileImageUrl
      const uploadedCoverImage = coverPhoto
        ? await uploadSettingsImage(
            coverPhoto,
            generateUploadUrl,
            getStorageUrl,
          )
        : coverImageUrl

      setStatus('Saving settings...')
      await updateProfile({
        name: emptyToUndefined(form.name),
        username: normalizeHandle(form.username),
        email: emptyToUndefined(form.email),
        bio: emptyToUndefined(form.bio),
        location: emptyToUndefined(form.location),
        website: emptyToUndefined(form.website),
        yearsRockhounding: form.yearsRockhounding
          ? Number(form.yearsRockhounding)
          : undefined,
        favoriteFinds: splitList(form.favoriteFinds),
        collectorType: form.collectorType,
        experienceLevel: form.experienceLevel,
        image: emptyToUndefined(uploadedProfileImage),
        bannerImage: emptyToUndefined(uploadedCoverImage),
        profileVisibility: form.profileVisibility,
        showLocation: form.showLocation,
        showCollections: form.showCollections,
        showFindLocations: form.showFindLocations,
        showEmail: form.showEmail,
        showOnlineStatus: form.showOnlineStatus,
        searchEngineVisibility: form.searchEngineVisibility,
        notifyNewFollowers: form.notifyNewFollowers,
        notifyComments: form.notifyComments,
        notifyMessages: form.notifyMessages,
        notifyCollectionLikes: form.notifyCollectionLikes,
        notifyChallengeCompletions: form.notifyChallengeCompletions,
        notifyEventReminders: form.notifyEventReminders,
        emailNotifications: form.emailNotifications,
        pushNotifications: form.pushNotifications,
        whoCanMessageMe: form.whoCanMessageMe,
        whoCanFollowMe: form.whoCanFollowMe,
        contentFilterLevel: form.contentFilterLevel,
        themePreference: form.themePreference,
        accessibilityMode: form.accessibilityMode,
        fontSizePreference: form.fontSizePreference,
      })
      setProfileImageUrl(uploadedProfileImage)
      setCoverImageUrl(uploadedCoverImage)
      setProfilePhoto(null)
      setCoverPhoto(null)
      setStatus('Settings saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Settings could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (auth.isLoading) return <p className="empty-state">Loading settings...</p>

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Profile"
        title="Settings"
        description="Manage your account, public profile, privacy, notifications, community access, and appearance."
      />

      <form className="settings-form" onSubmit={handleSubmit}>
        <SettingsSection title="Account Settings">
          <div className="form-grid">
            <TextField
              label="Name"
              value={form.name}
              onChange={(value) => updateField('name', value)}
            />
            <TextField
              label="Username / Handle"
              value={form.username}
              onChange={(value) => updateField('username', value)}
            />
            <TextField
              label="Email address"
              type="email"
              value={form.email}
              onChange={(value) => updateField('email', value)}
            />
            <ReadOnlyAction
              label="Password"
              value="Use password reset from sign-in for now."
            />
            <ReadOnlyAction
              label="Two-factor authentication"
              value="Coming soon."
            />
            <ReadOnlyAction label="Connected accounts" value="Coming soon." />
          </div>
          <div className="settings-danger-row">
            <button type="button" disabled>
              <Trash2 aria-hidden="true" />
              Delete account
            </button>
            <button type="button" disabled>
              <Download aria-hidden="true" />
              Download my data
            </button>
          </div>
        </SettingsSection>

        <SettingsSection title="Public Profile Settings">
          <div className="profile-image-editor">
            <label className="profile-avatar-upload">
              <span className="profile-avatar-preview">
                {profilePreviewUrl ? (
                  <img src={profilePreviewUrl} alt="" />
                ) : (
                  <Camera aria-hidden="true" />
                )}
              </span>
              <strong>Profile photo</strong>
              <span>Shown on your Basecamp and posts.</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setProfilePhoto(event.target.files?.[0] ?? null)
                }
              />
            </label>
            <label className="profile-header-upload">
              <span className="profile-header-preview">
                {coverPreviewUrl ? (
                  <img src={coverPreviewUrl} alt="" />
                ) : (
                  <ImageIcon aria-hidden="true" />
                )}
              </span>
              <strong>Cover photo</strong>
              <span>Shown as your Basecamp header.</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setCoverPhoto(event.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>
          <label>
            Bio
            <textarea
              value={form.bio}
              rows={4}
              onChange={(event) => updateField('bio', event.target.value)}
            />
          </label>
          <div className="form-grid">
            <TextField
              label="Location"
              value={form.location}
              onChange={(value) => updateField('location', value)}
            />
            <TextField
              label="Website"
              value={form.website}
              onChange={(value) => updateField('website', value)}
            />
            <TextField
              label="Years collecting"
              type="number"
              value={form.yearsRockhounding}
              onChange={(value) => updateField('yearsRockhounding', value)}
            />
            <TextField
              label="Favorite finds"
              value={form.favoriteFinds}
              onChange={(value) => updateField('favoriteFinds', value)}
            />
            <SelectField
              label="Collector type"
              value={form.collectorType}
              options={[
                ['hobbyist', 'Hobbyist'],
                ['field_collector', 'Field collector'],
                ['lapidary', 'Lapidary'],
                ['educator', 'Educator'],
                ['shop_owner', 'Shop owner'],
              ]}
              onChange={(value) => updateField('collectorType', value)}
            />
            <SelectField
              label="Experience level"
              value={form.experienceLevel}
              options={[
                ['beginner', 'Beginner'],
                ['intermediate', 'Intermediate'],
                ['advanced', 'Advanced'],
                ['expert', 'Expert'],
              ]}
              onChange={(value) => updateField('experienceLevel', value)}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Privacy Settings">
          <SelectField
            label="Profile visibility"
            value={form.profileVisibility}
            options={[
              ['public', 'Public'],
              ['friends', 'Friends'],
              ['private', 'Private'],
            ]}
            onChange={(value) => updateField('profileVisibility', value)}
          />
          <ToggleGrid>
            <Toggle
              label="Show location"
              checked={form.showLocation}
              onChange={(value) => updateField('showLocation', value)}
            />
            <Toggle
              label="Show collections"
              checked={form.showCollections}
              onChange={(value) => updateField('showCollections', value)}
            />
            <Toggle
              label="Show find locations"
              checked={form.showFindLocations}
              onChange={(value) => updateField('showFindLocations', value)}
            />
            <Toggle
              label="Show email"
              checked={form.showEmail}
              onChange={(value) => updateField('showEmail', value)}
            />
            <Toggle
              label="Show online status"
              checked={form.showOnlineStatus}
              onChange={(value) => updateField('showOnlineStatus', value)}
            />
            <Toggle
              label="Search engine visibility"
              checked={form.searchEngineVisibility}
              onChange={(value) => updateField('searchEngineVisibility', value)}
            />
          </ToggleGrid>
        </SettingsSection>

        <SettingsSection title="Notification Settings">
          <ToggleGrid>
            <Toggle
              label="New followers"
              checked={form.notifyNewFollowers}
              onChange={(value) => updateField('notifyNewFollowers', value)}
            />
            <Toggle
              label="Comments"
              checked={form.notifyComments}
              onChange={(value) => updateField('notifyComments', value)}
            />
            <Toggle
              label="Messages"
              checked={form.notifyMessages}
              onChange={(value) => updateField('notifyMessages', value)}
            />
            <Toggle
              label="Collection likes"
              checked={form.notifyCollectionLikes}
              onChange={(value) => updateField('notifyCollectionLikes', value)}
            />
            <Toggle
              label="Challenge completions"
              checked={form.notifyChallengeCompletions}
              onChange={(value) =>
                updateField('notifyChallengeCompletions', value)
              }
            />
            <Toggle
              label="Event reminders"
              checked={form.notifyEventReminders}
              onChange={(value) => updateField('notifyEventReminders', value)}
            />
            <Toggle
              label="Email notifications"
              checked={form.emailNotifications}
              onChange={(value) => updateField('emailNotifications', value)}
            />
            <Toggle
              label="Push notifications"
              checked={form.pushNotifications}
              onChange={(value) => updateField('pushNotifications', value)}
            />
          </ToggleGrid>
        </SettingsSection>

        <SettingsSection title="Community Settings">
          <div className="form-grid">
            <SelectField
              label="Who can message me"
              value={form.whoCanMessageMe}
              options={[
                ['everyone', 'Everyone'],
                ['following', 'People I follow'],
                ['no_one', 'No one'],
              ]}
              onChange={(value) => updateField('whoCanMessageMe', value)}
            />
            <SelectField
              label="Who can follow me"
              value={form.whoCanFollowMe}
              options={[
                ['everyone', 'Everyone'],
                ['no_one', 'No one'],
              ]}
              onChange={(value) => updateField('whoCanFollowMe', value)}
            />
            <ReadOnlyAction
              label="Blocked users"
              value="Managed from member profiles for now."
            />
            <ReadOnlyAction label="Muted users" value="Coming soon." />
            <SelectField
              label="Content filters"
              value={form.contentFilterLevel}
              options={[
                ['standard', 'Standard'],
                ['strict', 'Strict'],
                ['off', 'Off'],
              ]}
              onChange={(value) => updateField('contentFilterLevel', value)}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Appearance Settings">
          <div className="form-grid">
            <SelectField
              label="Theme"
              value={form.themePreference}
              options={[
                ['light', 'Light mode'],
                ['dark', 'Dark mode'],
                ['system', 'System theme'],
              ]}
              onChange={(value) => updateField('themePreference', value)}
            />
            <SelectField
              label="Accessibility settings"
              value={form.accessibilityMode}
              options={[
                ['standard', 'Standard'],
                ['reduced_motion', 'Reduced motion'],
                ['high_contrast', 'High contrast'],
              ]}
              onChange={(value) => updateField('accessibilityMode', value)}
            />
            <SelectField
              label="Font size"
              value={form.fontSizePreference}
              options={[
                ['small', 'Small'],
                ['medium', 'Medium'],
                ['large', 'Large'],
              ]}
              onChange={(value) => updateField('fontSizePreference', value)}
            />
          </div>
        </SettingsSection>

        <div className="settings-save-bar">
          <span>{status}</span>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </section>
  )
}

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="settings-section">
      <h2>{title}</h2>
      {children}
    </Card>
  )
}

function TextField({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<[string, string]>
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleGrid({ children }: { children: React.ReactNode }) {
  return <div className="settings-toggle-grid">{children}</div>
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function ReadOnlyAction({ label, value }: { label: string; value: string }) {
  return (
    <div className="settings-readonly">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  )
}

async function uploadSettingsImage(
  file: File,
  generateUploadUrl: () => Promise<string>,
  getStorageUrl: (args: { storageId: Id<'_storage'> }) => Promise<string>,
) {
  const uploadUrl = await generateUploadUrl()
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) throw new Error('Photo upload failed.')
  const { storageId } = (await response.json()) as { storageId: Id<'_storage'> }
  return await getStorageUrl({ storageId })
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function normalizeHandle(value: string) {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
  return clean || undefined
}

function splitList(value: string) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

function readString(user: unknown, key: string) {
  if (!user || typeof user !== 'object') return ''
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}

function readStringArray(user: unknown, key: string) {
  if (!user || typeof user !== 'object') return []
  const value = (user as Record<string, unknown>)[key]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function readBoolean(user: unknown, key: string, fallback: boolean) {
  if (!user || typeof user !== 'object') return fallback
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'boolean' ? value : fallback
}
