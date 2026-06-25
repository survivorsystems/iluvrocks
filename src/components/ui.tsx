import type {
  ComponentType,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import {
  Bell,
  Compass,
  Diamond,
  Home,
  Mail,
  MessageCircle,
  LogOut,
  Route,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthProfileState } from '../lib/authState'
import iluvrocksLogo from '../assets/brand/iluvrocks-logo-wide-dark.png'

type IconType =
  | LucideIcon
  | ComponentType<{ 'aria-hidden'?: boolean; className?: string }>

const workspaceNavItems = [
  { to: '/', label: 'Homepage', icon: Home },
  { to: '/basecamp', label: 'Basecamp', icon: Compass },
  { to: '/trip-planner', label: 'Trip Planner', icon: Compass },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/collections', label: 'Collections', icon: Diamond },
  { to: '/community', label: 'Community', icon: MessageCircle },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  return (
    <div className="app-workspace">
      <div className="app-workspace-content">
        <TopNavigation />
        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function TopNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuthProfileState()
  const navItems = workspaceNavItems.filter(
    (item) => !(location.pathname === '/basecamp' && item.to === '/basecamp'),
  )

  const handleSignOut = async () => {
    await auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-topnav">
      <Link to="/" className="app-logo" aria-label="iluvrocks homepage">
        <img src={iluvrocksLogo} alt="" className="app-logo-image" />
        <span className="sr-only">iluvrocks</span>
      </Link>
      <nav className="app-folder-tabs" aria-label="Logged-in navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="app-topnav-actions">
        <button
          type="button"
          className="topnav-signout"
          onClick={() => void handleSignOut()}
          aria-label="Sign out"
        >
          <LogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}

export function Card({
  children,
  className = '',
  as: Element = 'section',
  ...props
}: {
  children: ReactNode
  className?: string
  as?: 'article' | 'section' | 'div'
} & HTMLAttributes<HTMLElement>) {
  return (
    <Element className={`ui-card ${className}`.trim()} {...props}>
      {children}
    </Element>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="ui-input" {...props} />
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon?: IconType
}) {
  return (
    <Card className="ui-stat-card" as="div">
      {Icon ? <Icon aria-hidden={true} /> : null}
      <strong>{value}</strong>
      <span>{label}</span>
    </Card>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Card className="ui-empty-state">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </Card>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="section-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-header-action">{action}</div> : null}
    </header>
  )
}

export function ProgressBar({
  value,
  label,
}: {
  value: number
  label?: string
}) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div
      className="ui-progress"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export function NotificationIndicator({ count }: { count?: number }) {
  if (!count) return null
  return (
    <span className="notification-indicator">{count > 9 ? '9+' : count}</span>
  )
}

export function getInitials(name?: string) {
  const cleaned = name?.trim()
  if (!cleaned) return 'RH'
  return cleaned
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { Compass }
