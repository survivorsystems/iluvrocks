import { EmptyState, SectionHeader } from '../components/ui'

export default function SavedLocations() {
  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Saved locations"
        title="Places worth another look"
        description="Keep public access notes, safety details, and collection rules close at hand."
      />
      <EmptyState
        title="No saved locations yet"
        description="Real saved places will appear here after members start saving locations."
      />
    </section>
  )
}
