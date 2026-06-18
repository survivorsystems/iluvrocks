import {
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  Diamond,
  Edit3,
  Mail,
  MapPin,
  MoreHorizontal,
  Mountain,
  Shield,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthProfileState } from '../lib/authState'
import { Badge, Card, ProgressBar, getInitials } from './ui'

type RockhoundDashboardProps = {
  mode?: 'basecamp' | 'profile'
}

const stats = [
  { label: 'Posts', value: '328', icon: BookOpen },
  { label: 'Collections', value: '56', icon: Diamond },
  { label: 'Finds', value: '127', icon: Mountain },
  { label: 'Challenges', value: '24', icon: CheckCircle2 },
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
  { label: 'Added 3 new finds to Quartz Collection', time: '2h ago', icon: Mountain },
  { label: 'Posted in Central Washington Rockhounds', time: '5h ago', icon: Mail },
  { label: 'Earned the Trailblazer badge', time: '1d ago', icon: Diamond },
  { label: 'Completed challenge: First Post', time: '2d ago', icon: CheckCircle2 },
]

const collectionImages = [
  {
    alt: 'Clear quartz cluster',
    url: 'https://images.unsplash.com/photo-1615486511262-c7a4f07bf2d5?auto=format&fit=crop&w=700&q=80',
  },
  {
    alt: 'Purple amethyst specimen',
    url: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=700&q=80',
  },
  {
    alt: 'Banded agate slice',
    url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=700&q=80',
  },
]

export default function RockhoundDashboard({ mode = 'basecamp' }: RockhoundDashboardProps) {
  const auth = useAuthProfileState()
  const viewer = auth.viewer?.user
  const displayName = viewer?.name?.trim() || auth.user?.displayName || 'RockHounder'
  const username = viewer?.username?.trim() || auth.user?.username || 'rockhounder'
  const email = viewer?.email?.trim() || auth.user?.email
  const location = viewer?.location?.trim() || 'Ellensburg, Washington'
  const bio = viewer?.bio?.trim() || 'Always outside. Always hunting for the next cool find.'
  const avatarLabel = getInitials(displayName || username || email)

  return (
    <div className="workspace-grid workspace-grid-with-rail">
      <Card className="profile-card" aria-label={mode === 'basecamp' ? 'Basecamp profile' : 'Rockhound profile'}>
        <ProfileHeader
          avatarLabel={avatarLabel}
          displayName={displayName}
          username={username}
          location={location}
          bio={bio}
        />
        <StatsRow />
        <ProfileTabs />
        <ActivityFeed displayName={displayName} />
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
}: {
  avatarLabel: string
  displayName: string
  username: string
  location: string
  bio: string
}) {
  return (
    <header className="profile-hero">
      <div className="profile-cover" role="img" aria-label="Alpine field area with mountains and pine trees" />
      <div className="profile-body">
        <div className="profile-avatar" aria-hidden="true">
          {avatarLabel}
        </div>
        <div className="profile-actions">
          <Link to="/settings" className="edit-profile-button">
            <Edit3 aria-hidden="true" />
            <span>Edit Profile</span>
          </Link>
          <button type="button" className="overflow-button" aria-label="More profile options">
            <MoreHorizontal aria-hidden="true" />
          </button>
        </div>
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
      {['Activity', 'Posts', 'Collections', 'Finds', 'Challenges'].map((tab) => (
        <button key={tab} type="button" className={tab === 'Activity' ? 'is-active' : undefined}>
          {tab}
        </button>
      ))}
    </nav>
  )
}

function ActivityFeed({ displayName }: { displayName: string }) {
  return (
    <article className="activity-card">
      <div className="activity-header">
        <div className="activity-avatar" aria-hidden="true">
          {getInitials(displayName)}
        </div>
        <div>
          <p>
            <strong>{displayName}</strong> added 3 new finds to Quartz Collection
          </p>
          <span>2 hours ago</span>
        </div>
        <button type="button" aria-label="More activity options">
          <MoreHorizontal aria-hidden="true" />
        </button>
      </div>
      <div className="collection-photo-grid">
        {collectionImages.map((image) => (
          <img key={image.alt} src={image.url} alt={image.alt} />
        ))}
      </div>
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
      <ChallengeCard />
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

function ChallengeCard() {
  return (
    <Card className="rail-card challenge-card">
      <CardTitle title="Next Challenge" />
      <div className="challenge-body">
        <span className="challenge-icon is-progress">
          <MapPin aria-hidden="true" />
        </span>
        <div>
          <h3>Explore a New Area</h3>
          <p>Visit and add a new rockhounding location.</p>
          <ProgressBar value={60} label="Explore a New Area progress" />
        </div>
        <strong>60%</strong>
      </div>
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
