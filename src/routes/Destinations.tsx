import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function Destinations() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const results = useQuery((api as any).tripPlanning.publicSearch, {
    query: search || undefined,
  })

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Washington destinations"
        title="Search rockhounding trips by destination or material"
        description="Find Washington places to explore, what materials are found there, and what to know before you go."
      />
      <SearchBox
        value={search}
        onChange={(value) => setParams(value ? { q: value } : {})}
      />
      <div className="trip-search-grid">
        <SearchColumn
          title="Destinations"
          empty="No destinations match yet."
          items={(results?.destinations ?? []).map((destination: any) => ({
            key: destination._id,
            title: destination.name,
            meta: `${destination.region}${destination.county ? ` | ${destination.county}` : ''}`,
            description: destination.summary,
            to: `/destinations/${destination.slug}`,
            chips:
              destination.materials?.map((material: any) => material.name) ??
              [],
          }))}
        />
        <SearchColumn
          title="Materials"
          empty="No materials match yet."
          items={(results?.materials ?? []).map((material: any) => ({
            key: material._id,
            title: material.name,
            meta: `${material.destinations?.length ?? 0} destination matches`,
            description: material.summary,
            to: `/materials?material=${material.slug}`,
            chips:
              material.destinations?.map(
                (destination: any) => destination.name,
              ) ?? [],
          }))}
        />
      </div>
    </section>
  )
}

export function SearchBox({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Card className="trip-search-card">
      <label>
        Search by destination or material
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Try agate, jade, jasper, quartz, petrified wood, beaches, rivers..."
        />
      </label>
    </Card>
  )
}

function SearchColumn({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: Array<{
    key: string
    title: string
    meta: string
    description: string
    to: string
    chips: string[]
  }>
}) {
  return (
    <div className="trip-result-column">
      <h2>{title}</h2>
      {items.length ? (
        items.map((item) => (
          <Link key={item.key} to={item.to}>
            <Card as="article" className="trip-result-card">
              <span>{item.meta}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="trip-chip-row">
                {item.chips.slice(0, 5).map((chip) => (
                  <em key={chip}>{chip}</em>
                ))}
              </div>
            </Card>
          </Link>
        ))
      ) : (
        <EmptyState
          title={empty}
          description="Add content from the Owner Dashboard."
        />
      )}
    </div>
  )
}
