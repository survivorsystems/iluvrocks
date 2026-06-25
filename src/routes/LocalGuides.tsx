import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { ArrowRight, Compass, MapPinned, ShieldCheck, Users } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

const trustCards = [
  {
    icon: ShieldCheck,
    title: 'Sensitive spots stay protected',
    text: 'Guides choose what they share. iluvrocks is built to teach patterns, access, and ethics instead of blasting secret pins.',
  },
  {
    icon: Compass,
    title: 'Beginners get local context',
    text: 'Learn what to look for, what to avoid, and how to check access before heading into the field.',
  },
  {
    icon: Users,
    title: 'Local hounds can earn trust',
    text: 'Approved guides can share their region, specialties, and booking/contact link while staying independent.',
  },
]

const regions = [
  'All regions',
  'Central Washington',
  'Olympic Peninsula',
  'North Cascades',
  'Southwest Washington',
  'Eastern Washington',
  'Puget Sound',
]

export default function LocalGuides() {
  const auth = useAuthProfileState()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All regions')
  const guides =
    useQuery((api as any).localGuides.listPublic, {
      query: search || undefined,
      region: region === 'All regions' ? undefined : region,
    }) ?? []

  return (
    <section className="workspace-page local-guides-page">
      <SectionHeader
        eyebrow="Local guide network"
        title="Learn Washington rockhounding from people who know the land"
        description="iluvrocks connects beginners and traveling rockhounds with trusted local knowledge while protecting hard-earned collecting areas."
        action={
          <Link
            to={auth.isAuthenticated ? '/local-guides/apply' : '/login'}
            className="primary-action"
          >
            Apply as a guide
          </Link>
        }
      />

      <div className="feature-grid">
        {trustCards.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="guide-trust-card">
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </Card>
        ))}
      </div>

      <Card className="directory-filter-card">
        <label>
          Search guides
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search region, material, skill, or guide name..."
          />
        </label>
        <div className="directory-chip-row">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              className={region === item ? 'is-active' : undefined}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="business-directory-grid">
        {guides.map((guide: any) => (
          <Link
            key={guide._id}
            to={`/local-guides/${guide.handle}`}
            className="business-directory-card"
          >
            <Card>
              <div className="guide-card-photo">
                {guide.photoUrl ? (
                  <img src={guide.photoUrl} alt="" />
                ) : (
                  <MapPinned aria-hidden="true" />
                )}
              </div>
              <div className="business-card-body">
                <div>
                  <h2>{guide.displayName}</h2>
                  <p>{guide.region}</p>
                </div>
                <p>{guide.offerings}</p>
                <div className="guide-specialty-row">
                  {guide.specialties.slice(0, 4).map((specialty: string) => (
                    <span key={specialty}>{specialty}</span>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!guides.length ? (
        <EmptyState
          title="No approved local guides yet"
          description="This is a new part of iluvrocks. Approved Washington guides will appear here as the community grows."
          action={
            <Link
              to={auth.isAuthenticated ? '/local-guides/apply' : '/login'}
              className="primary-action"
            >
              Become a founding guide
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        />
      ) : null}
    </section>
  )
}
