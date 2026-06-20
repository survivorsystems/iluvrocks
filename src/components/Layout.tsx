import { useEffect, useMemo } from 'react'
import { UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import iluvrocksLogo from '../assets/brand/iluvrocks-logo-wide-dark.png'
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
  '/admin',
]

export default function Layout() {
  const auth = useAuthProfileState()
  const location = useLocation()
  const appearance = useQuery((api as any).adminPublic.getSiteAppearance, {})
  const isWorkspaceRoute = workspaceRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  )
  const publicNavItems = useMemo(
    () => parseNavigation(appearance?.navigationJson),
    [appearance?.navigationJson],
  )

  useEffect(() => {
    applyThemeSettings(appearance)
  }, [appearance])

  if (isWorkspaceRoute && auth.isAuthenticated) {
    return <AppShell />
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="iluvrocks home">
          <img
            src={appearance?.logoUrl || iluvrocksLogo}
            alt=""
            className="brand-logo-image brand-logo-wide"
          />
          <span className="sr-only">iluvrocks</span>
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          {publicNavItems.map((item) => (
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

function applyThemeSettings(appearance: any) {
  const root = document.documentElement
  const mappings: Array<[string, string | undefined]> = [
    ['--color-background', appearance?.mainBackgroundColor],
    ['--color-surface', appearance?.cardBackgroundColor],
    ['--color-surface-alt', appearance?.secondaryBackgroundColor],
    ['--color-text-primary', appearance?.textColor],
    ['--color-text-secondary', appearance?.mutedTextColor],
    [
      '--color-primary',
      appearance?.buttonBackgroundColor || appearance?.primaryColor,
    ],
    ['--color-primary-hover', appearance?.buttonHoverColor],
    ['--color-accent-yellow', appearance?.accentColor],
    ['--theme-heading-color', appearance?.headerTextColor],
    ['--theme-subheading-color', appearance?.subheaderTextColor],
    ['--theme-link-color', appearance?.linkColor],
    ['--theme-button-bg', appearance?.buttonBackgroundColor],
    ['--theme-button-text', appearance?.buttonTextColor],
    ['--theme-button-border', appearance?.buttonBorderColor],
    ['--theme-button-hover-bg', appearance?.buttonHoverColor],
    ['--theme-button-hover-text', appearance?.buttonHoverTextColor],
    ['--theme-button-radius', appearance?.buttonBorderRadius],
    ['--theme-button-border-width', appearance?.buttonBorderWidth],
    ['--theme-button-height', appearance?.buttonSize],
    ['--theme-card-bg', appearance?.cardBackgroundColor],
    ['--theme-card-text', appearance?.cardTextColor],
    ['--theme-card-border', appearance?.cardBorderColor],
    ['--theme-card-opacity', appearance?.cardOpacity],
    ['--theme-card-radius', appearance?.cardBorderRadius],
    ['--theme-card-padding', appearance?.cardPadding],
    ['--theme-input-radius', appearance?.inputBorderRadius],
    ['--theme-nav-bg', appearance?.navBackgroundColor],
    ['--theme-nav-text', appearance?.navTextColor],
    ['--theme-sidebar-bg', appearance?.sidebarBackgroundColor],
    ['--theme-sidebar-text', appearance?.sidebarTextColor],
    ['--theme-sidebar-active-bg', appearance?.sidebarActiveBackgroundColor],
    ['--theme-sidebar-active-text', appearance?.sidebarActiveTextColor],
    ['--theme-sidebar-hover-bg', appearance?.sidebarHoverBackgroundColor],
    ['--theme-sidebar-hover-text', appearance?.sidebarHoverTextColor],
    ['--theme-footer-bg', appearance?.footerBackgroundColor],
    ['--theme-footer-text', appearance?.footerTextColor],
    ['--theme-badge-bg', appearance?.badgeBackgroundColor],
    ['--theme-badge-text', appearance?.badgeTextColor],
    ['--theme-header-font', appearance?.headerFont],
    ['--theme-subheader-font', appearance?.subheaderFont],
    ['--theme-body-font', appearance?.bodyFont],
    ['--theme-button-font', appearance?.buttonFont],
    ['--theme-header-size', appearance?.headerTextSize],
    ['--theme-subheader-size', appearance?.subheaderTextSize],
    ['--theme-body-size', appearance?.bodyTextSize],
    ['--theme-button-size', appearance?.buttonTextSize],
    ['--theme-line-height', appearance?.lineHeight],
    ['--theme-letter-spacing', appearance?.letterSpacing],
    ['--theme-section-spacing', appearance?.sectionSpacing],
    ['--theme-page-max-width', appearance?.pageMaxWidth],
    ['--theme-overlay-opacity', appearance?.defaultOverlayOpacity],
    [
      '--theme-card-shadow',
      appearance?.cardShadowEnabled === false ? 'none' : undefined,
    ],
    [
      '--theme-homepage-background-image',
      appearance?.homepageBackgroundUrl
        ? `url(${appearance.homepageBackgroundUrl})`
        : undefined,
    ],
    [
      '--theme-default-page-background-image',
      appearance?.defaultPageBackgroundUrl
        ? `url(${appearance.defaultPageBackgroundUrl})`
        : undefined,
    ],
  ]

  for (const [property, value] of mappings) {
    if (value === undefined || value === null || value === '') {
      root.style.removeProperty(property)
    } else {
      root.style.setProperty(property, value)
    }
  }

  if (appearance?.buttonBackgroundColor || appearance?.primaryColor) {
    const primary = appearance.buttonBackgroundColor || appearance.primaryColor
    root.style.setProperty('--color-active', primary)
    root.style.setProperty('--color-selected', primary)
  }

  if (appearance?.faviconUrl) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    favicon?.setAttribute('href', appearance.faviconUrl)
  }
}

function parseNavigation(value?: string) {
  if (!value?.trim()) return navItems

  const routeMap: Record<string, string> = {
    home: '/',
    destinations: '/destinations',
    materials: '/materials',
    'trip planner': '/trip-planner',
    'business directory': '/businesses',
    businesses: '/businesses',
    guides: '/guides',
    about: '/about',
    community: '/community',
  }

  const parsed = value
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      to:
        routeMap[label.toLowerCase()] ||
        `/${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    }))

  return parsed.length ? parsed : navItems
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
