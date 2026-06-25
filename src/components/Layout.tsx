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

const skagitTheme = {
  background: '#F5F4EF',
  surface: '#FFFFFF',
  surfaceAlt: '#D8DAD7',
  textPrimary: '#0B0B0A',
  textSecondary: '#56644A',
  border: '#D8DAD7',
  divider: '#D8DAD7',
  primary: '#355C6B',
  primaryHover: '#7A9AA8',
  accent: '#B7A48A',
  navText: '#F5F4EF',
}

const legacyThemeValues = new Set(
  [
    '#050505',
    '#111111',
    '#242424',
    '#0b0b0a',
    '#ffffff',
    '#f7f7f4',
    '#f1f1ee',
    '#686864',
    '#deded9',
    '#ecece8',
    '#f2c94c',
  ].map((value) => value.toLowerCase()),
)

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
    [
      '--color-background',
      resolveSkagitColor(theme?.mainBackgroundColor, skagitTheme.background),
    ],
    ['--color-surface', resolveSkagitColor(theme?.cardBackgroundColor, skagitTheme.surface)],
    [
      '--color-surface-alt',
      resolveSkagitColor(theme?.secondaryBackgroundColor, skagitTheme.surfaceAlt),
    ],
    ['--color-text-primary', resolveSkagitColor(theme?.textColor, skagitTheme.textPrimary)],
    [
      '--color-text-secondary',
      resolveSkagitColor(theme?.mutedTextColor, skagitTheme.textSecondary),
    ],
    ['--color-border', resolveSkagitColor(theme?.cardBorderColor, skagitTheme.border)],
    ['--color-divider', skagitTheme.divider],
    [
      '--color-primary',
      resolveSkagitColor(theme?.buttonBackgroundColor || theme?.primaryColor, skagitTheme.primary),
    ],
    ['--color-primary-hover', resolveSkagitColor(theme?.buttonHoverColor, skagitTheme.primaryHover)],
    ['--color-accent-yellow', resolveSkagitColor(theme?.accentColor, skagitTheme.accent)],
    ['--theme-heading-color', resolveSkagitColor(theme?.headerTextColor, skagitTheme.primary)],
    [
      '--theme-subheading-color',
      resolveSkagitColor(theme?.subheaderTextColor, skagitTheme.textSecondary),
    ],
    ['--theme-link-color', resolveSkagitColor(theme?.linkColor, skagitTheme.primary)],
    ['--theme-button-bg', resolveSkagitColor(theme?.buttonBackgroundColor, skagitTheme.primary)],
    ['--theme-button-text', resolveSkagitColor(theme?.buttonTextColor, '#FFFFFF')],
    ['--theme-button-border', resolveSkagitColor(theme?.buttonBorderColor, skagitTheme.primary)],
    ['--theme-button-hover-bg', resolveSkagitColor(theme?.buttonHoverColor, skagitTheme.primaryHover)],
    ['--theme-button-hover-text', resolveSkagitColor(theme?.buttonHoverTextColor, '#FFFFFF')],
    ['--theme-button-radius', resolveRadius(theme?.buttonBorderRadius, '999px')],
    ['--theme-button-border-width', theme?.buttonBorderWidth],
    ['--theme-button-height', theme?.buttonSize],
    ['--theme-card-bg', resolveSkagitColor(theme?.cardBackgroundColor, skagitTheme.surface)],
    ['--theme-card-text', resolveSkagitColor(theme?.cardTextColor, skagitTheme.textSecondary)],
    [
      '--theme-card-header-text',
      resolveSkagitColor(theme?.cardHeaderTextColor, skagitTheme.primary),
    ],
    ['--theme-card-border', resolveSkagitColor(theme?.cardBorderColor, skagitTheme.border)],
    ['--theme-card-opacity', theme?.cardOpacity],
    ['--theme-card-radius', resolveRadius(theme?.cardBorderRadius, '22px')],
    ['--theme-card-padding', theme?.cardPadding],
    ['--theme-input-radius', theme?.inputBorderRadius],
    ['--theme-nav-bg', resolveSkagitColor(theme?.navBackgroundColor, skagitTheme.primary)],
    ['--theme-nav-text', resolveSkagitColor(theme?.navTextColor, skagitTheme.navText)],
    ['--theme-sidebar-bg', resolveSkagitColor(theme?.sidebarBackgroundColor, skagitTheme.primary)],
    ['--theme-sidebar-text', resolveSkagitColor(theme?.sidebarTextColor, skagitTheme.navText)],
    [
      '--theme-sidebar-active-bg',
      resolveSkagitColor(theme?.sidebarActiveBackgroundColor, skagitTheme.primaryHover),
    ],
    [
      '--theme-sidebar-active-text',
      resolveSkagitColor(theme?.sidebarActiveTextColor, '#FFFFFF'),
    ],
    [
      '--theme-sidebar-hover-bg',
      resolveSkagitColor(theme?.sidebarHoverBackgroundColor, skagitTheme.primaryHover),
    ],
    [
      '--theme-sidebar-hover-text',
      resolveSkagitColor(theme?.sidebarHoverTextColor, '#FFFFFF'),
    ],
    ['--theme-footer-bg', resolveSkagitColor(theme?.footerBackgroundColor, skagitTheme.primary)],
    ['--theme-footer-text', resolveSkagitColor(theme?.footerTextColor, skagitTheme.navText)],
    ['--theme-badge-bg', resolveSkagitColor(theme?.badgeBackgroundColor, skagitTheme.accent)],
    ['--theme-badge-text', resolveSkagitColor(theme?.badgeTextColor, skagitTheme.textPrimary)],
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
    [
      '--theme-search-bg',
      resolveSkagitColor(theme?.searchBarBackgroundColor, 'rgba(245, 244, 239, 0.94)'),
    ],
    ['--theme-search-text', resolveSkagitColor(theme?.searchBarTextColor, skagitTheme.primary)],
    [
      '--theme-search-border',
      resolveSkagitColor(theme?.searchBarBorderColor, 'rgba(245, 244, 239, 0.76)'),
    ],
    [
      '--theme-search-button-bg',
      resolveSkagitColor(theme?.searchBarButtonBackgroundColor, skagitTheme.primary),
    ],
    [
      '--theme-search-button-text',
      resolveSkagitColor(theme?.searchBarButtonTextColor, '#FFFFFF'),
    ],
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

function resolveSkagitColor(value: string | undefined, fallback: string) {
  if (!value?.trim()) return fallback
  const normalized = value.trim().toLowerCase()
  return legacyThemeValues.has(normalized) ? fallback : value
}

function resolveRadius(value: string | undefined, fallback: string) {
  if (!value?.trim()) return fallback
  const match = value.trim().match(/^(\d+(?:\.\d+)?)px$/)
  if (!match) return value
  return Number(match[1]) < 16 ? fallback : value
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
