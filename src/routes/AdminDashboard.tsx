import { SectionHeader, StatCard } from '../components/ui'

const queues = [
  { label: 'Location submissions', count: 12 },
  { label: 'Flagged posts', count: 2 },
  { label: 'Pending group requests', count: 5 },
]

export default function AdminDashboard() {
  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Admin"
        title="RockHound operations"
        description="Moderate community data, review submissions, and keep public information tidy."
      />
      <div className="stats-grid">
        {queues.map((queue) => (
          <StatCard key={queue.label} label={queue.label} value={queue.count} />
        ))}
      </div>
    </section>
  )
}
