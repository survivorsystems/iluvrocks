import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  BriefcaseBusiness,
  CreditCard,
  ExternalLink,
  FileText,
  Image,
  LayoutDashboard,
  Library,
  Map,
  Paintbrush,
  Route,
  Star,
  Upload,
} from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Button, Card, SectionHeader, StatCard } from '../components/ui'
import { Link } from 'react-router-dom'

type AdminTab =
  | 'overview'
  | 'appearance'
  | 'theme'
  | 'pageStyles'
  | 'destinations'
  | 'materials'
  | 'itineraries'
  | 'places'
  | 'pages'
  | 'resources'
  | 'featured'
  | 'businesses'
  | 'stripe'

const tabs: Array<{
  id: AdminTab
  label: string
  icon: typeof LayoutDashboard
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  { id: 'theme', label: 'Theme / Style Manager', icon: Paintbrush },
  { id: 'pageStyles', label: 'Page Text + Colors', icon: FileText },
  { id: 'destinations', label: 'Destinations', icon: Map },
  { id: 'materials', label: 'Materials', icon: Image },
  { id: 'itineraries', label: 'Itineraries', icon: Route },
  { id: 'places', label: 'Places', icon: BriefcaseBusiness },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'resources', label: 'Resources', icon: Library },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'businesses', label: 'Businesses', icon: BriefcaseBusiness },
  { id: 'stripe', label: 'Stripe test mode', icon: CreditCard },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const overview = useQuery((api as any).admin.overview, {})

  return (
    <section className="workspace-page admin-dashboard">
      <SectionHeader
        eyebrow="Admin Dashboard"
        title="Manage iluvrocks"
        description="Control site content, appearance, resources, businesses, subscriptions, featured sections, and page drafts from one place."
        action={
          <Link to="/" className="ui-button ui-button-secondary">
            <ExternalLink aria-hidden="true" />
            View homepage
          </Link>
        }
      />

      <div className="admin-tabbar" role="tablist" aria-label="Admin tools">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? 'is-active' : undefined}
            onClick={() => setActiveTab(id)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? <OverviewPanel overview={overview} /> : null}
      {activeTab === 'appearance' ? <AppearancePanel /> : null}
      {activeTab === 'theme' ? <ThemeManagerPanel /> : null}
      {activeTab === 'pageStyles' ? <PageTextStylePanel /> : null}
      {activeTab === 'destinations' ? <DestinationsPanel /> : null}
      {activeTab === 'materials' ? <MaterialsPanel /> : null}
      {activeTab === 'itineraries' ? <ItinerariesPanel /> : null}
      {activeTab === 'places' ? <PlacesPanel /> : null}
      {activeTab === 'pages' ? <PagesPanel /> : null}
      {activeTab === 'resources' ? <ResourcesPanel /> : null}
      {activeTab === 'featured' ? <FeaturedPanel /> : null}
      {activeTab === 'businesses' ? <BusinessesPanel /> : null}
      {activeTab === 'stripe' ? <StripePanel overview={overview} /> : null}
    </section>
  )
}

