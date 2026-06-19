import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function BusinessProfile() {
  const { slug = '' } = useParams()
  const business = useQuery((api as any).businesses.getBySlug, { slug })

  if (business === undefined) {
    return <p className="empty-state">Loading business...</p>
  }

  if (!business) {
    return (
      <EmptyState
        title="Business not found"
        description="This business is not published yet or does not exist."
        action={
          <Link to="/businesses" className="primary-action">
            Back to directory
          </Link>
        }
      />
    )
  }

  return (
    <section className="workspace-page">
      <Card className="business-profile-card">
        <div className="business-profile-cover">
          {business.coverImageUrl ? (
            <img src={business.coverImageUrl} alt="" />
          ) : null}
        </div>
        <SectionHeader
          eyebrow={business.category}
          title={business.name}
          description={business.description || 'Business profile coming soon.'}
          action={
            <div className="hero-actions">
              {business.website ? (
                <a href={business.website} className="primary-action">
                  Visit website
                </a>
              ) : null}
              {business.email ? (
                <a
                  href={`mailto:${business.email}`}
                  className="secondary-action"
                >
                  Contact
                </a>
              ) : null}
            </div>
          }
        />
        <div className="business-profile-details">
          <p>
            <strong>Location</strong>
            <span>{business.location || 'Not listed yet'}</span>
          </p>
          <p>
            <strong>Phone</strong>
            <span>{business.phone || 'Not listed yet'}</span>
          </p>
          <p>
            <strong>Plan</strong>
            <span>{business.plan}</span>
          </p>
        </div>
      </Card>
    </section>
  )
}
