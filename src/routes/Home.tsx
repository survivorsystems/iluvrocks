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
  MapPin,
  Route,
  Search,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import FeaturePanel from '../components/FeaturePanel'
import PageBackgroundLayout from '../components/PageBackgroundLayout'
import { Card, SectionHeader } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

const memberLinks = [
  {
    to: '/destinations',
    icon: Map,
    title: 'Search destinations',
    description:
      'Browse Washington destinations and what materials are found there.',
  },
  {
    to: '/trip-planner',
    icon: Route,
    title: 'Plan a trip',
    description:
      'Check safety, permits, places nearby, and curated itineraries.',
  },
  {
    to: '/businesses',
    icon: Building2,
    title: 'Find local support',
    description:
      'Rock shops, lapidaries, lodging, supplies, museums, and permit offices.',
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
      <MapTilerPreview destinationCount={destinationCount} />
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
      `/destinations${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`,
    )
  }

  return (
    <section className="hero trip-hero trip-hero-centered">
      <div className="hero-copy">
        <p className="eyebrow">Curate Your Next Adventure</p>
        <h1>Let's Rock</h1>
        <p className="tagline">Learn How To Rockhound</p>
        <form className="home-search-form" onSubmit={submit}>
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agate, jade, jasper, quartz, petrified wood, beaches, rivers..."
          />
          <button type="submit">Search</button>
        </form>
        <div className="hero-actions">
          <Link to="/destinations" className="primary-action">
            Browse destinations
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
        eyebrow="Plan before you sign up"
        title="Public browsing comes first"
        description="Visitors can browse destinations, materials, guides, itineraries, and business listings without creating an account."
      />
      <div className="feature-grid">
        <FeaturePanel
          icon={Map}
          title={`${destinationCount} destinations`}
          description="Washington trip pages with materials, permits, safety, maps, photos, and local tips."
        />
        <FeaturePanel
          icon={Gem}
          title={`${materialCount} materials`}
          description="Search by agate, jade, jasper, quartz, petrified wood, and other finds."
        />
        <FeaturePanel
          icon={BookOpen}
          title="Guides and resources"
          description="Safety, ethics, laws by state, beginner guides, and educational resources."
        />
      </div>
    </section>
  )
}

function MapTilerPreview({ destinationCount }: { destinationCount: number }) {
  const maptilerKey = (import.meta.env.VITE_MAPTILER_KEY ||
    import.meta.env.VITE_MAPTILER_API_KEY) as string | undefined
  const staticMapUrl = maptilerKey
    ? `https://api.maptiler.com/maps/outdoor-v2/static/-121.55,48.52,8.6/1120x520.png?key=${encodeURIComponent(maptilerKey)}`
    : undefined

  return (
    <Card className="home-map-preview">
      <div className="home-map-copy">
        <p className="eyebrow">Explore the map</p>
        <h2>Start with the place, then follow the rock clues.</h2>
        <p>
          Preview Washington collecting areas, river corridors, roads, and
          nearby trip planning details before you choose an adventure.
        </p>
        <Link to="/destinations" className="primary-action">
          Open destinations
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div
        className="home-map-frame"
        style={
          staticMapUrl ? { backgroundImage: `url(${staticMapUrl})` } : undefined
        }
        aria-hidden="true"
      >
        <span className="map-pin map-pin-primary">
          <MapPin />
        </span>
        <span className="map-pin map-pin-secondary">
          {Math.max(destinationCount, 1)}
        </span>
        <span className="map-pin map-pin-tertiary">
          <Gem />
        </span>
      </div>
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
        title="Plan trips first. Use Basecamp when you need it."
        description="Plan, save, and revisit your rockhounding ideas from one place."
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
