import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import {
  CalendarCheck,
  ExternalLink,
  Gem,
  MapPinned,
  ShieldCheck,
} from 'lucide-react'
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
            description={guide.guideBio || guide.experienceSummary}
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
                {guide.collector?.username ? (
                  <Link
                    to={`/profile/${guide.collector.username}/collection`}
                    className="secondary-action"
                  >
                    View collection
                  </Link>
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
            <h2>Why this guide is useful</h2>
            <p>{guide.experienceSummary}</p>
          </Card>

          <Card as="div" className="guide-detail-panel">
            <h2>Ethics and location protection</h2>
            <p>
              {guide.ethicsStatement ||
                'This guide has agreed to promote ethical, legal collecting and respectful field behavior.'}
            </p>
            <p>
              {guide.locationPrivacyStatement ||
                'This guide has agreed to protect sensitive locations and private knowledge while helping people learn how to research responsibly.'}
            </p>
          </Card>

          <Card as="div" className="guide-detail-panel">
            <h2>Collection as teaching portfolio</h2>
            <p>
              {guide.collectionShowcaseNotes ||
                'Public collection items can help visitors understand this guide’s interests, skill, and field experience without revealing exact locations.'}
            </p>
            {guide.collector?.username ? (
              <Link
                to={`/profile/${guide.collector.username}/collection`}
                className="primary-action"
              >
                View public collection
              </Link>
            ) : null}
          </Card>

          {guide.favoriteEducationalFinds?.length ? (
            <Card as="div" className="guide-detail-panel">
              <h2>Favorite educational finds</h2>
              <div className="guide-find-list">
                {guide.favoriteEducationalFinds.map((find: string) => (
                  <span key={find}>
                    <Gem aria-hidden="true" />
                    {find}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {guide.testimonialQuote ? (
            <Card as="div" className="guide-detail-panel guide-testimonial">
              <h2>Community note</h2>
              <blockquote>{guide.testimonialQuote}</blockquote>
              {guide.testimonialAttribution ? (
                <p>{guide.testimonialAttribution}</p>
              ) : null}
            </Card>
          ) : null}

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
