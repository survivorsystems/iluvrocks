import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { CalendarCheck, ExternalLink, MapPinned, ShieldCheck } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function LocalGuideProfile() {
  const { handle = '' } = useParams()
  const guide = useQuery((api as any).localGuides.getByHandle, { handle })

  if (guide === undefined) {
    return <p className="empty-state">Loading local guide...</p>
  }

  if (!guide) {
    return (
      <EmptyState
        title="Guide not found"
        description="This guide profile is not approved yet or does not exist."
        action={
          <Link to="/local-guides" className="primary-action">
            Back to local guides
          </Link>
        }
      />
    )
  }

  return (
    <section className="workspace-page">
      <Card className="guide-profile-card">
        <div className="guide-profile-hero">
          <div className="guide-profile-photo">
            {guide.photoUrl ? (
              <img src={guide.photoUrl} alt="" />
            ) : (
              <MapPinned aria-hidden="true" />
            )}
          </div>
          <SectionHeader
            eyebrow={guide.isFoundingGuide ? 'Founding local guide' : 'Local guide'}
            title={guide.displayName}
            description={guide.experienceSummary}
            action={
              <div className="hero-actions">
                {guide.bookingUrl ? (
                  <a
                    href={guide.bookingUrl}
                    className="primary-action"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Booking page
                    <ExternalLink aria-hidden="true" />
                  </a>
                ) : null}
                {guide.publicContactEmail ? (
                  <a
                    href={`mailto:${guide.publicContactEmail}`}
                    className="secondary-action"
                  >
                    Contact guide
                  </a>
                ) : null}
              </div>
            }
          />
        </div>

        <div className="guide-profile-grid">
          <Card as="div" className="guide-detail-panel">
            <h2>Region and specialties</h2>
            <p>
              <strong>Region</strong>
              <span>{guide.region}</span>
            </p>
            <p>
              <strong>Home base</strong>
              <span>{guide.homeBase || 'Not listed yet'}</span>
            </p>
            <div className="guide-specialty-row">
              {guide.specialties.map((specialty: string) => (
                <span key={specialty}>{specialty}</span>
              ))}
            </div>
          </Card>

          <Card as="div" className="guide-detail-panel">
            <h2>What they offer</h2>
            <p>{guide.offerings}</p>
            <ul className="guide-check-list">
              <li>
                <CalendarCheck aria-hidden="true" />
                {guide.beginnerFriendly
                  ? 'Beginner-friendly'
                  : 'Best for experienced rockhounds'}
              </li>
              <li>
                <CalendarCheck aria-hidden="true" />
                {guide.familyFriendly
                  ? 'Family-friendly options'
                  : 'Ask guide about group fit'}
              </li>
            </ul>
          </Card>

          <Card as="div" className="guide-detail-panel">
            <h2>Accessibility and safety notes</h2>
            <p>
              {guide.accessibilityNotes ||
                'Ask this guide about terrain, mobility needs, road conditions, weather, tools, and field expectations before meeting.'}
            </p>
          </Card>

          <Card as="div" className="guide-detail-panel guide-disclaimer">
            <ShieldCheck aria-hidden="true" />
            <h2>Independent guide notice</h2>
            <p>
              Local guides are independent rockhounds. Booking, pricing,
              waivers, trip details, cancellations, and safety expectations are
              handled directly by each guide.
            </p>
          </Card>
        </div>
      </Card>
    </section>
  )
}
