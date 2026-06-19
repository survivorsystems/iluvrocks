import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Badge, Card, SectionHeader } from '../components/ui'

const categories = [
  'All',
  'Rock shop',
  'Lapidary',
  'Guide',
  'Educator',
  'Club',
  'Supplies',
]

export default function BusinessDirectory() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const businesses =
    useQuery((api as any).businesses.listPublic, {
      query: search || undefined,
      category: category === 'All' ? undefined : category,
    }) ?? []

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Business directory"
        title="Rock shops, guides, lapidary services, and local resources"
        description="Browse approved iluvrocks business profiles. Premium members receive featured placement, priority listing, lead forms, sponsor badges, and analytics."
        action={
          <Link to="/business/manage" className="primary-action">
            Create a business profile
          </Link>
        }
      />

      <Card className="directory-filter-card">
        <label>
          Search businesses
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, location, or service..."
          />
        </label>
        <div className="directory-chip-row">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'is-active' : undefined}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="business-directory-grid">
        {businesses.map((business: any) => (
          <Link
            key={business._id}
            to={`/businesses/${business.slug}`}
            className="business-directory-card"
          >
            <Card>
              <div className="business-card-media">
                {business.coverImageUrl ? (
                  <img src={business.coverImageUrl} alt="" />
                ) : null}
              </div>
              <div className="business-card-body">
                <div>
                  <h2>{business.name}</h2>
                  <p>{business.location || business.category}</p>
                </div>
                <div className="admin-badge-row">
                  {business.isFoundingBusiness ? (
                    <Badge tone="achievement">Founding Business</Badge>
                  ) : null}
                  {business.plan === 'premium' ? (
                    <Badge tone="achievement">Sponsor</Badge>
                  ) : null}
                </div>
                <p>{business.description || 'Business profile coming soon.'}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!businesses.length ? (
        <Card className="ui-empty-state">
          <h2>No businesses match yet</h2>
          <p>Try a different search, or create the first business profile.</p>
        </Card>
      ) : null}
    </section>
  )
}