function OverviewPanel({ overview }: { overview: any }) {
  const stats = [
    { label: 'Destinations', value: overview?.destinations ?? 0, icon: Map },
    {
      label: 'Published destinations',
      value: overview?.publishedDestinations ?? 0,
      icon: Map,
    },
    { label: 'Materials', value: overview?.materials ?? 0, icon: Image },
    { label: 'Itineraries', value: overview?.itineraries ?? 0, icon: Route },
    { label: 'Places', value: overview?.places ?? 0, icon: BriefcaseBusiness },
    { label: 'Pages', value: overview?.pages ?? 0, icon: FileText },
    { label: 'Draft pages', value: overview?.draftPages ?? 0, icon: FileText },
    { label: 'Resources', value: overview?.resources ?? 0, icon: Library },
    {
      label: 'Pending businesses',
      value: overview?.pendingBusinesses ?? 0,
      icon: BriefcaseBusiness,
    },
    {
      label: 'Premium businesses',
      value: overview?.premiumBusinesses ?? 0,
      icon: Star,
    },
    {
      label: 'Featured items',
      value: overview?.featuredItems ?? 0,
      icon: Star,
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}

function AppearancePanel() {
  const appearance = useQuery((api as any).admin.getSiteAppearance, {})
  const saveAppearance = useMutation((api as any).admin.saveSiteAppearance)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const getStorageUrl = useMutation(api.uploads.getStorageUrl)
  const [status, setStatus] = useState('')
  const [logo, setLogo] = useState<File | null>(null)

  const [form, setForm] = useState({
    logoUrl: '',
    primaryColor: '#050505',
    accentColor: '#f2c94c',
    homepageHeadline: "Let's Rock",
    homepageIntro: 'Learn How To Rockhound',
    homepageCtaLabel: 'Create your Basecamp',
    navigationJson: 'Home, Discoveries, Community, Businesses, About',
    backgroundJson:
      '{"home":"skagit","basecamp":"skagit","community":"alsea","collections":"haystacks","settings":"cascades"}',
    featuredSectionsJson:
      'Original Hounds, Featured members, Latest discoveries, Beginner guides, Business directory',
  })

  useEffect(() => {
    if (!appearance) return
    setForm({
      logoUrl: appearance.logoUrl ?? '',
      primaryColor: appearance.primaryColor ?? '#050505',
      accentColor: appearance.accentColor ?? '#f2c94c',
      homepageHeadline: appearance.homepageHeadline || "Let's Rock",
      homepageIntro: appearance.homepageIntro || 'Learn How To Rockhound',
      homepageCtaLabel: appearance.homepageCtaLabel || 'Create your Basecamp',
      navigationJson:
        appearance.navigationJson ||
        'Home, Discoveries, Community, Businesses, About',
      backgroundJson:
        appearance.backgroundJson ||
        '{"home":"skagit","basecamp":"skagit","community":"alsea","collections":"haystacks","settings":"cascades"}',
      featuredSectionsJson:
        appearance.featuredSectionsJson ||
        'Original Hounds, Featured members, Latest discoveries, Beginner guides, Business directory',
    })
  }, [appearance])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving appearance...')
    try {
      const logoUrl = logo
        ? await uploadFile(logo, generateUploadUrl, getStorageUrl)
        : form.logoUrl
      await saveAppearance({ ...form, logoUrl })
      setStatus('Appearance saved.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save.')
    }
  }

  return (
    <Card className="admin-panel">
      <AdminPanelHeader
        title="Site appearance management"
        description="Update logo, colors, homepage copy, navigation, backgrounds, and featured sections."
      />
      <form className="admin-form" onSubmit={submit}>
        <label>
          Logo upload
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="form-grid">
          <AdminInput
            label="Primary color"
            value={form.primaryColor}
            onChange={(value) => setForm({ ...form, primaryColor: value })}
          />
          <AdminInput
            label="Yellow accent"
            value={form.accentColor}
            onChange={(value) => setForm({ ...form, accentColor: value })}
          />
        </div>
        <AdminInput
          label="Homepage headline"
          value={form.homepageHeadline}
          onChange={(value) => setForm({ ...form, homepageHeadline: value })}
        />
        <label>
          Homepage intro
          <textarea
            value={form.homepageIntro}
            onChange={(event) =>
              setForm({ ...form, homepageIntro: event.target.value })
            }
          />
        </label>
        <AdminInput
          label="CTA label"
          value={form.homepageCtaLabel}
          onChange={(value) => setForm({ ...form, homepageCtaLabel: value })}
        />
        <AdminInput
          label="Navigation"
          value={form.navigationJson}
          onChange={(value) => setForm({ ...form, navigationJson: value })}
        />
        <AdminInput
          label="Background assignments"
          value={form.backgroundJson}
          onChange={(value) => setForm({ ...form, backgroundJson: value })}
        />
        <AdminInput
          label="Featured sections"
          value={form.featuredSectionsJson}
          onChange={(value) =>
            setForm({ ...form, featuredSectionsJson: value })
          }
        />
        <AdminSaveBar status={status} label="Save appearance" />
      </form>
    </Card>
  )
}

const defaultThemeForm = {
  mainBackgroundColor: '#f7f7f4',
  secondaryBackgroundColor: '#f1f1ee',
  textColor: '#0b0b0a',
  mutedTextColor: '#686864',
  headerTextColor: '#050505',
  subheaderTextColor: '#686864',
  linkColor: '#050505',
  buttonBackgroundColor: '#050505',
  buttonTextColor: '#ffffff',
  buttonBorderColor: '#050505',
  buttonHoverColor: '#f2c94c',
  buttonHoverTextColor: '#050505',
  cardBackgroundColor: '#ffffff',
  cardTextColor: '#0b0b0a',
  cardHeaderTextColor: '#050505',
  cardBorderColor: '#deded9',
  cardOpacity: '1',
  navBackgroundColor: '#ffffff',
  navTextColor: '#050505',
  sidebarBackgroundColor: '#ffffff',
  sidebarTextColor: '#050505',
  sidebarActiveBackgroundColor: '#050505',
  sidebarActiveTextColor: '#ffffff',
  sidebarHoverBackgroundColor: '#f3f3f0',
  sidebarHoverTextColor: '#050505',
  footerBackgroundColor: '#050505',
  footerTextColor: '#ffffff',
  badgeBackgroundColor: '#f2c94c',
  badgeTextColor: '#050505',
  accentColor: '#f2c94c',
  headerFont: 'Inter, ui-sans-serif, system-ui, sans-serif',
  subheaderFont: 'Inter, ui-sans-serif, system-ui, sans-serif',
  bodyFont: 'Inter, ui-sans-serif, system-ui, sans-serif',
  buttonFont: 'Inter, ui-sans-serif, system-ui, sans-serif',
  headerTextSize: 'clamp(2rem, 5vw, 4.5rem)',
  subheaderTextSize: '1rem',
  bodyTextSize: '1rem',
  buttonTextSize: '0.95rem',
  lineHeight: '1.5',
  letterSpacing: '0',
  defaultButtonText: 'Create your Basecamp',
  buttonSize: '2.9rem',
  buttonBorderRadius: '999px',
  buttonBorderWidth: '1px',
  cardBorderRadius: '18px',
  inputBorderRadius: '8px',
  cardPadding: '1.25rem',
  sectionSpacing: '4rem',
  pageMaxWidth: '1180px',
  defaultOverlayOpacity: '0.6',
  logoUrl: '',
  faviconUrl: '',
  homepageBackgroundUrl: '',
  defaultPageBackgroundUrl: '',
}

type ThemeForm = typeof defaultThemeForm
type ThemeField = {
  key: keyof ThemeForm
  label: string
  type?: string
}

const colorThemeFields: ThemeField[] = [
  { key: 'mainBackgroundColor', label: 'Main background color', type: 'color' },
  {
    key: 'secondaryBackgroundColor',
    label: 'Secondary background color',
    type: 'color',
  },
  { key: 'textColor', label: 'Text color', type: 'color' },
  { key: 'mutedTextColor', label: 'Muted text color', type: 'color' },
  { key: 'headerTextColor', label: 'Header text color', type: 'color' },
  { key: 'subheaderTextColor', label: 'Subheader text color', type: 'color' },
  { key: 'linkColor', label: 'Link color', type: 'color' },
  { key: 'accentColor', label: 'Accent color', type: 'color' },
  {
    key: 'buttonBackgroundColor',
    label: 'Button background color',
    type: 'color',
  },
  { key: 'buttonTextColor', label: 'Button text color', type: 'color' },
  { key: 'buttonBorderColor', label: 'Button border color', type: 'color' },
  { key: 'buttonHoverColor', label: 'Button hover color', type: 'color' },
  {
    key: 'buttonHoverTextColor',
    label: 'Button hover text color',
    type: 'color',
  },
  {
    key: 'cardBackgroundColor',
    label: 'Text box/card background color',
    type: 'color',
  },
  { key: 'cardTextColor', label: 'Text box/card text color', type: 'color' },
  {
    key: 'cardHeaderTextColor',
    label: 'Text box/card header text color',
    type: 'color',
  },
  {
    key: 'cardBorderColor',
    label: 'Text box/card border color',
    type: 'color',
  },
  {
    key: 'navBackgroundColor',
    label: 'Top navigation background color',
    type: 'color',
  },
  { key: 'navTextColor', label: 'Top navigation text color', type: 'color' },
  {
    key: 'sidebarBackgroundColor',
    label: 'Left navigation background color',
    type: 'color',
  },
  {
    key: 'sidebarTextColor',
    label: 'Left navigation text color',
    type: 'color',
  },
  {
    key: 'sidebarActiveBackgroundColor',
    label: 'Left navigation active background color',
    type: 'color',
  },
  {
    key: 'sidebarActiveTextColor',
    label: 'Left navigation active text color',
    type: 'color',
  },
  {
    key: 'sidebarHoverBackgroundColor',
    label: 'Left navigation hover background color',
    type: 'color',
  },
  {
    key: 'sidebarHoverTextColor',
    label: 'Left navigation hover text color',
    type: 'color',
  },
  {
    key: 'footerBackgroundColor',
    label: 'Footer background color',
    type: 'color',
  },
  { key: 'footerTextColor', label: 'Footer text color', type: 'color' },
  {
    key: 'badgeBackgroundColor',
    label: 'Badge background color',
    type: 'color',
  },
  { key: 'badgeTextColor', label: 'Badge text color', type: 'color' },
]

const typographyThemeFields: ThemeField[] = [
  { key: 'headerFont', label: 'Header font', type: 'font' },
  { key: 'subheaderFont', label: 'Subheader font', type: 'font' },
  { key: 'bodyFont', label: 'Body font', type: 'font' },
  { key: 'buttonFont', label: 'Button font', type: 'font' },
  { key: 'headerTextSize', label: 'Header text size' },
  { key: 'subheaderTextSize', label: 'Subheader text size' },
  { key: 'bodyTextSize', label: 'Body text size' },
  { key: 'buttonTextSize', label: 'Button text size' },
  { key: 'lineHeight', label: 'Line height' },
  { key: 'letterSpacing', label: 'Letter spacing' },
]

const buttonThemeFields: ThemeField[] = [
  { key: 'defaultButtonText', label: 'Default button text where applicable' },
  { key: 'buttonSize', label: 'Button size' },
  { key: 'buttonBorderRadius', label: 'Button border radius' },
  { key: 'buttonBorderWidth', label: 'Button border width' },
]

const layoutThemeFields: ThemeField[] = [
  { key: 'cardBorderRadius', label: 'Card border radius' },
  { key: 'inputBorderRadius', label: 'Input border radius' },
  { key: 'cardPadding', label: 'Card padding' },
  { key: 'sectionSpacing', label: 'Section spacing' },
  { key: 'pageMaxWidth', label: 'Page max width' },
  {
    key: 'cardOpacity',
    label: 'Text box/card transparency/opacity',
    type: 'range',
  },
  {
    key: 'defaultOverlayOpacity',
    label: 'Default card/background overlay opacity',
    type: 'range',
  },
]

function ThemeManagerPanel() {
  const appearance = useQuery((api as any).admin.getSiteAppearance, {})
  const saveAppearance = useMutation((api as any).admin.saveSiteAppearance)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const getStorageUrl = useMutation(api.uploads.getStorageUrl)
  const [status, setStatus] = useState('')
  const [cardShadowEnabled, setCardShadowEnabled] = useState(true)
  const [logo, setLogo] = useState<File | null>(null)
  const [favicon, setFavicon] = useState<File | null>(null)
  const [homepageBackground, setHomepageBackground] = useState<File | null>(
    null,
  )
  const [defaultPageBackground, setDefaultPageBackground] =
    useState<File | null>(null)
  const [form, setForm] = useState<ThemeForm>(defaultThemeForm)
  const [activeEditorGroup, setActiveEditorGroup] = useState<
    'colors' | 'typography' | 'buttons' | 'layout' | 'assets'
  >('colors')

  useEffect(() => {
    if (!appearance) return
    setForm({
      ...defaultThemeForm,
      ...Object.fromEntries(
        Object.keys(defaultThemeForm).map((key) => [
          key,
          appearance[key] ?? defaultThemeForm[key as keyof ThemeForm],
        ]),
      ),
    } as ThemeForm)
    setCardShadowEnabled(appearance.cardShadowEnabled ?? true)
  }, [appearance])

  const updateField = (key: keyof ThemeForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving theme...')
    try {
      const [
        logoUrl,
        faviconUrl,
        homepageBackgroundUrl,
        defaultPageBackgroundUrl,
      ] = await Promise.all([
        logo
          ? uploadFile(logo, generateUploadUrl, getStorageUrl)
          : form.logoUrl,
        favicon
          ? uploadFile(favicon, generateUploadUrl, getStorageUrl)
          : form.faviconUrl,
        homepageBackground
          ? uploadFile(homepageBackground, generateUploadUrl, getStorageUrl)
          : form.homepageBackgroundUrl,
        defaultPageBackground
          ? uploadFile(defaultPageBackground, generateUploadUrl, getStorageUrl)
          : form.defaultPageBackgroundUrl,
      ])

      await saveAppearance({
        ...form,
        logoUrl: emptyToUndefined(logoUrl),
        faviconUrl: emptyToUndefined(faviconUrl),
        homepageBackgroundUrl: emptyToUndefined(homepageBackgroundUrl),
        defaultPageBackgroundUrl: emptyToUndefined(defaultPageBackgroundUrl),
        cardShadowEnabled,
      })
      setStatus('Theme saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save theme.',
      )
    }
  }

  return (
    <div className="admin-split theme-manager-layout editor-workbench">
      <Card className="admin-panel editor-panel">
        <div className="editor-panel-top">
          <AdminPanelHeader
            title="Theme / Style Manager"
            description="Control global colors, typography, buttons, cards, layout, and brand assets without editing code."
          />
          <span className="editor-save-state">{status || 'Ready to edit'}</span>
        </div>
        <div className="editor-subnav" role="tablist" aria-label="Theme groups">
          {themeEditorGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={activeEditorGroup === group.id ? 'is-active' : ''}
              onClick={() => setActiveEditorGroup(group.id)}
            >
              <strong>{group.label}</strong>
              <span>{group.description}</span>
            </button>
          ))}
        </div>
        <form className="admin-form editor-form" onSubmit={submit}>
          {activeEditorGroup === 'colors' ? (
            <ThemeFieldset
              title="Colors"
              fields={colorThemeFields}
              form={form}
              onChange={updateField}
            />
          ) : null}
          {activeEditorGroup === 'typography' ? (
            <ThemeFieldset
              title="Typography"
              fields={typographyThemeFields}
              form={form}
              onChange={updateField}
            />
          ) : null}
          {activeEditorGroup === 'buttons' ? (
            <ThemeFieldset
              title="Buttons"
              fields={buttonThemeFields}
              form={form}
              onChange={updateField}
            />
          ) : null}
          {activeEditorGroup === 'layout' ? (
            <>
              <ThemeFieldset
                title="Layout / Shapes"
                fields={layoutThemeFields}
                form={form}
                onChange={updateField}
              />
              <label className="settings-toggle">
                <span>
                  <strong>Card shadow</strong>
                  <em>Turn card elevation on or off.</em>
                </span>
                <input
                  type="checkbox"
                  checked={cardShadowEnabled}
                  onChange={(event) =>
                    setCardShadowEnabled(event.target.checked)
                  }
                />
              </label>
            </>
          ) : null}
          {activeEditorGroup === 'assets' ? (
            <div className="theme-asset-grid">
              <label>
                Logo upload/change
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
                />
                <ImageUploadPreview file={logo} existingUrl={form.logoUrl} />
              </label>
              <label>
                Favicon upload/change
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setFavicon(event.target.files?.[0] ?? null)
                  }
                />
                <ImageUploadPreview
                  file={favicon}
                  existingUrl={form.faviconUrl}
                />
              </label>
              <label>
                Homepage background image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setHomepageBackground(event.target.files?.[0] ?? null)
                  }
                />
                <ImageUploadPreview
                  file={homepageBackground}
                  existingUrl={form.homepageBackgroundUrl}
                />
              </label>
              <label>
                Default page background image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setDefaultPageBackground(event.target.files?.[0] ?? null)
                  }
                />
                <ImageUploadPreview
                  file={defaultPageBackground}
                  existingUrl={form.defaultPageBackgroundUrl}
                />
              </label>
            </div>
          ) : null}
          <AdminSaveBar status={status} label="Save theme" />
        </form>
      </Card>
      <ThemePreview form={form} cardShadowEnabled={cardShadowEnabled} />
    </div>
  )
}

