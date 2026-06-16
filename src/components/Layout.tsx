import { Mountain, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/feed', label: 'Feed' },
  { to: '/profile/demo', label: 'Profile' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="RockApp home">
          <Mountain aria-hidden="true" />
          <span>RockApp</span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/login" className="icon-link" aria-label="Sign in">
          <UserRound aria-hidden="true" />
        </NavLink>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
