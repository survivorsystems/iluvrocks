import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function Guides() {
  const resources = useQuery(
    (api as any).adminPublic.listPublishedResources,
    {},
  )

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Guides and resources"
        title="Safety, ethics, laws, beginner guides, and Washington field resources"
        description="Visitor-friendly trip-planning resources published from the Owner Dashboard."
      />
      <div className="feature-grid">
        {(resources ?? []).map((resource: any) => (
          <Card key={resource._id} as="article" className="trip-result-card">
            <span>{resource.category || resource.resourceType}</span>
            <h2>{resource.title}</h2>
            <p>{resource.description || 'Resource details coming soon.'}</p>
            {resource.fileUrl ? (
              <a href={resource.fileUrl} className="secondary-action">
                Open resource
              </a>
            ) : null}
          </Card>
        ))}
      </div>
      {resources && resources.length === 0 ? (
        <EmptyState
          title="No guides published yet"
          description="Publish resources from the Owner Dashboard."
        />
      ) : null}
    </section>
  )
}