const themeEditorGroups: Array<{
  id: 'colors' | 'typography' | 'buttons' | 'layout' | 'assets'
  label: string
  description: string
}> = [
  { id: 'colors', label: 'Colors', description: 'Site, nav, cards, badges' },
  { id: 'typography', label: 'Type', description: 'Fonts and text sizes' },
  { id: 'buttons', label: 'Buttons', description: 'Shape, text, hover' },
  { id: 'layout', label: 'Layout', description: 'Spacing, radius, shadows' },
  { id: 'assets', label: 'Images', description: 'Logo and backgrounds' },
]

function ThemeFieldset({
  title,
  fields,
  form,
  onChange,
}: {
  title: string
  fields: ThemeField[]
  form: ThemeForm
  onChange: (key: keyof ThemeForm, value: string) => void
}) {
  return (
    <fieldset className="theme-fieldset">
      <legend>{title}</legend>
      <div className="form-grid">
        {fields.map((field) => (
          <AdminInput
            key={field.key}
            label={field.label}
            type={field.type ?? 'text'}
            value={form[field.key]}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </fieldset>
  )
}

function ThemePreview({
  form,
  cardShadowEnabled,
}: {
  form: ThemeForm
  cardShadowEnabled: boolean
}) {
  const previewStyle = {
    '--preview-bg': form.mainBackgroundColor,
    '--preview-card-bg': form.cardBackgroundColor,
    '--preview-card-text': form.cardTextColor,
    '--preview-card-border': form.cardBorderColor,
    '--preview-heading': form.headerTextColor,
    '--preview-muted': form.mutedTextColor,
    '--preview-button-bg': form.buttonBackgroundColor,
    '--preview-button-text': form.buttonTextColor,
    '--preview-button-border': form.buttonBorderColor,
    '--preview-badge-bg': form.badgeBackgroundColor,
    '--preview-badge-text': form.badgeTextColor,
    '--preview-radius': form.cardBorderRadius,
    '--preview-padding': form.cardPadding,
    '--preview-body-font': form.bodyFont,
    '--preview-header-font': form.headerFont,
    '--preview-sidebar-bg': form.sidebarBackgroundColor,
    '--preview-sidebar-text': form.sidebarTextColor,
    '--preview-sidebar-active-bg': form.sidebarActiveBackgroundColor,
    '--preview-sidebar-active-text': form.sidebarActiveTextColor,
    '--preview-sidebar-hover-bg': form.sidebarHoverBackgroundColor,
    '--preview-sidebar-hover-text': form.sidebarHoverTextColor,
  } as CSSProperties

  return (
    <Card className="theme-preview-card" style={previewStyle}>
      <AdminPanelHeader
        title="Live style preview"
        description="Use this sample to check text, buttons, cards, links, and badges before saving."
      />
      <div className="theme-preview-surface">
        <span className="theme-preview-badge">Original Hound</span>
        <h2>Curate Your Next Adventure</h2>
        <p>
          Sample body text for destination guides, profile cards, business
          listings, and public pages.
        </p>
        <a href="#theme-preview">Sample link</a>
        <button type="button">
          {form.defaultButtonText || 'Sample button'}
        </button>
        <div
          className={
            cardShadowEnabled
              ? 'theme-preview-mini-card has-shadow'
              : 'theme-preview-mini-card'
          }
        >
          <strong>Sample card</strong>
          <span>Readable text inside a themed content panel.</span>
        </div>
        <div className="theme-preview-sidebar" aria-label="Sidebar preview">
          <strong>Left nav preview</strong>
          <span className="is-active">Home</span>
          <span>Trips</span>
          <span className="is-hovered">Settings hover</span>
        </div>
      </div>
    </Card>
  )
}

function ImageUploadPreview({
  file,
  existingUrl,
}: {
  file: File | null
  existingUrl?: string
}) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file])

  const source = previewUrl || existingUrl
  if (!source) return <span className="form-note">No image selected yet.</span>

  return (
    <span className="admin-image-preview">
      <img src={source} alt="" />
    </span>
  )
}

