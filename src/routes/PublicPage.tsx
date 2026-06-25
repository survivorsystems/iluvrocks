import {
  ArrowRight,
  Building2,
  CalendarDays,
  Gem,
  Medal,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturePanel from '../components/FeaturePanel'
import { EmptyState, SectionHeader } from '../components/ui'

type PublicPanel = [title: string, description: string, icon: LucideIcon]
type PublicPageContent = {
  eyebrow: string
  title: string
  description: string
  panels: PublicPanel[]
}

const pages: Record<string, PublicPageContent> = {
  members: {
    eyebrow: 'Featured members',
    title: 'Meet rockhounds worth following',
    description:
      'Preview member stories, field styles, and collection interests before creating your own Basecamp.',
    panels: [],
  },
  'founding-members': {
    eyebrow: 'Founding members',
    title: 'The first iluvrocks community members',
    description:
      'A public preview of the people helping shape iluvrocks during its earliest season.',
    panels: [],
  },
  clubs: {
    eyebrow: 'Public clubs',
    title: 'Browse clubs before joining',
    description:
      'Preview regional groups and interest circles. Joining, posting, and messaging require a Basecamp.',
    panels: [],
  },
  events: {
    eyebrow: 'Public events',
    title: 'See what is coming up',
    description:
      'Browse public field days, swaps, club meetings, and learning sessions.',
    panels: [],
  },
  businesses: {
    eyebrow: 'Business listings',
    title: 'Find rock shops and field services',
    description:
      'Browse public listings for shops, lapidary services, guides, clubs, and local resources.',
    panels: [],
  },
  challenges: {
    eyebrow: 'Challenge previews',
    title: 'Preview seasonal collecting challenges',
    description:
      'See trip-planning prompts publicly. Saving plans and member actions require a Basecamp.',
    panels: [],
  },
  about: {
    eyebrow: 'About iluvrocks',
    title: 'Built by rockhounds, for rockhounds.',
    description:
      'iluvrocks exists to make collecting knowledge easier to learn, safer to share, and more connected to real local experience.',
    panels: [
      [
        'Field-first',
        'Designed around trips, finds, collections, clubs, and real-world learning.',
        Gem,
      ],
      [
        'Respectful sharing',
        'Public previews protect sensitive details while still helping people learn.',
        ShieldCheck,
      ],
      [
        'Community memory',
        'Profiles and Basecamps help turn scattered notes into useful history.',
        UsersRound,
      ],
    ],
  },
  membership: {
    eyebrow: 'Membership',
    title: 'Create your Basecamp when you are ready',
    description:
      'Browsing is public. A Basecamp unlocks posting, saving, collections, clubs, challenges, and profile tools.',
    panels: [
      [
        'Public browsing',
        'Explore discoveries, clubs, members, events, businesses, and challenge previews.',
        Gem,
      ],
      [
        'Basecamp account',
        'Create your profile, save spots, track finds, and join community features.',
        UsersRound,
      ],
      [
        'Future upgrades',
        'Room for premium tools later without blocking public discovery now.',
        Medal,
      ],
    ],
  },
}

type PublicPageKey = keyof typeof pages

export default function PublicPage({ page }: { page: PublicPageKey }) {
  const content = pages[page]

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        action={
          <div className="hero-actions">
            <Link to="/login" className="primary-action">
              Create your Basecamp
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/feed" className="secondary-action">
              Browse discoveries
            </Link>
          </div>
        }
      />
      <div className="feature-grid">
        {content.panels.map(([title, description, Icon]) => (
          <FeaturePanel
            key={title}
            icon={Icon}
            title={title}
            description={description}
          />
        ))}
      </div>
      {!content.panels.length ? (
        <EmptyState
          title="No public entries yet"
          description="Real community content will appear here as iluvrocks grows."
        />
      ) : null}
    </section>
  )
}
