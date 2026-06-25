import { UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import iluvrocksLogo from '../assets/brand/iluvrocks-logo-river.png'
import DevModeBadge from './DevModeBadge'
import { useAuthProfileState } from '../lib/authState'
import { AppShell } from './ui'

const navItems = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/materials', label: 'Materials' },
  { to: '/trip-planner', label: 'Trip Planner' },
  { to: '/businesses', label: 'Business Directory' },
  { to: '/guides', label: 'Guides' },
]

const accountNavItems = [{ to: '/basecamp', label: 'Basecamp' }]

const workspaceRoutePrefixes = [
  '/basecamp',
  '/collection',
  '/collections',
  '/community',
  '/log-find',
  '/messages',
  '/notifications',
  '/settings',
  '/trips',
  '/business/manage',
]

export default function Layout() {
  const auth = useAuthProfileState()
  const location = useLocation()
  const isWorkspaceRoute = workspaceRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  )

  if (isWorkspaceRoute && auth.isAuthenticated) {
    return <AppShell />
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="iluvrocks home">
          <img
            src={iluvrocksLogo}
            alt=""
            className="brand-logo-image brand-logo-wide"
          />
          <span className="sr-only">iluvrocks</span>
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
      <button
        type="button"
        className="icon-link"
        onClick={() => void auth.signOut()}
        aria-label="Sign out"
      >
        Sign out
      </button>
    )
  }

  return (
    <NavLink
      to="/login"
      className="icon-link"
      aria-label="Create your Basecamp"
    >
      <UserRound aria-hidden="true" />
      <span>Create your Basecamp</span>
    </NavLink>
  )
}