type PublicSectionEditor = {
  id: string
  page: string
  sectionKey: string
  eyebrow: string
  title: string
  description: string
  enabled: boolean
  order?: number
}

type CustomEmbedEditor = {
  id: string
  page: string
  blockType: string
  title: string
  description: string
  code: string
  enabled: boolean
  order: number
}

type PageStyleEditor = {
  page: string
  mainBackgroundColor: string
  cardBackgroundColor: string
  cardTextColor: string
  cardHeaderTextColor: string
  cardBorderColor: string
  headerTextColor: string
  subheaderTextColor: string
  navBackgroundColor: string
  navTextColor: string
}

const editablePages = [
  { key: 'home', label: 'Home' },
  { key: 'destinations', label: 'Destinations' },
  { key: 'materials', label: 'Materials' },
  { key: 'trip-planner', label: 'Trip Planner' },
  { key: 'businesses', label: 'Business Directory' },
  { key: 'guides', label: 'Guides' },
  { key: 'community', label: 'Community' },
  { key: 'about', label: 'About' },
  { key: 'membership', label: 'Membership' },
  { key: 'basecamp', label: 'Basecamp/Profile' },
  { key: 'collections', label: 'Collections' },
  { key: 'settings', label: 'Settings' },
]

const defaultPublicSections: PublicSectionEditor[] = [
  {
    id: 'home-hero',
    page: 'home',
    sectionKey: 'hero',
    eyebrow: 'Curate Your Next Adventure',
    title: "Let's Rock",
    description: 'Learn How To Rockhound',
    enabled: true,
    order: 1,
  },
  {
    id: 'home-original-hounds',
    page: 'home',
    sectionKey: 'originalHounds',
    eyebrow: 'Original Hounds',
    title: 'The first people helping iluvrocks get off the ground',
    description:
      'Original Hounds are the first supporters who helped iluvrocks get off the ground.',
    enabled: true,
    order: 2,
  },
  {
    id: 'home-public-browsing',
    page: 'home',
    sectionKey: 'visitorIntro',
    eyebrow: 'Plan before you sign up',
    title: 'Public browsing comes first',
    description:
      'Visitors can browse destinations, materials, guides, itineraries, and business listings without creating an account.',
    enabled: true,
    order: 3,
  },
]

