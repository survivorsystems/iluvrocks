import { Mountain, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import DevModeBadge from './DevModeBadge'
import { useAuthProfileState } from '../lib/authState'
import { AppShell } from './ui'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/discoveries', label: 'Discoveries' },
  { to: '/community', label: 'Community' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/about', label: 'About' },
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
  '/business/manage',
  '/admin',
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
          <Mountain aria-hidden="true" />
          <span>iluvrocks</span>
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
