import {
  Award,
  BookOpen,
  CheckCircle2,
  Flag,
  MapPinned,
  Mountain,
  Pickaxe,
  ShieldCheck,
} from 'lucide-react'
import { mockRockhoundProfile } from '../data/mockRockhoundProfile'

type RockhoundDashboardProps = {
  mode?: 'basecamp' | 'profile'
}

export default function RockhoundDashboard({ mode = 'basecamp' }: RockhoundDashboardProps) {
  const profile = mockRockhoundProfile
  const title = mode === 'basecamp' ? 'Personal Basecamp' : `${profile.user.displayName}'s RockHound Profile`

  return (
    <section className="trail-dashboard">
      <header className="trail-hero">
        <div className="trail-avatar" aria-hidden="true">
          {profile.user.avatarInitials}
        </div>
        <div className="trail-hero-copy">
          <p className="trail-kicker">@{profile.user.username}</p>
          <h1>{title}</h1>
          <p>{profile.user.bio}</p>
          <div className="trail-chip-row">
            <span>{profile.user.location}</span>
            <span>{profile.user.homeRegion}</span>
            <span>{profile.user.role}</span>
          </div>
        </div>
      </header>

      <section className="trail-stats" aria-label="RockHound stats">
        {profile.stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <div className="trail-grid trail-grid-main">
        <section className="trail-panel collection-showcase">
          <SectionTitle icon={Pickaxe} label="Collection showcase" />
          <div className="specimen-grid">
            {profile.collectionShowcase.map((specimen) => (
              <article key={specimen.name} className="specimen-card">
                <div className="specimen-stone" aria-hidden="true" />
                <h3>{specimen.name}</h3>
                <p>{specimen.detail}</p>
                <span>{specimen.tone}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="trail-panel rockhound-card">
          <SectionTitle icon={ShieldCheck} label="Rockhound card" />
          <dl>
            <div>
              <dt>Focus</dt>
              <dd>{profile.rockhoundCard.focus}</dd>
            </div>
            <div>
              <dt>Collecting style</dt>
              <dd>{profile.rockhoundCard.style}</dd>
            </div>
            <div>
              <dt>Field kit</dt>
              <dd>{profile.rockhoundCard.kit}</dd>
            </div>
            <div>
              <dt>Trail ethic</dt>
              <dd>{profile.rockhoundCard.motto}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="trail-grid trail-grid-secondary">
        <section className="trail-panel">
          <SectionTitle icon={BookOpen} label="Adventure log" />
          <div className="timeline-list">
            {profile.adventureLog.map((entry) => (
              <article key={entry.title} className="timeline-card">
                <h3>{entry.title}</h3>
                <p>{entry.meta}</p>
                <span>{entry.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="trail-panel">
          <SectionTitle icon={Award} label="Placeholder badges" />
          <div className="badge-grid">
            {profile.badges.map((badge) => (
              <article key={badge.title} className="badge-card">
                <Award aria-hidden="true" />
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="trail-grid trail-grid-tertiary">
        <section className="trail-panel">
          <SectionTitle icon={Flag} label="Bucket list" />
          <ul className="trail-list">
            {profile.bucketList.map((item) => (
              <li key={item}>
                <CheckCircle2 aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="trail-panel">
          <SectionTitle icon={Mountain} label="Collection progress" />
          <div className="progress-list">
            {profile.progress.map((item) => (
              <div key={item.label} className="progress-item">
                <div>
                  <span>{item.label}</span>
                  <strong>
                    {item.current}/{item.total}
                  </strong>
                </div>
                <progress value={item.current} max={item.total} />
              </div>
            ))}
          </div>
        </section>

        <section className="trail-panel">
          <SectionTitle icon={MapPinned} label="Local reputation" />
          <div className="reputation-list">
            {profile.reputation.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="trail-panel basecamp-panel">
        <SectionTitle icon={MapPinned} label="Personal Basecamp dashboard" />
        <div className="basecamp-task-grid">
          {profile.basecamp.map((task) => (
            <article key={task.title} className="basecamp-task">
              <h3>{task.title}</h3>
              <p>{task.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: typeof Pickaxe; label: string }) {
  return (
    <div className="trail-section-title">
      <Icon aria-hidden="true" />
      <h2>{label}</h2>
    </div>
  )
}
