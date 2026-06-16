import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { devUser, isDevAuthBypass, useAppAuth } from '../lib/devAuth'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const auth = useAppAuth()
  const viewer = useQuery(api.users.viewer, isDevAuthBypass || !auth.isAuthenticated ? 'skip' : {})
  const updateProfile = useMutation(api.users.updateProfile)
  const [status, setStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const initial = isDevAuthBypass
    ? {
        name: devUser.displayName,
        username: devUser.username,
        email: devUser.email,
        bio: 'Building RockHound and testing the local dev account.',
        location: 'Washington',
        homeRegion: 'Puget Sound',
        favoriteMinerals: ['Agate', 'Jasper', 'Quartz'],
        collectingStyles: ['Beach walks', 'River bars'],
        yearsRockhounding: 4,
      }
    : viewer?.user
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [homeRegion, setHomeRegion] = useState('')
  const [favoriteMinerals, setFavoriteMinerals] = useState('')
  const [collectingStyles, setCollectingStyles] = useState('')
  const [yearsRockhounding, setYearsRockhounding] = useState('')

  useEffect(() => {
    if (!initial) return
    setName(initial.name ?? '')
    setUsername(initial.username ?? '')
    setBio(initial.bio ?? '')
    setLocation(initial.location ?? '')
    setHomeRegion(initial.homeRegion ?? '')
    setFavoriteMinerals(initial.favoriteMinerals?.join(', ') ?? '')
    setCollectingStyles(initial.collectingStyles?.join(', ') ?? '')
    setYearsRockhounding(initial.yearsRockhounding?.toString() ?? '')
  }, [initial])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSaving(true)

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')

    try {
      if (!isDevAuthBypass) {
        await updateProfile({
          name: emptyToUndefined(name),
          username: cleanUsername || undefined,
          bio: emptyToUndefined(bio),
          location: emptyToUndefined(location),
          homeRegion: emptyToUndefined(homeRegion),
          favoriteMinerals: splitList(favoriteMinerals),
          collectingStyles: splitList(collectingStyles),
          yearsRockhounding: yearsRockhounding ? Number(yearsRockhounding) : undefined,
        })
      }
      setStatus('Profile saved.')
      if (cleanUsername) {
        navigate(`/profile/${cleanUsername}`)
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Profile could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isDevAuthBypass && auth.isLoading) {
    return <p className="empty-state">Checking your sign-in...</p>
  }

  if (!isDevAuthBypass && !auth.isAuthenticated) {
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Create profile</p>
          <h1>Sign in first</h1>
          <p className="form-note">Your profile is created from your signed-in account.</p>
          <Link to="/login" className="primary-action">
            Sign in
          </Link>
        </div>
      </section>
    )
  }

  if (!isDevAuthBypass && viewer === undefined) {
    return <p className="empty-state">Loading profile setup...</p>
  }

  if (!isDevAuthBypass && viewer === null) {
    return (
      <section className="auth-page">
        <div className="auth-form">
          <p className="eyebrow">Create profile</p>
          <h1>Session still waking up</h1>
          <p className="form-note">RockHound accepted your sign-in. Refresh once, then open profile setup again.</p>
          <Link to="/login" className="primary-action">
            Back to sign in
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-page">
      <form className="auth-form profile-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Create profile</p>
        <h1>Your rockhound card</h1>
        <div className="form-grid">
          <label>
            Display name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Rockhound" />
          </label>
          <label>
            Handle
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="jane-agates" />
          </label>
          <label>
            Location
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Olympia, WA" />
          </label>
          <label>
            Home region
            <input value={homeRegion} onChange={(event) => setHomeRegion(event.target.value)} placeholder="Puget Sound" />
          </label>
          <label>
            Years rockhounding
            <input
              type="number"
              min="0"
              value={yearsRockhounding}
              onChange={(event) => setYearsRockhounding(event.target.value)}
              placeholder="3"
            />
          </label>
          <label>
            Favorite minerals
            <input
              value={favoriteMinerals}
              onChange={(event) => setFavoriteMinerals(event.target.value)}
              placeholder="Agate, jasper, quartz"
            />
          </label>
        </div>
        <label>
          Collecting style
          <input
            value={collectingStyles}
            onChange={(event) => setCollectingStyles(event.target.value)}
            placeholder="Beach walks, river bars, old road cuts"
          />
        </label>
        <label>
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            placeholder="Tell people what you collect and where you like to explore."
          />
        </label>
        <div className="form-footer">
          <span>{status}</span>
          <button type="submit" disabled={isSaving || !username.trim()}>
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </section>
  )
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function splitList(value: string) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}
