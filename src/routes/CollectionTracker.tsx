const specimens = [
  { name: 'Carnelian agate', origin: 'Olympic Peninsula', status: 'Cleaned' },
  { name: 'Picture jasper', origin: 'Central Washington', status: 'Needs catalog photo' },
  { name: 'Quartz point', origin: 'Cascade foothills', status: 'Measured' },
]

export default function CollectionTracker() {
  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Collection tracker</p>
        <h1>Catalog the keepers</h1>
        <p>Track specimens, locations, photos, prep status, and the story behind each find.</p>
      </div>
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
