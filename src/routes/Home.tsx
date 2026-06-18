import { ArrowRight, Compass, Gem, Pickaxe, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeaturePanel from '../components/FeaturePanel'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Community field notes</p>
          <h1>iluvrocks</h1>
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
        <div className="hero-panel" aria-label="iluvrocks highlights">
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
          <FeaturePanel icon={UsersRound} title="Featured members" description="Preview member stories, founding hounds, and collection interests before creating your Basecamp." />
          <FeaturePanel icon={Gem} title="Collection showcases" description="See what members are adding to their collections and how they document each specimen." />
        </div>
        <div className="hero-actions">
          <Link to="/members" className="secondary-action">
            Featured members
          </Link>
          <Link to="/membership" className="secondary-action">
            Membership info
          </Link>
        </div>
      </section>
    </>
  )
}
