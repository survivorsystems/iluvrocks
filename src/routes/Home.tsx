import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Gem,
  Heart,
  Map,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import FeaturePanel from '../components/FeaturePanel'
import MapTilerMapPreview from '../components/MapTilerMapPreview'
import PageBackgroundLayout from '../components/PageBackgroundLayout'
import { Card, SectionHeader } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

const memberLinks = [
  {
    to: '/local-guides',
    icon: ShieldCheck,
    title: 'Find local guides',
    description:
      'Connect with approved Washington rockhounds who choose what they share.',
  },
  {
    to: '/guides',
    icon: BookOpen,
    title: 'Learn the land',
    description:
      'Study geology, access, safety, ethics, and what to look for in Washington.',
  },
  {
    to: '/community',
    icon: Users,
    title: 'Ask the community',
    description:
      'Use forums for ID help, beginner questions, and trip reports without exposing sensitive places.',
  },
  {
    to: '/basecamp',
    icon: Compass,
    title: 'Open Basecamp',
    description:
      'Your profile and member tools are still here when you need them.',
  },
]

export default function Home() {
  const auth = useAuthProfileState()
  const results = useQuery((api as any).tripPlanning.publicSearch, {})
  const destinationCount = results?.destinations?.length ?? 0
  const materialCount = results?.materials?.length ?? 0

  return (
    <PageBackgroundLayout background="skagit" className="home-page">
      <TripSearchHero isAuthenticated={auth.isAuthenticated} />
      <OriginalHoundsSection />
      {auth.isAuthenticated ? (
        <MemberTripHome />
      ) : (
        <VisitorSections
          destinationCount={destinationCount}
          materialCount={materialCount}
        />
      )}
      <MapTilerPreview />
    </PageBackgroundLayout>
  )
}

function TripSearchHero({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    navigate(
      `/trip-planner${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`,
    )
  }

  return (
    <section className="hero trip-hero trip-hero-centered">
      <div className="hero-copy">
        <p className="eyebrow">Washington rockhounding, taught with care</p>
        <h1>Let's Rock</h1>
        <p className="tagline">
          Learn the geology, protect the places, and connect with trusted local
          knowledge.
        </p>
        <form className="home-search-form" onSubmit={submit}>
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agate, jade, jasper, quartz, ethics, access, guides..."
          />
          <button type="submit">Search</button>
        </form>
        <div className="hero-actions">
          <Link to="/local-guides" className="primary-action">
            Find Local Guides
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            to={isAuthenticated ? '/basecamp' : '/login'}
            className="secondary-action"
          >
            {isAuthenticated
              ? 'Open Basecamp'
              : 'Create your Basecamp'}
          </Link>
        </div>
      </div>
    </section>
  )
}

function VisitorSections({
  destinationCount,
  materialCount,
}: {
  destinationCount: number
  materialCount: number
}) {
  return (
    <section className="public-section">
      <SectionHeader
        eyebrow="Learn before you go"
        title="Beginner-friendly information without exposing hard-earned spots"
        description="Visitors can browse Washington learning resources, public-area guidance, local guide profiles, and community context without creating an account."
      />
      <div className="feature-grid">
        <FeaturePanel
          icon={Map}
          title={`${destinationCount} learning regions`}
          description="Broad Washington region pages with geology, materials, access notes, safety, and ethical collecting reminders."
        />
        <FeaturePanel
          icon={Gem}
          title={`${materialCount} searchable materials`}
          description="Learn what geologic conditions create agate, jade, jasper, quartz, petrified wood, and other finds."
        />
        <FeaturePanel
          icon={ShieldCheck}
          title="Local guide network"
          description="Experienced rockhounds can share knowledge, protect sensitive places, and choose their own booking or contact process."
        />
      </div>
    </section>
  )
}

function MapTilerPreview() {
  return (
    <Card className="home-map-preview">
      <div className="home-map-copy">
        <p className="eyebrow">Explore the map</p>
        <h2>Use the map as a learning layer, not a secret-spot machine.</h2>
        <p>
          Preview broad Washington regions, public context, landform clues, and
          nearby learning resources before deciding where to research next.
        </p>
        <Link to="/guides" className="primary-action">
          Learn How To Rockhound
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <MapTilerMapPreview />
    </Card>
  )
}

function OriginalHoundsSection() {
  return (
    <section className="public-section original-hounds-section">
      <SectionHeader
        eyebrow="Original Hounds"
        title="The first people helping iluvrocks get off the ground"
        description="Original Hounds are the first supporters who helped iluvrocks get off the ground."
      />
      <Card className="original-hound-card">
        <span className="original-hound-mark" aria-hidden="true">
          <Heart />
        </span>
        <div>
          <p className="eyebrow">First monthly supporter</p>
          <h2>Tavia</h2>
          <p>
            Thank you for helping this early rockhounding community take its
            first real steps.
          </p>
        </div>
        <span className="original-hound-title">Original Hound</span>
      </Card>
    </section>
  )
}

function MemberTripHome() {
  return (
    <section className="workspace-page member-home">
      <SectionHeader
        eyebrow="Member home"
        title="Learn, connect, and keep your Basecamp close."
        description="Use iluvrocks to build skill, ask better questions, and connect with trusted local knowledge."
      />
      <div className="member-home-grid">
        {memberLinks.map(({ to, icon: Icon, title, description }) => (
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
