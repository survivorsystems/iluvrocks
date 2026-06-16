import { ArrowRight, Compass, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Community field notes</p>
        <h1>RockApp</h1>
        <p>
          A lightweight social hub for rockhounds to share finds, trip notes, local
          knowledge, and the stories behind the specimens.
        </p>
        <div className="hero-actions">
          <Link to="/feed" className="primary-action">
            Open feed
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/login" className="secondary-action">
            Sign in
          </Link>
        </div>
      </div>
      <div className="hero-panel" aria-label="RockApp highlights">
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
  )
}
