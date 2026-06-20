import { useEffect, useMemo } from 'react'
import { UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import iluvrocksLogo from '../assets/brand/iluvrocks-logo-wide-dark.png'
import CustomEmbedBlocks from './CustomEmbedBlocks'
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
  const activePageStyle = useMemo(
    () => getActivePageStyle(appearance?.pageStylesJson, location.pathname),
    [appearance?.pageStylesJson, location.pathname],
  )

  useEffect(() => {
    applyThemeSettings(appearance, activePageStyle)
  }, [appearance, activePageStyle])

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
        <CustomEmbedBlocks />
      </main>
    </div>
  )
}

function applyThemeSettings(
  appearance: any,
  pageStyle?: Record<string, string>,
) {
  const theme = { ...(appearance ?? {}), ...(pageStyle ?? {}) }
  const root = document.documentElement
  const mappings: Array<[string, string | undefined]> = [
    ['--color-background', theme?.mainBackgroundColor],
    ['--color-surface', theme?.cardBackgroundColor],
    ['--color-surface-alt', theme?.secondaryBackgroundColor],
    ['--color-text-primary', theme?.textColor],
    ['--color-text-secondary', theme?.mutedTextColor],
    ['--color-primary', theme?.buttonBackgroundColor || theme?.primaryColor],
    ['--color-primary-hover', theme?.buttonHoverColor],
    ['--color-accent-yellow', theme?.accentColor],
    ['--theme-heading-color', theme?.headerTextColor],
    ['--theme-subheading-color', theme?.subheaderTextColor],
    ['--theme-link-color', theme?.linkColor],
    ['--theme-button-bg', theme?.buttonBackgroundColor],
    ['--theme-button-text', theme?.buttonTextColor],
    ['--theme-button-border', theme?.buttonBorderColor],
    ['--theme-button-hover-bg', theme?.buttonHoverColor],
    ['--theme-button-hover-text', theme?.buttonHoverTextColor],
    ['--theme-button-radius', theme?.buttonBorderRadius],
    ['--theme-button-border-width', theme?.buttonBorderWidth],
    ['--theme-button-height', theme?.buttonSize],
    ['--theme-card-bg', theme?.cardBackgroundColor],
    ['--theme-card-text', theme?.cardTextColor],
    ['--theme-card-header-text', theme?.cardHeaderTextColor],
    ['--theme-card-border', theme?.cardBorderColor],
    ['--theme-card-opacity', theme?.cardOpacity],
    ['--theme-card-radius', theme?.cardBorderRadius],
    ['--theme-card-padding', theme?.cardPadding],
    ['--theme-input-radius', theme?.inputBorderRadius],
    ['--theme-nav-bg', theme?.navBackgroundColor],
    ['--theme-nav-text', theme?.navTextColor],
    ['--theme-sidebar-bg', theme?.sidebarBackgroundColor],
    ['--theme-sidebar-text', theme?.sidebarTextColor],
    ['--theme-sidebar-active-bg', theme?.sidebarActiveBackgroundColor],
    ['--theme-sidebar-active-text', theme?.sidebarActiveTextColor],
    ['--theme-sidebar-hover-bg', theme?.sidebarHoverBackgroundColor],
    ['--theme-sidebar-hover-text', theme?.sidebarHoverTextColor],
    ['--theme-footer-bg', theme?.footerBackgroundColor],
    ['--theme-footer-text', theme?.footerTextColor],
    ['--theme-badge-bg', theme?.badgeBackgroundColor],
    ['--theme-badge-text', theme?.badgeTextColor],
    ['--theme-header-font', theme?.headerFont],
    ['--theme-subheader-font', theme?.subheaderFont],
    ['--theme-body-font', theme?.bodyFont],
    ['--theme-button-font', theme?.buttonFont],
    ['--theme-header-size', theme?.headerTextSize],
    ['--theme-subheader-size', theme?.subheaderTextSize],
    ['--theme-body-size', theme?.bodyTextSize],
    ['--theme-button-size', theme?.buttonTextSize],
    ['--theme-line-height', theme?.lineHeight],
    ['--theme-letter-spacing', theme?.letterSpacing],
    ['--theme-section-spacing', theme?.sectionSpacing],
    ['--theme-page-max-width', theme?.pageMaxWidth],
    [
      '--theme-overlay-opacity',
      theme?.overlayOpacity ?? theme?.defaultOverlayOpacity,
    ],
    ['--theme-search-bg', theme?.searchBarBackgroundColor],
    ['--theme-search-text', theme?.searchBarTextColor],
    ['--theme-search-border', theme?.searchBarBorderColor],
    ['--theme-search-button-bg', theme?.searchBarButtonBackgroundColor],
    ['--theme-search-button-text', theme?.searchBarButtonTextColor],
    [
      '--theme-card-shadow',
      theme?.cardShadowEnabled === false ? 'none' : undefined,
    ],
    [
      '--theme-homepage-background-image',
      theme?.homepageBackgroundUrl
        ? `url(${theme.homepageBackgroundUrl})`
        : undefined,
    ],
    [
      '--theme-default-page-background-image',
      theme?.defaultPageBackgroundUrl
        ? `url(${theme.defaultPageBackgroundUrl})`
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

  if (theme?.buttonBackgroundColor || theme?.primaryColor) {
    const primary = theme.buttonBackgroundColor || theme.primaryColor
    root.style.setProperty('--color-active', primary)
    root.style.setProperty('--color-selected', primary)
  }

  if (appearance?.faviconUrl) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    favicon?.setAttribute('href', appearance.faviconUrl)
  }
}

function getActivePageStyle(value: string | undefined, pathname: string) {
  if (!value?.trim()) return undefined
  try {
    const styles = JSON.parse(value) as Array<Record<string, string>>
    const key = getPageKey(pathname)
    return styles.find((style) => style.page === key)
  } catch {
    return undefined
  }
}

function getPageKey(pathname: string) {
  if (pathname === '/') return 'home'
  const clean = pathname.split('/').filter(Boolean)[0] || 'home'
  if (clean === 'businesses') return 'businesses'
  if (clean === 'trip-planner') return 'trip-planner'
  return clean
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
