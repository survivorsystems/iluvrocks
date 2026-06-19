import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

const placeLabels: Record<string, string> = {
  campground: 'Campgrounds',
  lodging: 'Hotels / lodging',
  grocery: 'Grocery stores',
  gas: 'Gas stations',
  rock_shop: 'Rock shops',
  lapidary: 'Lapidaries',
  museum: 'Museums',
  club: 'Clubs',
  permit_office: 'Permit offices / ranger stations',
}

export default function DestinationDetail() {
  const { slug = '' } = useParams()
  const data = useQuery((api as any).tripPlanning.getDestinationBySlug, {
    slug,
  })

  if (data === undefined) return <p className="empty-state">Loading trip...</p>
  if (!data) {
    return (
      <EmptyState
        title="Destination not found"
        description="This destination is not published yet."
        action={
          <Link to="/destinations" className="primary-action">
            Search destinations
          </Link>
        }
      />
    )
  }

  const groupedPlaces = groupByType(data.places ?? [])

  return (
    <section className="workspace-page destination-detail-page">
      <SectionHeader
        eyebrow={`${data.destination.region}${data.destination.county ? ` | ${data.destination.county}` : ''}`}
        title={data.destination.name}
        description={data.destination.summary}
        action={
          <Link to="/trip-planner" className="primary-action">
            View trip planner
          </Link>
        }
      />

      <div className="destination-layout">
        <div className="destination-main">
          <InfoCard title="Materials found here">
            <div className="trip-chip-row">
              {data.materials.length ? (
                data.materials.map((material: any) => (
                  <em key={material._id}>
                    {material.name}
                    {material.likelihood ? ` | ${material.likelihood}` : ''}
                  </em>
                ))
              ) : (
                <p>No materials linked yet.</p>
              )}
            </div>
          </InfoCard>
          <InfoCard title="Trip planning">
            <p>
              {data.destination.tripPlanning ||
                'Trip planning notes coming soon.'}
            </p>
          </InfoCard>
          <InfoCard title="Safety">
            <p>{data.destination.safetyInfo || 'Safety notes coming soon.'}</p>
          </InfoCard>
          <InfoCard title="Permits and access">
            <p>
              {data.destination.permitInfo || 'Permit information coming soon.'}
            </p>
          </InfoCard>
          <InfoCard title="Local tips">
            <p>{data.destination.localTips || 'Local tips coming soon.'}</p>
          </InfoCard>
        </div>

        <aside className="destination-rail">
          <InfoCard title="Curated itineraries">
            {data.itineraries.length ? (
              <div className="admin-list">
                {data.itineraries.map((itinerary: any) => (
                  <article key={itinerary._id}>
                    <strong>{itinerary.title}</strong>
                    <span>
                      {itinerary.duration || 'Flexible'} |{' '}
                      {itinerary.difficulty || 'Difficulty TBD'}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p>No itineraries yet.</p>
            )}
          </InfoCard>
          {Object.entries(groupedPlaces).map(([type, places]) => (
            <InfoCard key={type} title={placeLabels[type] ?? type}>
              <div className="admin-list">
                {places.map((place: any) => (
                  <article key={place._id}>
                    <strong>{place.name}</strong>
                    <span>
                      {place.address ||
                        place.description ||
                        'Details coming soon'}
                    </span>
                  </article>
                ))}
              </div>
            </InfoCard>
          ))}
        </aside>
      </div>
    </section>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="destination-info-card">
      <h2>{title}</h2>
      {children}
    </Card>
  )
}

function groupByType(places: any[]) {
  return places.reduce<Record<string, any[]>>((groups, place) => {
    const key = place.placeType || 'other'
    groups[key] = [...(groups[key] ?? []), place]
    return groups
  }, {})
}
