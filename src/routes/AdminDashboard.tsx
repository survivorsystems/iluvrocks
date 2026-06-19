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
  Map,
  Paintbrush,
  Route,
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
