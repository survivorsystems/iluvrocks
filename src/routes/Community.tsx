import { MessageSquare, Radio, UsersRound } from 'lucide-react'
import FeaturePanel from '../components/FeaturePanel'

export default function Community() {
  return (
    <section className="workspace-page">
      <div className="workspace-header">
        <p className="eyebrow">Community</p>
        <h1>Local knowledge, shared carefully</h1>
        <p>Regional rooms, field reports, meetups, and respectful location discussions.</p>
      </div>
      <div className="feature-grid">
        <FeaturePanel icon={UsersRound} title="Regional groups" description="Find people collecting in the same terrain and conditions." />
        <FeaturePanel icon={MessageSquare} title="Field threads" description="Discuss finds, prep methods, IDs, and access updates." />
        <FeaturePanel icon={Radio} title="Trip signals" description="Post meetup interest, weather notes, and community alerts." />
      </div>
    </section>
  )
}
