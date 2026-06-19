import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BadgeCheck,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Image,
  LayoutDashboard,
  Library,
  Paintbrush,
  Star,
  Upload,
} from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Badge, Button, Card, SectionHeader, StatCard } from '../components/ui'

type AdminTab =
  | 'overview'
  | 'appearance'
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
        eyebrow="Owner Dashboard"
        title="Manage iluvrocks"
        description="Control site content, appearance, resources, businesses, subscriptions, featured sections, and page drafts from one place."
      />

      <div className="admin-tabbar" role="tablist" aria-label="Owner tools">
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
      icon: BadgeCheck,
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
    homepageHeadline: 'A field journal for people who love rocks.',
    homepageIntro:
      'Build your Basecamp, show your finds, learn safely, and connect with collectors.',
    homepageCtaLabel: 'Create your Basecamp',
    navigationJson: 'Home, Discoveries, Community, Businesses, About',
    backgroundJson:
      '{"home":"skagit","basecamp":"skagit","community":"alsea","collections":"haystacks","settings":"cascades"}',
    featuredSectionsJson:
      'Featured members, Latest discoveries, Beginner guides, Business directory',
  })

  const current = useMemo(() => appearance ?? form, [appearance, form])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving appearance...')
    try {
      const logoUrl = logo
        ? await uploadFile(logo, generateUploadUrl, getStorageUrl)
        : form.logoUrl || current.logoUrl
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
            value={current.primaryColor ?? form.primaryColor}
            onChange={(value) => setForm({ ...form, primaryColor: value })}
          />
          <AdminInput
            label="Yellow accent"
            value={current.accentColor ?? form.accentColor}
            onChange={(value) => setForm({ ...form, accentColor: value })}
          />
        </div>
        <AdminInput
          label="Homepage headline"
          value={current.homepageHeadline ?? form.homepageHeadline}
          onChange={(value) => setForm({ ...form, homepageHeadline: value })}
        />
        <label>
          Homepage intro
          <textarea
            value={current.homepageIntro ?? form.homepageIntro}
            onChange={(event) =>
              setForm({ ...form, homepageIntro: event.target.value })
            }
          />
        </label>
        <AdminInput
          label="CTA label"
          value={current.homepageCtaLabel ?? form.homepageCtaLabel}
          onChange={(value) => setForm({ ...form, homepageCtaLabel: value })}
        />
        <AdminInput
          label="Navigation"
          value={current.navigationJson ?? form.navigationJson}
          onChange={(value) => setForm({ ...form, navigationJson: value })}
        />
        <AdminInput
          label="Background assignments"
          value={current.backgroundJson ?? form.backgroundJson}
          onChange={(value) => setForm({ ...form, backgroundJson: value })}
        />
        <AdminInput
          label="Featured sections"
          value={current.featuredSectionsJson ?? form.featuredSectionsJson}
          onChange={(value) =>
            setForm({ ...form, featuredSectionsJson: value })
          }
        />
        <AdminSaveBar status={status} label="Save appearance" />
      </form>
    </Card>
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
        description="Approve listings, assign Founding Business badges, feature premium profiles, and manage plan/status fields."
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
                {business.isApproved ? <Badge>Approved</Badge> : null}
                {business.isFeatured ? (
                  <Badge tone="achievement">Featured</Badge>
                ) : null}
                {business.isFoundingBusiness ? (
                  <Badge tone="achievement">Founding Business</Badge>
                ) : null}
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
              <Button
                variant="secondary"
                onClick={() =>
                  void update(business._id, {
                    isFoundingBusiness: !business.isFoundingBusiness,
                  })
                }
              >
                Toggle founding badge
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
          features="Featured placement, priority placement, lead forms, sponsor badge, and analytics."
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
