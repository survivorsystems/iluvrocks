import { ArrowRight, Compass, MapPinned, Pickaxe, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturePanel from '../components/FeaturePanel'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Community field notes</p>
          <h1>RockHound</h1>
          <p className="tagline">Built by rockhounds, for rockhounds.</p>
          <p>
            A field-first home for rockhounds to discover public collecting knowledge,
            learn specimen basics, and connect with careful local explorers.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="primary-action">
              Create your Basecamp
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/discoveries" className="secondary-action">
              Browse discoveries
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
          <FeaturePanel icon={Pickaxe} title="Latest public discoveries" description="Read recent community finds and trip notes without needing an account." />
          <FeaturePanel icon={UsersRound} title="Members, clubs, and events" description="Preview featured members, founding hounds, public clubs, and upcoming gatherings." />
          <FeaturePanel icon={MapPinned} title="Challenges and listings" description="Browse challenge previews, business listings, and membership info before joining." />
        </div>
        <div className="hero-actions">
          <Link to="/members" className="secondary-action">
            Featured members
          </Link>
          <Link to="/clubs" className="secondary-action">
            Public clubs
          </Link>
          <Link to="/membership" className="secondary-action">
            Membership info
          </Link>
        </div>
      </section>
    </>
  )
}
