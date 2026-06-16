import { useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import PostCard from '../components/PostCard'

export default function Profile() {
  const { handle = '' } = useParams()
  const profile = useQuery(api.users.getPublicProfile, { username: handle })

  if (profile === undefined) {
    return <p className="empty-state">Loading profile...</p>
  }

  if (!profile) {
    return (
      <section className="profile-page">
        <p className="empty-state">No profile found for @{handle}.</p>
      </section>
    )
  }

  return (
    <section className="profile-page">
      <header className="profile-header">
        <div className="avatar avatar-large" aria-hidden="true">
          {profile.user.image ? <img src={profile.user.image} alt="" /> : initials(profile.user.name)}
        </div>
        <div>
          <p className="eyebrow">@{profile.user.username}</p>
          <h1>{profile.user.name || profile.user.username}</h1>
          {profile.user.bio ? <p>{profile.user.bio}</p> : null}
          <div className="stats-row">
            <span>{profile.followerCount} followers</span>
            <span>{profile.followingCount} following</span>
          </div>
        </div>
      </header>
      <div className="feed-column">
        {profile.posts.length === 0 ? <p className="empty-state">No public posts yet.</p> : null}
        {profile.posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
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
