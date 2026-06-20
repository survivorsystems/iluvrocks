import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function Materials() {
  const results = useQuery((api as any).tripPlanning.publicSearch, {})
  const materials = results?.materials ?? []

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Washington materials"
        title="Browse by agate, jade, jasper, quartz, petrified wood, and more"
        description="Each material connects back to destinations where it can be found, with identification and safety notes managed from the Admin Dashboard."
      />
      <div className="feature-grid">
        {materials.map((material: any) => (
          <Card key={material._id} as="article" className="trip-result-card">
            <span>{material.destinations?.length ?? 0} destinations</span>
            <h2>{material.name}</h2>
            <p>{material.summary}</p>
            <div className="trip-chip-row">
              {(material.destinations ?? [])
                .slice(0, 4)
                .map((destination: any) => (
                  <Link
                    key={destination._id}
                    to={`/destinations/${destination.slug}`}
                  >
                    {destination.name}
                  </Link>
                ))}
            </div>
          </Card>
        ))}
      </div>
      {!materials.length ? (
        <EmptyState
          title="No materials published yet"
          description="Add materials from the Admin Dashboard."
        />
      ) : null}
    </section>
  )
}
