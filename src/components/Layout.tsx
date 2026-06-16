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
        <AuthLink />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function AuthLink() {
  const auth = useAuthProfileState()

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
