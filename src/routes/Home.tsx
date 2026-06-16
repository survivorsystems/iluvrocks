import { ArrowRight, BookOpen, Compass, MapPinned, Pickaxe, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturePanel from '../components/FeaturePanel'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Community field notes</p>
          <h1>RockHound</h1>
          <p>
            A field-first home for rockhounds to discover public collecting knowledge,
            learn specimen basics, and connect with careful local explorers.
          </p>
          <div className="hero-actions">
            <Link to="/feed" className="primary-action">
              Browse the feed
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/community" className="secondary-action">
              Explore community
            </Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="RockHound highlights">
          <div>
            <Compass aria-hidden="true" />
            <span>Recent finds</span>
          </div>
          <div>
            <UsersRound aria-hidden="true" />
            <span>Local collectors</span>
          </div>
        </div>
      </section>
      <section className="public-section">
        <p className="eyebrow">For visitors</p>
        <h2>Start learning before you sign up</h2>
        <div className="feature-grid">
          <FeaturePanel icon={MapPinned} title="Public locations" description="Browse collecting-region basics, access reminders, and safety context." />
          <FeaturePanel icon={BookOpen} title="Field guide" description="Learn common minerals, specimen care, and responsible collecting habits." />
          <FeaturePanel icon={Pickaxe} title="Find stories" description="Read recent community finds and trip notes without needing an account." />
        </div>
      </section>
    </>
  )
}
