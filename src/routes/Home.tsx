import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Gem,
  Map,
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
  const appearance = useQuery((api as any).adminPublic.getSiteAppearance, {})

  return (
    <PageBackgroundLayout background="skagit">
      <TripSearchHero
        isAuthenticated={auth.isAuthenticated}
        appearance={appearance}
      />
      {auth.isAuthenticated ? <MemberTripHome /> : <VisitorSections />}
    </PageBackgroundLayout>
  )
}

function TripSearchHero({
  isAuthenticated,
  appearance,
}: {
  isAuthenticated: boolean
  appearance: any
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
    <section className="hero trip-hero">
      <div className="hero-copy">
        <p className="eyebrow">Washington rockhounding trip planner</p>
        <h1>
          {appearance?.homepageHeadline ||
            'Search where to go and what you might find.'}
        </h1>
        <p className="tagline">
          {appearance?.homepageIntro ||
            'Destinations, materials, safety notes, permits, local stops, and curated trip plans.'}
        </p>
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
              : appearance?.homepageCtaLabel || 'Create your Basecamp'}
          </Link>
        </div>
      </div>
      <Card className="trip-hero-panel">
        <strong>Washington-first</strong>
        <span>Search by place or material</span>
        <span>
          Connect destinations to rock shops, lodging, permits, guides, and
          safety info
        </span>
      </Card>
    </section>
  )
}

function VisitorSections() {
  const results = useQuery((api as any).tripPlanning.publicSearch, {})
  const destinationCount = results?.destinations?.length ?? 0
  const materialCount = results?.materials?.length ?? 0

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

function MemberTripHome() {
  return (
    <section className="workspace-page member-home">
      <SectionHeader
        eyebrow="Member home"
        title="Plan trips first. Use Basecamp when you need it."
        description="Your profile and collection tools are still available, but the main iluvrocks experience now starts with Washington destination search."
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
