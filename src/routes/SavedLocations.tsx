import { MapPin } from 'lucide-react'

const locations = [
  'Damon Point beach gravels',
  'Teanaway river bars',
  'Greenwater road cuts',
  'Yakima Canyon scouting loop',
]

export default function SavedLocations() {
  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Saved locations</p>
        <h1>Places worth another look</h1>
        <p>Keep public access notes, safety details, and collection rules close at hand.</p>
      </div>
      <div className="location-list">
        {locations.map((location) => (
          <article key={location} className="location-card">
            <MapPin aria-hidden="true" />
            <div>
              <h2>{location}</h2>
              <p>Access notes, conditions, and personal reminders will live here.</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
