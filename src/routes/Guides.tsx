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
        eyebrow="Learn"
        title="Washington geology, ethics, access, and beginner field skills"
        description="Educational resources for learning what to look for, how to verify access, and how to collect with care."
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
          description="Educational resources will appear here as iluvrocks grows."
        />
      ) : null}
    </section>
  )
}
