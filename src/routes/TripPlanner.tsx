import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function TripPlanner() {
  const data = useQuery((api as any).tripPlanning.publicSearch, {})
  const destinations = data?.destinations ?? []

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Trip planner"
        title="Build a Washington rockhounding trip around the place and the material"
        description="Start with a destination, then check materials, permits, safety, local supplies, lodging, campgrounds, and curated itineraries."
      />
      <div className="trip-planner-steps">
        {[
          [
            '1',
            'Choose a destination',
            'Search Washington beaches, rivers, forests, and public collecting areas.',
          ],
          [
            '2',
            'Check materials',
            'See what is commonly found there and what needs careful identification.',
          ],
          [
            '3',
            'Plan the practical details',
            'Review permits, safety notes, gas, groceries, lodging, rock shops, and ranger offices.',
          ],
        ].map(([step, title, text]) => (
          <Card key={step} className="trip-step-card">
            <strong>{step}</strong>
            <h2>{title}</h2>
            <p>{text}</p>
          </Card>
        ))}
      </div>
      <div className="feature-grid">
        {destinations.slice(0, 6).map((destination: any) => (
          <Link key={destination._id} to={`/destinations/${destination.slug}`}>
            <Card as="article" className="trip-result-card">
              <span>{destination.region}</span>
              <h2>{destination.name}</h2>
              <p>{destination.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
      {!destinations.length ? (
        <EmptyState
          title="No trip plans published yet"
          description="Create destinations and itineraries from the Owner Dashboard."
        />
      ) : null}
    </section>
  )
}
