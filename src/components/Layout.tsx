import { Mountain, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import DevModeBadge from './DevModeBadge'
import { useAuthProfileState } from '../lib/authState'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/feed', label: 'Feed' },
  { to: '/community', label: 'Community' },
  { to: '/basecamp', label: 'Basecamp' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout() {
  const auth = useAuthProfileState()

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="RockHound home">
          <Mountain aria-hidden="true" />
          <span>RockHound</span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <DevModeBadge />
        <AuthLink auth={auth} />
      </header>
      <main>
        <ProfileSetupBanner auth={auth} />
        <Outlet />
      </main>
    </div>
  )
}

function AuthLink({ auth }: { auth: ReturnType<typeof useAuthProfileState> }) {
  if (auth.isAuthenticated) {
    return (
      <button type="button" className="icon-link" onClick={() => void auth.signOut()} aria-label="Sign out">
        Sign out
      </button>
    )
  }

  return (
    <NavLink to="/login" className="icon-link" aria-label="Sign in">
      <UserRound aria-hidden="true" />
      <span className="sr-only">Sign in</span>
    </NavLink>
  )
}

function ProfileSetupBanner({ auth }: { auth: ReturnType<typeof useAuthProfileState> }) {
  if (!auth.isAuthenticated || auth.hasProfile || auth.state === 'loadingAuth') return null

  return (
    <section className="profile-setup-banner" aria-label="Profile setup reminder">
      <div>
        <strong>Finish setting up your Basecamp profile</strong>
        <p>Add your handle, region, and field notes when you are ready.</p>
      </div>
      <NavLink to="/onboarding/profile">Finish profile</NavLink>
    </section>
  )
}
