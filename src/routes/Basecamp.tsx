import { CalendarDays, MapPinned, Pickaxe, ShieldCheck } from 'lucide-react'
import FeaturePanel from '../components/FeaturePanel'
import { useAppAuth } from '../lib/devAuth'

const stats = [
  { label: 'Finds logged', value: '18' },
  { label: 'Saved locations', value: '7' },
  { label: 'Trips planned', value: '3' },
]

export default function Basecamp() {
  const { user } = useAppAuth()

  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Basecamp</p>
        <h1>Welcome back{user ? `, ${user.displayName}` : ''}</h1>
        <p>Plan trips, track finds, and keep your field notes organized before the next hunt.</p>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="feature-grid">
        <FeaturePanel icon={Pickaxe} title="Next find" description="Start a field log with mineral, site, photos, and conditions." />
        <FeaturePanel icon={MapPinned} title="Saved routes" description="Keep promising collecting sites and scouting notes in one place." />
        <FeaturePanel icon={CalendarDays} title="Trip plans" description="Draft checklists, dates, permits, weather notes, and companions." />
        <FeaturePanel icon={ShieldCheck} title="Safety" description="Prepare check-ins and emergency details before heading out." />
      </div>
    </section>
  )
}
