import type { ComponentType, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import {
  Bell,
  ChevronDown,
  Compass,
  Diamond,
  Home,
  Mail,
  Menu,
  MessageCircle,
  Navigation,
  Plus,
  Search,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuthProfileState } from '../lib/authState'

type IconType = LucideIcon | ComponentType<{ 'aria-hidden'?: boolean; className?: string }>

const workspaceNavItems = [
  { to: '/basecamp', label: 'Home', icon: Home },
  { to: '/collections', label: 'Collections', icon: Diamond },
  { to: '/community', label: 'Community', icon: MessageCircle },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const auth = useAuthProfileState()
  const viewer = auth.viewer?.user
  const displayName = viewer?.name?.trim() || auth.user?.displayName || viewer?.username || 'RockHounder'

  return (
    <div className="app-workspace">
      <Sidebar />
      <div className="app-workspace-content">
        <TopNavigation avatarLabel={getInitials(displayName)} />
        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="app-sidebar" aria-label="Logged-in navigation">
      <Link to="/basecamp" className="app-logo" aria-label="iluvrocks home">
        <span className="app-logo-mark" aria-hidden="true" />
        <span>iluvrocks</span>
      </Link>
      <nav className="app-sidebar-nav">
        {workspaceNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={label} to={to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <Link to="/feed" className="app-sidebar-action">
        <Plus aria-hidden="true" />
        <span>Create Post</span>
      </Link>
    </aside>
  )
}

export function TopNavigation({ avatarLabel = 'RH' }: { avatarLabel?: string }) {
  return (
    <header className="app-topnav">
      <button className="icon-button topnav-menu" type="button" aria-label="Open navigation">
        <Menu aria-hidden="true" />
      </button>
      <label className="app-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Search</span>
        <input placeholder="Search rocks, users, collections..." />
      </label>
      <div className="app-topnav-actions">
        <button className="icon-button" type="button" aria-label="Explore">
          <Navigation aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" aria-label="Messages">
          <MessageCircle aria-hidden="true" />
        </button>
        <button className="icon-button notification-action" type="button" aria-label="Notifications">
          <Bell aria-hidden="true" />
          <NotificationIndicator count={3} />
        </button>
        <button type="button" className="avatar-action" aria-label="User menu">
          <span>{avatarLabel}</span>
          <ChevronDown aria-hidden="true" />
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
    <button className={`ui-button ui-button-${variant} ${className}`.trim()} {...props}>
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

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'achievement' | 'dark'
  className?: string
}) {
  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon?: IconType }) {
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

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="ui-progress" aria-label={label} aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export function NotificationIndicator({ count }: { count?: number }) {
  if (!count) return null
  return <span className="notification-indicator">{count > 9 ? '9+' : count}</span>
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
