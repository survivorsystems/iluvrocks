import {
  Award,
  BookOpen,
  Compass,
  Diamond,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  MoreHorizontal,
  Mountain,
  ShieldOff,
  UserPlus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuthProfileState } from '../lib/authState'
import { Card, EmptyState, getInitials } from './ui'

type RockhoundDashboardProps = {
  mode?: 'basecamp' | 'profile'
}

export default function RockhoundDashboard({
  mode = 'basecamp',
}: RockhoundDashboardProps) {
  const auth = useAuthProfileState()
  const collection = useQuery(api.collections.listMine, {})
  const followUser = useMutation(api.social.followUser)
  const blockUser = useMutation(api.social.blockUser)
  const viewer = auth.viewer?.user
  const displayName =
    viewer?.name?.trim() || auth.user?.displayName || 'New rockhound'
  const username = viewer?.username?.trim() || auth.user?.username || ''
  const email = viewer?.email?.trim() || auth.user?.email
  const isOriginalHound = isTaviaSupporter({ displayName, username, email })
  const location = viewer?.location?.trim() || ''
  const bio = viewer?.bio?.trim() || ''
  const profileImage = getOptionalUserImage(viewer, 'image')
  const headerImage = getOptionalUserImage(viewer, 'bannerImage')
  const avatarLabel = getInitials(displayName || username || email)
  const viewerId = viewer?._id === 'dev-user' ? undefined : viewer?._id

  return (
    <div className="workspace-grid workspace-grid-with-rail">
      <Card
        className="profile-card"
        aria-label={
          mode === 'basecamp' ? 'Basecamp profile' : 'Rockhound profile'
        }
      >
        <ProfileHeader
          avatarLabel={avatarLabel}
          displayName={displayName}
          username={username}
          isOriginalHound={isOriginalHound}
          location={location}
          bio={bio}
          profileImage={profileImage}
          headerImage={headerImage}
          targetUserId={viewerId}
          isOwnProfile
          collectionVisibility={collection?.visibility ?? 'public'}
          onFollow={
            viewerId ? () => followUser({ followingId: viewerId }) : undefined
          }
          onBlock={
            viewerId ? () => blockUser({ blockedId: viewerId }) : undefined
          }
        />
        <StatsRow collectionCount={collection?.count ?? 0} />
        <ProfileTabs />
        <CollectionShowcase collection={collection} />
        <ActivityFeed displayName={displayName} collection={collection} />
      </Card>
      <RightRail />
    </div>
  )
}

