import {
  BookOpen,
  Camera,
  Compass,
  Diamond,
  Edit3,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  MoreHorizontal,
  Mountain,
  ShieldOff,
  Shield,
  UserPlus,
  Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuthProfileState } from '../lib/authState'
import { Badge, Card, EmptyState, getInitials } from './ui'

type RockhoundDashboardProps = {
  mode?: 'basecamp' | 'profile'
}

const stats = [
  { label: 'Posts', value: '328', icon: BookOpen },
  { label: 'Collections', value: '56', icon: Diamond },
  { label: 'Finds', value: '127', icon: Mountain },
  { label: 'Points', value: '1.2K', icon: Trophy },
  { label: 'Badges', value: '12', icon: Shield },
]

const badges = [
  { label: 'Trailblazer', icon: Mountain, earned: true },
  { label: 'Collector', icon: Diamond, earned: true },
  { label: 'Photographer', icon: Camera, earned: false },
  { label: 'Explorer', icon: Compass, earned: false },
]

const recentActivity = [
  {
    label: 'Added 3 new finds to Quartz Collection',
    time: '2h ago',
    icon: Mountain,
  },
  {
    label: 'Posted in Central Washington Rockhounds',
    time: '5h ago',
    icon: Mail,
  },
  { label: 'Earned the Trailblazer badge', time: '1d ago', icon: Diamond },
]

export default function RockhoundDashboard({
  mode = 'basecamp',
}: RockhoundDashboardProps) {
  const auth = useAuthProfileState()
  const collection = useQuery(api.collections.listMine, {})
  const followUser = useMutation(api.social.followUser)
  const blockUser = useMutation(api.social.blockUser)
  const viewer = auth.viewer?.user
  const displayName =
    viewer?.name?.trim() || auth.user?.displayName || 'RockHounder'
  const username =
    viewer?.username?.trim() || auth.user?.username || 'rockhounder'
  const email = viewer?.email?.trim() || auth.user?.email
  const location = viewer?.location?.trim() || 'Ellensburg, Washington'
  const bio =
    viewer?.bio?.trim() ||
    'Always outside. Always hunting for the next cool find.'
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
        <StatsRow />
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
          <Badge tone="dark">Founding Member #18</Badge>
        </div>
        <p className="profile-meta">
          <MapPin aria-hidden="true" />
          <span>{location}</span>
          <span aria-hidden="true">|</span>
          <span>Member since May 2024</span>
          <span aria-hidden="true">|</span>
          <span>@{username}</span>
        </p>
        <p className="profile-bio">{bio}</p>
      </div>
    </header>
  )
}

function StatsRow() {
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
          <span>2 hours ago</span>
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
        <span>Likes 24</span>
        <span>Comments 6</span>
        <button type="button">View all comments</button>
      </footer>
    </article>
  )
}

function RightRail() {
  return (
    <aside className="workspace-right-rail">
      <BadgeCard />
      <RecentActivityCard />
    </aside>
  )
}

function BadgeCard() {
  return (
    <Card className="rail-card">
      <CardTitle title="My Badges" />
      <div className="mini-badge-grid">
        {badges.map(({ label, icon: Icon, earned }) => (
          <div key={label}>
            <span className={earned ? 'is-earned' : undefined}>
              <Icon aria-hidden="true" />
            </span>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <button type="button" className="ui-button ui-button-secondary">
        View All Badges
      </button>
    </Card>
  )
}

function RecentActivityCard() {
  return (
    <Card className="rail-card">
      <CardTitle title="Recent Activity" />
      <div className="recent-list">
        {recentActivity.map(({ label, time, icon: Icon }) => (
          <div key={label}>
            <Icon aria-hidden="true" />
            <p>{label}</p>
            <span>{time}</span>
          </div>
        ))}
      </div>
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