function PageTextStylePanel() {
  const appearance = useQuery((api as any).admin.getSiteAppearance, {})
  const saveAppearance = useMutation((api as any).admin.saveSiteAppearance)
  const [status, setStatus] = useState('')
  const [selectedPage, setSelectedPage] = useState('home')
  const [sections, setSections] = useState<PublicSectionEditor[]>(
    defaultPublicSections,
  )
  const [pageStyles, setPageStyles] = useState<PageStyleEditor[]>([])
  const [embeds, setEmbeds] = useState<CustomEmbedEditor[]>([])
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const [draggedEmbedId, setDraggedEmbedId] = useState<string | null>(null)
  const [activePageEditorGroup, setActivePageEditorGroup] = useState<
    'sections' | 'colors' | 'embeds'
  >('sections')

  useEffect(() => {
    if (!appearance) return
    setSections(
      parseJsonList<PublicSectionEditor>(
        appearance.publicSectionsJson,
        defaultPublicSections,
      ),
    )
    setPageStyles(parseJsonList<PageStyleEditor>(appearance.pageStylesJson, []))
    setEmbeds(parseJsonList<CustomEmbedEditor>(appearance.customEmbedsJson, []))
  }, [appearance])

  const pageSections = sections
    .filter((section) => section.page === selectedPage)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const pageEmbeds = embeds
    .filter((embed) => embed.page === selectedPage)
    .sort((a, b) => a.order - b.order)
  const selectedStyle =
    pageStyles.find((style) => style.page === selectedPage) ??
    createDefaultPageStyle(selectedPage)

  const updateSection = (id: string, patch: Partial<PublicSectionEditor>) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    )
  }

  const addSection = () => {
    const id = `${selectedPage}-${Date.now()}`
    setSections((current) => [
      ...current,
      {
        id,
        page: selectedPage,
        sectionKey: `section-${current.length + 1}`,
        eyebrow: '',
        title: 'New section',
        description: '',
        enabled: true,
        order: pageSections.length + 1,
      },
    ])
  }

  const removeSection = (id: string) => {
    setSections((current) => current.filter((section) => section.id !== id))
  }

  const reorderSections = (targetId: string) => {
    if (!draggedSectionId || draggedSectionId === targetId) return
    setSections((current) =>
      reorderItems(current, selectedPage, draggedSectionId, targetId),
    )
    setDraggedSectionId(null)
  }

  const addEmbed = () => {
    const id = `${selectedPage}-embed-${Date.now()}`
    setEmbeds((current) => [
      ...current,
      {
        id,
        page: selectedPage,
        blockType: 'Custom HTML',
        title: 'New custom block',
        description: '',
        code: '<div>Paste embed code here</div>',
        enabled: true,
        order: pageEmbeds.length + 1,
      },
    ])
  }

  const updateEmbed = (id: string, patch: Partial<CustomEmbedEditor>) => {
    setEmbeds((current) =>
      current.map((embed) =>
        embed.id === id ? { ...embed, ...patch } : embed,
      ),
    )
  }

  const removeEmbed = (id: string) => {
    setEmbeds((current) => current.filter((embed) => embed.id !== id))
  }

  const reorderEmbeds = (targetId: string) => {
    if (!draggedEmbedId || draggedEmbedId === targetId) return
    setEmbeds((current) =>
      reorderItems(current, selectedPage, draggedEmbedId, targetId),
    )
    setDraggedEmbedId(null)
  }

  const updatePageStyle = (patch: Partial<PageStyleEditor>) => {
    const nextStyle = { ...selectedStyle, ...patch }
    setPageStyles((current) => {
      const withoutPage = current.filter((style) => style.page !== selectedPage)
      return [...withoutPage, nextStyle]
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving page text and colors...')
    try {
      await saveAppearance({
        publicSectionsJson: JSON.stringify(sections),
        pageStylesJson: JSON.stringify(pageStyles),
        customEmbedsJson: JSON.stringify(embeds),
      })
      setStatus('Page text and colors saved.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Could not save page settings.',
      )
    }
  }

  return (
    <div className="admin-split page-style-manager editor-workbench">
      <Card className="admin-panel editor-panel">
        <div className="editor-panel-top">
          <AdminPanelHeader
            title="Page editor"
            description="Pick a public page, then tune its content, custom blocks, and page-specific colors."
          />
          <span className="editor-save-state">
            {status || 'Changes save when you click the button below.'}
          </span>
        </div>

        <div className="page-editor-toolbar">
          <label>
            Page
            <select
              value={selectedPage}
              onChange={(event) => setSelectedPage(event.target.value)}
            >
              {editablePages.map((page) => (
                <option key={page.key} value={page.key}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>
          <div className="page-editor-counts" aria-label="Current page summary">
            <span>{pageSections.length} sections</span>
            <span>{pageEmbeds.length} embeds</span>
          </div>
        </div>

        <div className="editor-subnav" aria-label="Page editor tools">
          {pageEditorGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={activePageEditorGroup === group.id ? 'is-active' : ''}
              onClick={() => setActivePageEditorGroup(group.id)}
            >
              <strong>{group.label}</strong>
              <span>{group.description}</span>
            </button>
          ))}
        </div>

        <form className="admin-form editor-form" onSubmit={submit}>
          {activePageEditorGroup === 'colors' && (
            <fieldset className="theme-fieldset">
              <legend>Page colors</legend>
              <div className="form-grid">
                {pageStyleFields.map((field) => (
                  <AdminInput
                    key={field.key}
                    label={field.label}
                    type="color"
                    value={selectedStyle[field.key]}
                    onChange={(value) =>
                      updatePageStyle({ [field.key]: value })
                    }
                  />
                ))}
              </div>
            </fieldset>
          )}

          {activePageEditorGroup === 'sections' && (
            <fieldset className="theme-fieldset">
              <legend>Public text sections</legend>
              {pageSections.length ? (
                <div className="page-section-editor-list">
                  {pageSections.map((section) => (
                    <article
                      key={section.id}
                      className="page-section-editor"
                      draggable
                      onDragStart={() => setDraggedSectionId(section.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => reorderSections(section.id)}
                    >
                      <label className="settings-toggle">
                        <span>
                          <strong>{section.title || 'Untitled section'}</strong>
                          <em>{section.sectionKey}</em>
                        </span>
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={(event) =>
                            updateSection(section.id, {
                              enabled: event.target.checked,
                            })
                          }
                        />
                      </label>
                      <div className="form-grid">
                        <AdminInput
                          label="Section key"
                          value={section.sectionKey}
                          onChange={(value) =>
                            updateSection(section.id, { sectionKey: value })
                          }
                        />
                        <AdminInput
                          label="Eyebrow"
                          value={section.eyebrow}
                          onChange={(value) =>
                            updateSection(section.id, { eyebrow: value })
                          }
                        />
                      </div>
                      <AdminInput
                        label="Header/title"
                        value={section.title}
                        onChange={(value) =>
                          updateSection(section.id, { title: value })
                        }
                      />
                      <AdminTextarea
                        label="Text/description"
                        value={section.description}
                        onChange={(value) =>
                          updateSection(section.id, { description: value })
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeSection(section.id)}
                      >
                        Remove section
                      </Button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="form-note">No sections for this page yet.</p>
              )}
              <Button type="button" variant="secondary" onClick={addSection}>
                Add section
              </Button>
            </fieldset>
          )}

          {activePageEditorGroup === 'embeds' && (
            <fieldset className="theme-fieldset">
              <legend>Custom Embed / Custom Code blocks</legend>
              {pageEmbeds.length ? (
                <div className="page-section-editor-list">
                  {pageEmbeds.map((embed) => (
                    <article
                      key={embed.id}
                      className="page-section-editor custom-embed-editor"
                      draggable
                      onDragStart={() => setDraggedEmbedId(embed.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => reorderEmbeds(embed.id)}
                    >
                      <label className="settings-toggle">
                        <span>
                          <strong>{embed.title || 'Untitled embed'}</strong>
                          <em>{embed.blockType}</em>
                        </span>
                        <input
                          type="checkbox"
                          checked={embed.enabled}
                          onChange={(event) =>
                            updateEmbed(embed.id, {
                              enabled: event.target.checked,
                            })
                          }
                        />
                      </label>
                      <div className="form-grid">
                        <label>
                          Block type
                          <select
                            value={embed.blockType}
                            onChange={(event) =>
                              updateEmbed(embed.id, {
                                blockType: event.target.value,
                              })
                            }
                          >
                            {customEmbedTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <AdminInput
                          label="Block title"
                          value={embed.title}
                          onChange={(value) =>
                            updateEmbed(embed.id, { title: value })
                          }
                        />
                      </div>
                      <AdminTextarea
                        label="Block description"
                        value={embed.description}
                        onChange={(value) =>
                          updateEmbed(embed.id, { description: value })
                        }
                      />
                      <AdminTextarea
                        label="Code/embed field"
                        value={embed.code}
                        onChange={(value) =>
                          updateEmbed(embed.id, { code: value })
                        }
                      />
                      <div className="custom-embed-preview">
                        <strong>Preview</strong>
                        <div dangerouslySetInnerHTML={{ __html: embed.code }} />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeEmbed(embed.id)}
                      >
                        Remove block
                      </Button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="form-note">
                  No custom embed blocks for this page yet.
                </p>
              )}
              <Button type="button" variant="secondary" onClick={addEmbed}>
                Add custom embed block
              </Button>
            </fieldset>
          )}

          <AdminSaveBar status={status} label="Save page settings" />
        </form>
      </Card>
      <Card className="admin-list-card">
        <h2>How this works</h2>
        <p className="form-note">
          Page colors apply site-wide by route. Public text sections are stored
          in the site settings now and can be wired into more pages as each page
          becomes editable.
        </p>
        <div className="admin-list">
          {pageSections.map((section) => (
            <article key={section.id}>
              <strong>{section.title}</strong>
              <span>
                {section.enabled ? 'Visible' : 'Hidden'} / {section.sectionKey}
              </span>
            </article>
          ))}
          {pageEmbeds.map((embed) => (
            <article key={embed.id}>
              <strong>{embed.title}</strong>
              <span>
                {embed.enabled ? 'Visible' : 'Hidden'} / {embed.blockType}
              </span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}

const customEmbedTypes = [
  'Custom HTML',
  'Embedded widget',
  'Embedded map',
  'Embedded form',
  'Embedded video',
  'Custom button',
  'External script',
  'Third-party embed',
]

const pageEditorGroups: Array<{
  id: 'sections' | 'colors' | 'embeds'
  label: string
  description: string
}> = [
  {
    id: 'sections',
    label: 'Sections',
    description: 'Public text and order',
  },
  {
    id: 'colors',
    label: 'Colors',
    description: 'Page-specific styling',
  },
  {
    id: 'embeds',
    label: 'Embeds',
    description: 'Widgets and custom code',
  },
]

const pageStyleFields: Array<{
  key: Exclude<keyof PageStyleEditor, 'page'>
  label: string
}> = [
  { key: 'mainBackgroundColor', label: 'Page background color' },
  { key: 'headerTextColor', label: 'Page header font color' },
  { key: 'subheaderTextColor', label: 'Page subheader font color' },
  { key: 'cardBackgroundColor', label: 'Text box/card background color' },
  { key: 'cardHeaderTextColor', label: 'Text box/card header color' },
  { key: 'cardTextColor', label: 'Text box/card body text color' },
  { key: 'cardBorderColor', label: 'Text box/card border color' },
  { key: 'navBackgroundColor', label: 'Top nav background color' },
  { key: 'navTextColor', label: 'Top nav text color' },
]

function createDefaultPageStyle(page: string): PageStyleEditor {
  return {
    page,
    mainBackgroundColor: '#f7f7f4',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#0b0b0a',
    cardHeaderTextColor: '#050505',
    cardBorderColor: '#deded9',
    headerTextColor: '#050505',
    subheaderTextColor: '#686864',
    navBackgroundColor: '#ffffff',
    navTextColor: '#050505',
  }
}

function reorderItems<T extends { id: string; page: string; order?: number }>(
  items: T[],
  page: string,
  draggedId: string,
  targetId: string,
) {
  const pageItems = items.filter((item) => item.page === page)
  const otherItems = items.filter((item) => item.page !== page)
  const draggedIndex = pageItems.findIndex((item) => item.id === draggedId)
  const targetIndex = pageItems.findIndex((item) => item.id === targetId)
  if (draggedIndex < 0 || targetIndex < 0) return items

  const [dragged] = pageItems.splice(draggedIndex, 1)
  pageItems.splice(targetIndex, 0, dragged)
  const orderedPageItems = pageItems.map((item, index) => ({
    ...item,
    order: index + 1,
  }))

  return [...otherItems, ...orderedPageItems]
}

function DestinationsPanel() {
  const data = useQuery((api as any).tripPlanning.ownerListAll, {})
  const saveDestination = useMutation((api as any).tripPlanning.saveDestination)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    region: 'Washington',
    county: '',
    status: 'draft',
    summary: '',
    description: '',
    tripPlanning: '',
    safetyInfo: '',
    permitInfo: '',
    localTips: '',
    mapEmbedUrl: '',
    latitude: '',
    longitude: '',
    relatedGuideSlugs: '',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving destination...')
    try {
      await saveDestination({
        ...form,
        county: emptyToUndefined(form.county),
        slug: emptyToUndefined(form.slug),
        description: emptyToUndefined(form.description),
        tripPlanning: emptyToUndefined(form.tripPlanning),
        safetyInfo: emptyToUndefined(form.safetyInfo),
        permitInfo: emptyToUndefined(form.permitInfo),
        localTips: emptyToUndefined(form.localTips),
        mapEmbedUrl: emptyToUndefined(form.mapEmbedUrl),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        relatedGuideSlugs: splitList(form.relatedGuideSlugs),
      })
      setStatus('Destination saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save destination.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Destination manager"
          description="Create Washington destination pages with materials, trip planning, safety, permits, local tips, photos, maps, and related guides."
        />
        <form className="admin-form" onSubmit={submit}>
          <div className="form-grid">
            <AdminInput
              label="Name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
            />
            <AdminInput
              label="Region"
              value={form.region}
              onChange={(value) => setForm({ ...form, region: value })}
            />
            <AdminInput
              label="County"
              value={form.county}
              onChange={(value) => setForm({ ...form, county: value })}
            />
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <AdminInput
              label="Map embed URL"
              value={form.mapEmbedUrl}
              onChange={(value) => setForm({ ...form, mapEmbedUrl: value })}
            />
          </div>
          <AdminInput
            label="Summary"
            value={form.summary}
            onChange={(value) => setForm({ ...form, summary: value })}
          />
          <AdminTextarea
            label="Description"
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
          />
          <AdminTextarea
            label="Trip planning"
            value={form.tripPlanning}
            onChange={(value) => setForm({ ...form, tripPlanning: value })}
          />
          <AdminTextarea
            label="Safety information"
            value={form.safetyInfo}
            onChange={(value) => setForm({ ...form, safetyInfo: value })}
          />
          <AdminTextarea
            label="Permit information"
            value={form.permitInfo}
            onChange={(value) => setForm({ ...form, permitInfo: value })}
          />
          <AdminTextarea
            label="Local tips"
            value={form.localTips}
            onChange={(value) => setForm({ ...form, localTips: value })}
          />
          <AdminInput
            label="Related guide slugs"
            value={form.relatedGuideSlugs}
            onChange={(value) => setForm({ ...form, relatedGuideSlugs: value })}
          />
          <AdminSaveBar status={status} label="Save destination" />
        </form>
      </Card>
      <AdminList
        title="Destinations"
        items={(data?.destinations ?? []).map((destination: any) => ({
          title: destination.name,
          meta: `${destination.region} | ${destination.status}`,
        }))}
      />
    </div>
  )
}

function MaterialsPanel() {
  const data = useQuery((api as any).tripPlanning.ownerListAll, {})
  const saveMaterial = useMutation((api as any).tripPlanning.saveMaterial)
  const linkMaterial = useMutation(
    (api as any).tripPlanning.linkDestinationMaterial,
  )
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    status: 'draft',
    summary: '',
    description: '',
    identificationTips: '',
    safetyNotes: '',
    destinationId: '',
    materialId: '',
    likelihood: 'Common',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving material...')
    try {
      await saveMaterial({
        name: form.name,
        slug: emptyToUndefined(form.slug),
        status: form.status,
        summary: form.summary,
        description: emptyToUndefined(form.description),
        identificationTips: emptyToUndefined(form.identificationTips),
        safetyNotes: emptyToUndefined(form.safetyNotes),
      })
      setStatus('Material saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save material.',
      )
    }
  }

  const link = async () => {
    if (!form.destinationId || !form.materialId) return
    setStatus('Linking material to destination...')
    try {
      await linkMaterial({
        destinationId: form.destinationId,
        materialId: form.materialId,
        likelihood: form.likelihood,
      })
      setStatus('Material linked.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not link material.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Material manager"
          description="Create materials and connect them to destinations so search results work both ways."
        />
        <form className="admin-form" onSubmit={submit}>
          <div className="form-grid">
            <AdminInput
              label="Name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
            />
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <AdminInput
            label="Summary"
            value={form.summary}
            onChange={(value) => setForm({ ...form, summary: value })}
          />
          <AdminTextarea
            label="Description"
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
          />
          <AdminTextarea
            label="Identification tips"
            value={form.identificationTips}
            onChange={(value) =>
              setForm({ ...form, identificationTips: value })
            }
          />
          <AdminTextarea
            label="Safety notes"
            value={form.safetyNotes}
            onChange={(value) => setForm({ ...form, safetyNotes: value })}
          />
          <AdminSaveBar status={status} label="Save material" />
        </form>
        <div className="admin-form">
          <h3>Link material to destination</h3>
          <div className="form-grid">
            <label>
              Destination
              <select
                value={form.destinationId}
                onChange={(event) =>
                  setForm({ ...form, destinationId: event.target.value })
                }
              >
                <option value="">Choose destination</option>
                {(data?.destinations ?? []).map((destination: any) => (
                  <option key={destination._id} value={destination._id}>
                    {destination.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Material
              <select
                value={form.materialId}
                onChange={(event) =>
                  setForm({ ...form, materialId: event.target.value })
                }
              >
                <option value="">Choose material</option>
                {(data?.materials ?? []).map((material: any) => (
                  <option key={material._id} value={material._id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </label>
            <AdminInput
              label="Likelihood"
              value={form.likelihood}
              onChange={(value) => setForm({ ...form, likelihood: value })}
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => void link()}>
            Link material
          </Button>
        </div>
      </Card>
      <AdminList
        title="Materials"
        items={(data?.materials ?? []).map((material: any) => ({
          title: material.name,
          meta: material.status,
        }))}
      />
    </div>
  )
}

function ItinerariesPanel() {
  const data = useQuery((api as any).tripPlanning.ownerListAll, {})
  const saveItinerary = useMutation((api as any).tripPlanning.saveItinerary)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    destinationId: '',
    title: '',
    slug: '',
    status: 'draft',
    duration: '',
    difficulty: '',
    overview: '',
    stopsJson: '',
    packingList: '',
    safetyNotes: '',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving itinerary...')
    try {
      await saveItinerary({
        ...form,
        slug: emptyToUndefined(form.slug),
        duration: emptyToUndefined(form.duration),
        difficulty: emptyToUndefined(form.difficulty),
        stopsJson: emptyToUndefined(form.stopsJson),
        packingList: emptyToUndefined(form.packingList),
        safetyNotes: emptyToUndefined(form.safetyNotes),
      })
      setStatus('Itinerary saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save itinerary.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Itinerary manager"
          description="Create curated trip plans connected to destinations."
        />
        <form className="admin-form" onSubmit={submit}>
          <label>
            Destination
            <select
              value={form.destinationId}
              onChange={(event) =>
                setForm({ ...form, destinationId: event.target.value })
              }
              required
            >
              <option value="">Choose destination</option>
              {(data?.destinations ?? []).map((destination: any) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <AdminInput
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
            />
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
            />
            <AdminInput
              label="Duration"
              value={form.duration}
              onChange={(value) => setForm({ ...form, duration: value })}
            />
            <AdminInput
              label="Difficulty"
              value={form.difficulty}
              onChange={(value) => setForm({ ...form, difficulty: value })}
            />
          </div>
          <AdminTextarea
            label="Overview"
            value={form.overview}
            onChange={(value) => setForm({ ...form, overview: value })}
          />
          <AdminTextarea
            label="Stops JSON / notes"
            value={form.stopsJson}
            onChange={(value) => setForm({ ...form, stopsJson: value })}
          />
          <AdminTextarea
            label="Packing list"
            value={form.packingList}
            onChange={(value) => setForm({ ...form, packingList: value })}
          />
          <AdminTextarea
            label="Safety notes"
            value={form.safetyNotes}
            onChange={(value) => setForm({ ...form, safetyNotes: value })}
          />
          <AdminSaveBar status={status} label="Save itinerary" />
        </form>
      </Card>
      <AdminList
        title="Itineraries"
        items={(data?.itineraries ?? []).map((item: any) => ({
          title: item.title,
          meta: item.status,
        }))}
      />
    </div>
  )
}

function PlacesPanel() {
  const data = useQuery((api as any).tripPlanning.ownerListAll, {})
  const savePlace = useMutation((api as any).tripPlanning.savePlace)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    destinationId: '',
    name: '',
    placeType: 'rock_shop',
    description: '',
    website: '',
    phone: '',
    address: '',
    isFeatured: false,
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving place...')
    try {
      await savePlace({
        ...form,
        description: emptyToUndefined(form.description),
        website: emptyToUndefined(form.website),
        phone: emptyToUndefined(form.phone),
        address: emptyToUndefined(form.address),
      })
      setStatus('Place saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save place.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Places and businesses"
          description="Link campgrounds, hotels, grocery stores, gas stations, rock shops, lapidaries, museums, clubs, and permit offices to destinations."
        />
        <form className="admin-form" onSubmit={submit}>
          <label>
            Destination
            <select
              value={form.destinationId}
              onChange={(event) =>
                setForm({ ...form, destinationId: event.target.value })
              }
              required
            >
              <option value="">Choose destination</option>
              {(data?.destinations ?? []).map((destination: any) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <AdminInput
              label="Name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
            <label>
              Type
              <select
                value={form.placeType}
                onChange={(event) =>
                  setForm({ ...form, placeType: event.target.value })
                }
              >
                <option value="campground">Campground</option>
                <option value="lodging">Hotel / lodging</option>
                <option value="grocery">Grocery store</option>
                <option value="gas">Gas station</option>
                <option value="rock_shop">Rock shop</option>
                <option value="lapidary">Lapidary</option>
                <option value="museum">Museum</option>
                <option value="club">Club</option>
                <option value="permit_office">
                  Permit office / ranger station
                </option>
              </select>
            </label>
            <AdminInput
              label="Website"
              value={form.website}
              onChange={(value) => setForm({ ...form, website: value })}
            />
            <AdminInput
              label="Phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
          </div>
          <AdminInput
            label="Address"
            value={form.address}
            onChange={(value) => setForm({ ...form, address: value })}
          />
          <AdminTextarea
            label="Description"
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
          />
          <label className="settings-toggle">
            <span>Featured place</span>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm({ ...form, isFeatured: event.target.checked })
              }
            />
          </label>
          <AdminSaveBar status={status} label="Save place" />
        </form>
      </Card>
      <AdminList
        title="Places"
        items={(data?.places ?? []).map((place: any) => ({
          title: place.name,
          meta: place.placeType,
        }))}
      />
    </div>
  )
}

function PagesPanel() {
  const pages = useQuery((api as any).admin.listPages, {}) ?? []
  const savePage = useMutation((api as any).admin.savePage)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    slug: 'about',
    title: 'About',
    pageType: 'custom',
    status: 'draft',
    excerpt: '',
    seoTitle: '',
    seoDescription: '',
    body: '',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving page...')
    try {
      await savePage(form)
      setStatus('Page saved.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save page.')
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Page Builder"
          description="Create About, Beginner Guides, Safety, Ethics, Laws by State, club pages, business info, and custom pages with draft/publish status and SEO fields."
        />
        <form className="admin-form" onSubmit={submit}>
          <div className="form-grid">
            <AdminInput
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
            />
            <AdminInput
              label="Title"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
            />
            <label>
              Page type
              <select
                value={form.pageType}
                onChange={(event) =>
                  setForm({ ...form, pageType: event.target.value })
                }
              >
                <option value="about">About</option>
                <option value="beginner-guide">Beginner Guide</option>
                <option value="safety">Safety</option>
                <option value="ethics">Ethics</option>
                <option value="laws">Laws by State</option>
                <option value="resource">Educational Resource</option>
                <option value="club-info">Club Information</option>
                <option value="business-info">Business Information</option>
                <option value="custom">Custom Page</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <AdminInput
            label="SEO title"
            value={form.seoTitle}
            onChange={(value) => setForm({ ...form, seoTitle: value })}
          />
          <AdminInput
            label="SEO description"
            value={form.seoDescription}
            onChange={(value) => setForm({ ...form, seoDescription: value })}
          />
          <label>
            Page body
            <textarea
              rows={10}
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
            />
          </label>
          <AdminSaveBar status={status} label="Save page" />
        </form>
      </Card>
      <AdminList
        title="Pages"
        items={pages.map((page: any) => ({
          title: page.title,
          meta: `${page.pageType} | ${page.status}`,
        }))}
      />
    </div>
  )
}

function ResourcesPanel() {
  const resources = useQuery((api as any).admin.listResources, {}) ?? []
  const saveResource = useMutation((api as any).admin.saveResource)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const getStorageUrl = useMutation(api.uploads.getStorageUrl)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    title: '',
    resourceType: 'guide',
    category: 'Beginner Guides',
    status: 'draft',
    description: '',
    fileUrl: '',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving resource...')
    try {
      const fileUrl = file
        ? await uploadFile(file, generateUploadUrl, getStorageUrl)
        : form.fileUrl
      await saveResource({ ...form, fileUrl })
      setStatus('Resource saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not save resource.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Resource library"
          description="Upload and manage guides, PDFs, educational resources, legal documents, agreements, waivers, logos, and background assets."
        />
        <form className="admin-form" onSubmit={submit}>
          <AdminInput
            label="Title"
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
          />
          <div className="form-grid">
            <label>
              Type
              <select
                value={form.resourceType}
                onChange={(event) =>
                  setForm({ ...form, resourceType: event.target.value })
                }
              >
                <option value="guide">Guide</option>
                <option value="pdf">PDF</option>
                <option value="legal">Legal document</option>
                <option value="waiver">Waiver</option>
                <option value="logo">Logo</option>
                <option value="background">Background asset</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
          <AdminInput
            label="Category"
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
          />
          <label>
            File upload
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <AdminSaveBar status={status} label="Save resource" />
        </form>
      </Card>
      <AdminList
        title="Resources"
        items={resources.map((resource: any) => ({
          title: resource.title,
          meta: `${resource.category ?? 'Uncategorized'} | ${resource.status}`,
        }))}
      />
    </div>
  )
}

function FeaturedPanel() {
  const featured = useQuery((api as any).admin.listFeaturedContent, {}) ?? []
  const saveFeatured = useMutation((api as any).admin.saveFeaturedContent)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    title: '',
    placement: 'homepage',
    contentType: 'guide',
    targetId: '',
    imageUrl: '',
    summary: '',
    priority: 1,
    isActive: true,
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving featured content...')
    try {
      await saveFeatured({
        ...form,
        targetId: emptyToUndefined(form.targetId),
        imageUrl: emptyToUndefined(form.imageUrl),
        summary: emptyToUndefined(form.summary),
      })
      setStatus('Featured content saved.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Could not save featured item.',
      )
    }
  }

  return (
    <div className="admin-split">
      <Card className="admin-panel">
        <AdminPanelHeader
          title="Featured content"
          description="Promote businesses, guides, events, clubs, locations, and homepage sections."
        />
        <form className="admin-form" onSubmit={submit}>
          <AdminInput
            label="Title"
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
          />
          <div className="form-grid">
            <AdminInput
              label="Placement"
              value={form.placement}
              onChange={(value) => setForm({ ...form, placement: value })}
            />
            <AdminInput
              label="Content type"
              value={form.contentType}
              onChange={(value) => setForm({ ...form, contentType: value })}
            />
            <AdminInput
              label="Target ID or slug"
              value={form.targetId}
              onChange={(value) => setForm({ ...form, targetId: value })}
            />
            <AdminInput
              label="Priority"
              type="number"
              value={String(form.priority)}
              onChange={(value) =>
                setForm({ ...form, priority: Number(value) || 1 })
              }
            />
          </div>
          <label>
            Summary
            <textarea
              value={form.summary}
              onChange={(event) =>
                setForm({ ...form, summary: event.target.value })
              }
            />
          </label>
          <label className="settings-toggle">
            <span>Active</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
            />
          </label>
          <AdminSaveBar status={status} label="Save featured item" />
        </form>
      </Card>
      <AdminList
        title="Featured queue"
        items={featured.map((item: any) => ({
          title: item.title,
          meta: `${item.placement} | ${item.contentType} | ${item.isActive ? 'active' : 'hidden'}`,
        }))}
      />
    </div>
  )
}

function BusinessesPanel() {
  const businesses =
    useQuery((api as any).admin.listBusinessesForOwner, {}) ?? []
  const updateBusiness = useMutation((api as any).admin.updateBusinessAsOwner)
  const [status, setStatus] = useState('')

  const update = async (
    id: Id<'businesses'>,
    patch: Record<string, unknown>,
  ) => {
    setStatus('Updating business...')
    try {
      await updateBusiness({ id, ...patch })
      setStatus('Business updated.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Could not update business.',
      )
    }
  }

  return (
    <Card className="admin-panel">
      <AdminPanelHeader
        title="Business approval and subscriptions"
        description="Approve listings, feature premium profiles, and manage plan/status fields."
      />
      <div className="admin-business-list">
        {businesses.map((business: any) => (
          <article key={business._id} className="admin-business-row">
            <div>
              <h3>{business.name}</h3>
              <p>
                {business.category} | {business.plan} |{' '}
                {business.subscriptionStatus}
              </p>
              <div className="admin-badge-row">
                {business.isApproved ? <span>Approved</span> : null}
                {business.isFeatured ? <span>Featured</span> : null}
              </div>
            </div>
            <div className="admin-row-actions">
              <Button
                variant="secondary"
                onClick={() =>
                  void update(business._id, {
                    isApproved: !business.isApproved,
                  })
                }
              >
                {business.isApproved ? 'Unapprove' : 'Approve'}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  void update(business._id, {
                    isFeatured: !business.isFeatured,
                  })
                }
              >
                {business.isFeatured ? 'Unfeature' : 'Feature'}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <p className="form-note">{status}</p>
    </Card>
  )
}

function StripePanel({ overview }: { overview: any }) {
  return (
    <Card className="admin-panel">
      <AdminPanelHeader
        title="Stripe test mode"
        description="Business subscriptions are wired for Stripe Checkout test mode. Add a Convex env var named STRIPE_SECRET_KEY with a sk_test_ key before creating live test checkout sessions."
      />
      <div className="business-plan-grid">
        <BusinessPlan
          title="Free Business Profile"
          price="$0"
          features="Directory listing, public profile, owner-managed contact info."
        />
        <BusinessPlan
          title="Basic Business Account"
          price="$9.99/month"
          features="Business profile plus subscription status and future enhanced listing tools."
        />
        <BusinessPlan
          title="Premium Business Account"
          price="$24.99/month"
          features="Featured placement, priority placement, lead forms, and analytics."
        />
      </div>
      <p className="form-note">
        Current Stripe mode:{' '}
        <strong>{overview?.stripeMode ?? 'checking...'}</strong>
      </p>
    </Card>
  )
}

function BusinessPlan({
  title,
  price,
  features,
}: {
  title: string
  price: string
  features: string
}) {
  return (
    <article className="business-plan-card">
      <h3>{title}</h3>
      <strong>{price}</strong>
      <p>{features}</p>
    </article>
  )
}

function AdminPanelHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="admin-panel-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  )
}

function AdminInput({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  if (type === 'font') {
    return (
      <label>
        {label}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (type === 'color') {
    return (
      <label>
        {label}
        <span className="admin-color-control">
          <input
            type="color"
            value={normalizeHexColor(value)}
            onChange={(event) => onChange(event.target.value)}
          />
          <input
            type="text"
            value={value}
            placeholder="#050505"
            onChange={(event) => onChange(event.target.value)}
            onBlur={(event) => onChange(normalizeHexColor(event.target.value))}
          />
        </span>
      </label>
    )
  }

  if (type === 'range') {
    return (
      <label>
        {label}
        <span className="admin-range-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </span>
      </label>
    )
  }

  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

const fontOptions = [
  {
    label: 'System Sans',
    value: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  {
    label: 'Clean Serif',
    value: 'Georgia, Cambria, "Times New Roman", serif',
  },
  {
    label: 'Rounded Sans',
    value: '"Trebuchet MS", Verdana, ui-sans-serif, sans-serif',
  },
  {
    label: 'Condensed Field Guide',
    value: '"Arial Narrow", Arial, ui-sans-serif, sans-serif',
  },
  {
    label: 'Monospace Journal',
    value: '"Courier New", ui-monospace, SFMono-Regular, monospace',
  },
]

function normalizeHexColor(value: string) {
  const clean = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(clean)) return clean
  if (/^[0-9a-f]{6}$/i.test(clean)) return `#${clean}`
  return '#050505'
}

function AdminTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function AdminSaveBar({ status, label }: { status: string; label: string }) {
  return (
    <div className="settings-save-bar">
      <span>{status}</span>
      <button type="submit">{label}</button>
    </div>
  )
}

function AdminList({
  title,
  items,
}: {
  title: string
  items: Array<{ title: string; meta: string }>
}) {
  return (
    <Card className="admin-list-card">
      <h2>{title}</h2>
      {items.length ? (
        <div className="admin-list">
          {items.map((item) => (
            <article key={`${item.title}-${item.meta}`}>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </article>
          ))}
        </div>
      ) : (
        <p className="form-note">Nothing here yet.</p>
      )}
    </Card>
  )
}

async function uploadFile(
  file: File,
  generateUploadUrl: () => Promise<string>,
  getStorageUrl: (args: { storageId: Id<'_storage'> }) => Promise<string>,
) {
  const uploadUrl = await generateUploadUrl()
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!response.ok) throw new Error('File upload failed.')
  const { storageId } = (await response.json()) as { storageId: Id<'_storage'> }
  return await getStorageUrl({ storageId })
}

function emptyToUndefined(value: string) {
  const clean = value.trim()
  return clean || undefined
}

function splitList(value: string) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

function parseJsonList<T>(value: string | undefined, fallback: T[]): T[] {
  if (!value?.trim()) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}