function ProfileHeader({
  avatarLabel,
  displayName,
  username,
  isOriginalHound,
  location,
  bio,
  profileImage,
  headerImage,
  targetUserId,
  isOwnProfile,
  isFollowing = false,
  isBlocked = false,
  collectionVisibility = 'public',
  onFollow,
  onBlock,
}: {
  avatarLabel: string
  displayName: string
  username: string
  isOriginalHound?: boolean
  location: string
  bio: string
  profileImage?: string
  headerImage?: string
  targetUserId?: Id<'users'>
  isOwnProfile?: boolean
  isFollowing?: boolean
  isBlocked?: boolean
  collectionVisibility?: string
  onFollow?: () => Promise<unknown>
  onBlock?: () => Promise<unknown>
}) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuMessage, setMenuMessage] = useState<string | null>(null)
  const [coverFailed, setCoverFailed] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const showHeaderImage = !!headerImage && !coverFailed
  const showProfileImage = !!profileImage && !avatarFailed

  useEffect(() => {
    setCoverFailed(false)
  }, [headerImage])

  useEffect(() => {
    setAvatarFailed(false)
  }, [profileImage])

  const runMenuAction = async (
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setMenuMessage(null)
    try {
      await action()
      setMenuMessage(message)
      setIsMenuOpen(false)
    } catch (error) {
      setMenuMessage(
        error instanceof Error
          ? error.message
          : 'That action could not be completed.',
      )
    }
  }

  return (
    <header className="profile-hero">
      <div
        className="profile-cover"
        role="img"
        aria-label="Alpine field area with mountains and pine trees"
      >
        {showHeaderImage ? (
          <img src={headerImage} alt="" onError={() => setCoverFailed(true)} />
        ) : null}
      </div>
      <div className="profile-body">
        <div className="profile-avatar" aria-hidden="true">
          {showProfileImage ? (
            <img
              src={profileImage}
              alt=""
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            avatarLabel
          )}
        </div>
        <div className="profile-actions">
          <Link to="/settings" className="edit-profile-button">
            <Edit3 aria-hidden="true" />
            <span>Edit Profile</span>
          </Link>
          <div className="profile-menu-wrap">
            <button
              type="button"
              className="overflow-button"
              aria-label="More profile options"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MoreHorizontal aria-hidden="true" />
            </button>
            {isMenuOpen ? (
              <div className="profile-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  disabled={isOwnProfile || !targetUserId || !onFollow}
                  onClick={() =>
                    onFollow &&
                    void runMenuAction(
                      onFollow,
                      isFollowing ? 'User unfollowed.' : 'User followed.',
                    )
                  }
                >
                  <UserPlus aria-hidden="true" />
                  <span>{isFollowing ? 'Unfollow user' : 'Follow user'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={isOwnProfile || !targetUserId || !onBlock}
                  onClick={() =>
                    onBlock &&
                    void runMenuAction(
                      onBlock,
                      isBlocked ? 'User unblocked.' : 'User blocked.',
                    )
                  }
                >
                  <ShieldOff aria-hidden="true" />
                  <span>{isBlocked ? 'Unblock user' : 'Block user'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigate(`/profile/${username}/collection`)}
                >
                  {collectionVisibility === 'private' ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                  <span>View collection</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {menuMessage ? (
          <p className="profile-menu-message">{menuMessage}</p>
        ) : null}
        <div className="profile-title-row">
          <h1>{displayName}</h1>
          {isOriginalHound ? (
            <span className="original-hound-title">
              <Award aria-hidden="true" />
              Original Hound
            </span>
          ) : null}
        </div>
        <p className="profile-meta">
          {location ? (
            <>
              <MapPin aria-hidden="true" />
              <span>{location}</span>
            </>
          ) : null}
          {username ? <span>@{username}</span> : null}
        </p>
        {bio ? <p className="profile-bio">{bio}</p> : null}
      </div>
    </header>
  )
}

function StatsRow({ collectionCount }: { collectionCount: number }) {
  const stats = [
    { label: 'Posts', value: '0', icon: BookOpen },
    { label: 'Collections', value: collectionCount.toString(), icon: Diamond },
    { label: 'Finds', value: collectionCount.toString(), icon: Mountain },
    { label: 'Trips', value: '0', icon: Compass },
  ]

  return (
    <section className="profile-stats" aria-label="Profile stats">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label}>
          <Icon aria-hidden="true" />
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  )
}

function ProfileTabs() {
  return (
    <nav className="profile-tabs" aria-label="Profile sections">
      {['Activity', 'Posts', 'Collections', 'Finds'].map((tab) => (
        <button
          key={tab}
          type="button"
          className={tab === 'Activity' ? 'is-active' : undefined}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}

function CollectionShowcase({
  collection,
}: {
  collection: ReturnType<typeof useQuery<typeof api.collections.listMine>>
}) {
  const items = collection?.items.slice(0, 6) ?? []

  return (
    <section className="basecamp-collection-showcase">
      <div className="showcase-title-row">
        <div>
          <p className="eyebrow">Collection showcase</p>
          <h2>
            {collection ? `${collection.count} finds` : 'Loading collection'}
          </h2>
        </div>
        <Link to="/collections" className="ui-button ui-button-secondary">
          Upload find
        </Link>
      </div>
      {collection && collection.items.length === 0 ? (
        <EmptyState
          title="Show off your first find."
          description="Upload a find photo to start your Basecamp collection showcase."
          action={
            <Link to="/collections" className="primary-action">
              Upload find
            </Link>
          }
        />
      ) : null}
      {items.length ? (
        <div className="basecamp-specimen-grid">
          {items.map((item) => (
            <Link key={item._id} to={`/collections/${item._id}`}>
              <img src={item.photoUrl} alt="" />
              <span>{item.specimenName}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ActivityFeed({
  displayName,
  collection,
}: {
  displayName: string
  collection: ReturnType<typeof useQuery<typeof api.collections.listMine>>
}) {
  const recentItems = collection?.items.slice(0, 3) ?? []

  return (
    <article className="activity-card">
      <div className="activity-header">
        <div className="activity-avatar" aria-hidden="true">
          {getInitials(displayName)}
        </div>
        <div>
          <p>
            <strong>{displayName}</strong>{' '}
            {recentItems.length
              ? `added ${recentItems.length} find${recentItems.length === 1 ? '' : 's'} to the collection`
              : 'is building a collection showcase'}
          </p>
        </div>
        <button type="button" aria-label="More activity options">
          <MoreHorizontal aria-hidden="true" />
        </button>
      </div>
      {recentItems.length ? (
        <div className="collection-photo-grid">
          {recentItems.map((item) => (
            <img key={item._id} src={item.photoUrl} alt="" />
          ))}
        </div>
      ) : null}
      <footer className="activity-actions">
        <span>No reactions yet</span>
      </footer>
    </article>
  )
}

function RightRail() {
  return (
    <aside className="workspace-right-rail">
      <RecentActivityCard />
    </aside>
  )
}

function RecentActivityCard() {
  return (
    <Card className="rail-card">
      <CardTitle title="Recent Activity" />
      <EmptyState
        title="No activity yet"
        description="Your real profile activity will appear here as you save trips, upload finds, and post updates."
      />
    </Card>
  )
}

function CardTitle({ title }: { title: string }) {
  return (
    <header className="rail-card-title">
      <h2>{title}</h2>
      <button type="button">View all</button>
    </header>
  )
}

function getOptionalUserImage(user: unknown, key: 'image' | 'bannerImage') {
  if (!user || typeof user !== 'object' || !(key in user)) return undefined
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() || undefined : undefined
}

function isTaviaSupporter({
  displayName,
  username,
  email,
}: {
  displayName?: string
  username?: string
  email?: string
}) {
  return [displayName, username, email].some((value) =>
    value?.toLowerCase().includes('tavia'),
  )
}
