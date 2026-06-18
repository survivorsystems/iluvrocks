import { MapPin } from 'lucide-react'
import { SectionHeader } from '../components/ui'

const locations = [
  'Damon Point beach gravels',
  'Teanaway river bars',
  'Greenwater road cuts',
  'Yakima Canyon scouting loop',
]

export default function SavedLocations() {
  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Saved locations"
        title="Places worth another look"
        description="Keep public access notes, safety details, and collection rules close at hand."
      />
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
