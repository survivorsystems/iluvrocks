const queues = [
  { label: 'Location submissions', count: 12 },
  { label: 'Flagged posts', count: 2 },
  { label: 'Pending group requests', count: 5 },
]

export default function AdminDashboard() {
  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Admin</p>
        <h1>RockHound operations</h1>
        <p>Moderate community data, review submissions, and keep public information tidy.</p>
      </div>
      <div className="stats-grid">
        {queues.map((queue) => (
          <div key={queue.label} className="stat-card">
            <strong>{queue.count}</strong>
            <span>{queue.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
