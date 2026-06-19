import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import PageBackgroundLayout from '../components/PageBackgroundLayout'
import PostCard from '../components/PostCard'
import RockhoundDashboard from '../components/RockhoundDashboard'
import { Link } from 'react-router-dom'
import { isDevAuthBypass } from '../lib/devAuth'

export default function Profile() {
  const { handle = '' } = useParams()
  const useMockProfile = isDevAuthBypass && handle === 'chickensweets87'
  const profile = useQuery(
    api.users.getPublicProfile,
    useMockProfile ? 'skip' : { username: handle },
  )
  const followUser = useMutation(api.social.followUser)
  const blockUser = useMutation(api.social.blockUser)
  const [message, setMessage] = useState<string | null>(null)

  if (useMockProfile) {
    return (
      <PageBackgroundLayout background="skagit">
        <RockhoundDashboard mode="profile" />
      </PageBackgroundLayout>
    )
  }

  if (profile === undefined) {
    return <p className="empty-state">Loading profile...</p>
  }

  if (!profile) {
    return (
      <PageBackgroundLayout background="skagit">
        <section className="profile-page">
          <p className="empty-state">No profile found for @{handle}.</p>
        </section>
      </PageBackgroundLayout>
    )
  }

  const handleFollow = async () => {
    setMessage(null)
    try {
      await followUser({ followingId: profile.user._id })
      setMessage(
        profile.relationship.isFollowing
          ? 'User unfollowed.'
          : 'User followed.',
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Follow could not be updated.',
      )
    }
  }

  const handleBlock = async () => {
    setMessage(null)
    try {
      await blockUser({ blockedId: profile.user._id })
      setMessage(
        profile.relationship.blockedByViewer
          ? 'User unblocked.'
          : 'User blocked.',
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Block could not be updated.',
      )
    }
  }

  return (
    <PageBackgroundLayout background="skagit">
      <section className="profile-page">
        <header className="profile-header">
          <div className="avatar avatar-large" aria-hidden="true">
            {profile.user.image ? (
              <img src={profile.user.image} alt="" />
            ) : (
              initials(profile.user.name)
            )}
          </div>
          <div>
            <p className="eyebrow">@{profile.user.username}</p>
            <h1>{profile.user.name || profile.user.username}</h1>
            {profile.user.bio ? <p>{profile.user.bio}</p> : null}
            <div className="stats-row">
              <span>{profile.followerCount} followers</span>
              <span>{profile.followingCount} following</span>
            </div>
            <div className="profile-public-actions">
              <button
                type="button"
                disabled={profile.relationship.isOwnProfile}
                onClick={() => void handleFollow()}
              >
                {profile.relationship.isFollowing
                  ? 'Unfollow user'
                  : 'Follow user'}
              </button>
              <button
                type="button"
                disabled={profile.relationship.isOwnProfile}
                onClick={() => void handleBlock()}
              >
                {profile.relationship.blockedByViewer
                  ? 'Unblock user'
                  : 'Block user'}
              </button>
              <Link to={`/profile/${profile.user.username}/collection`}>
                View collection
              </Link>
            </div>
            {message ? <p className="profile-menu-message">{message}</p> : null}
          </div>
        </header>
        <div className="feed-column">
          {profile.posts.length === 0 ? (
            <p className="empty-state">No public posts yet.</p>
          ) : null}
          {profile.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </section>
    </PageBackgroundLayout>
  )
}

function initials(name?: string) {
  if (!name) return 'RA'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
