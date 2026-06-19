import {
  ArrowRight,
  Bell,
  BookOpen,
  Compass,
  Diamond,
  Gem,
  Mail,
  Pickaxe,
  Settings,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturePanel from '../components/FeaturePanel'
import { Card, SectionHeader } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

const memberFeatures = [
  {
    to: '/basecamp',
    icon: Compass,
    title: 'Basecamp',
    description:
      'Open your member profile, recent activity, and collection showcase.',
  },
  {
    to: '/collections',
    icon: Diamond,
    title: 'Collections',
    description:
      'Upload finds, build catalogs, and manage public or private visibility.',
  },
  {
    to: '/feed',
    icon: BookOpen,
    title: 'Community feed',
    description:
      'Post updates, browse recent finds, and react to collection activity.',
  },
  {
    to: '/messages',
    icon: Mail,
    title: 'Messages',
    description: 'Start direct conversations with other iluvrocks members.',
  },
  {
    to: '/community',
    icon: UsersRound,
    title: 'Community',
    description: 'Find people, discussions, and public member activity.',
  },
  {
    to: '/notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Review follows, reactions, comments, and account activity.',
  },
  {
    to: '/settings',
    icon: Settings,
    title: 'Profile settings',
    description:
      'Update your profile details, profile photo, and Basecamp header.',
  },
]

export default function Home() {
  const auth = useAuthProfileState()

  if (auth.isAuthenticated) {
    return <MemberHome />
  }

  return (
    <>
      <section className="hero hero-with-image">
        <div className="hero-image-panel" aria-hidden="true">
          <img src="/iluvrocks-homepage-mountains.png" alt="" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Community field notes</p>
          <h1>iluvrocks</h1>
          <p className="tagline">Built by rockhounds, for rockhounds.</p>
          <p>
            A field-first home for rockhounds to discover public collecting
            knowledge, learn rock and mineral basics, and connect with careful
            local explorers.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="primary-action">
              Create your Basecamp
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/discoveries" className="secondary-action">
              Browse discoveries
            </Link>
          </div>
        </div>
        <div
          className="hero-panel visitor-hero-panel"
          aria-label="iluvrocks highlights"
        >
          <div>
            <Compass aria-hidden="true" />
            <span>Recent finds</span>
          </div>
          <div>
            <UsersRound aria-hidden="true" />
            <span>Local collectors</span>
          </div>
        </div>
      </section>
      <section className="public-section">
        <p className="eyebrow">For visitors</p>
        <h2>Start learning before you sign up</h2>
        <div className="feature-grid">
          <FeaturePanel
            icon={Pickaxe}
            title="Latest public discoveries"
            description="Read recent community finds and trip notes without needing an account."
          />
          <FeaturePanel
            icon={UsersRound}
            title="Featured members"
            description="Preview member stories, founding hounds, and collection interests before creating your Basecamp."
          />
          <FeaturePanel
            icon={Gem}
            title="Collection showcases"
            description="See what members are adding to their collections and how they document each find."
          />
        </div>
        <div className="hero-actions">
          <Link to="/members" className="secondary-action">
            Featured members
          </Link>
          <Link to="/membership" className="secondary-action">
            Membership info
          </Link>
        </div>
      </section>
    </>
  )
}

function MemberHome() {
  return (
    <section className="workspace-page member-home">
      <SectionHeader
        eyebrow="Member home"
        title="Where do you want to go next?"
        description="Use this as the main navigation page while the deeper feature pages grow out."
      />
      <div className="member-home-grid">
        {memberFeatures.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to}>
            <Card as="article" className="member-feature-card">
              <Icon aria-hidden="true" />
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
              <ArrowRight aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
