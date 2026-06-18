import { SectionHeader } from '../components/ui'

const specimens = [
  { name: 'Carnelian agate', origin: 'Olympic Peninsula', status: 'Cleaned' },
  { name: 'Picture jasper', origin: 'Central Washington', status: 'Needs catalog photo' },
  { name: 'Quartz point', origin: 'Cascade foothills', status: 'Measured' },
]

export default function CollectionTracker() {
  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Collection tracker"
        title="Catalog the keepers"
        description="Track specimens, locations, photos, prep status, and the story behind each find."
      />
      <div className="table-card">
        {specimens.map((specimen) => (
          <div key={specimen.name} className="table-row">
            <strong>{specimen.name}</strong>
            <span>{specimen.origin}</span>
            <em>{specimen.status}</em>
          </div>
        ))}
      </div>
    </section>
  )
}
