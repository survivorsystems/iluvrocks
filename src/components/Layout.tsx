import { Mountain, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import DevModeBadge from './DevModeBadge'
import { useAuthProfileState } from '../lib/authState'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/discoveries', label: 'Discoveries' },
  { to: '/clubs', label: 'Clubs' },
  { to: '/community', label: 'Community' },
  { to: '/about', label: 'About' },
]

const accountNavItems = [
  { to: '/basecamp', label: 'Basecamp' },
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
          {auth.isAuthenticated
            ? accountNavItems.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                </NavLink>
              ))
            : null}
        </nav>
        <DevModeBadge />
        <AuthLink auth={auth} />
      </header>
      <main>
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
    <NavLink to="/login" className="icon-link" aria-label="Create your Basecamp">
      <UserRound aria-hidden="true" />
      <span>Create your Basecamp</span>
    </NavLink>
  )
}
