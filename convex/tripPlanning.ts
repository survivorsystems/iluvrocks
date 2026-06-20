import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

const OWNER_EMAIL = 'chickensweets87@gmail.com'

async function requireOwner(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Owner access is required.')
  const user = await ctx.db.get(userId)
  if (user?.email?.toLowerCase() !== OWNER_EMAIL) {
    throw new Error('Owner access is required.')
  }
  return userId
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'washington-rockhounding'
  )
}

function includesSearch(value: unknown, search: string) {
  return typeof value === 'string' && value.toLowerCase().includes(search)
}

export const publicSearch = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const search = args.query?.trim().toLowerCase() ?? ''
    const [destinations, materials] = await Promise.all([
      ctx.db
        .query('destinations')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .collect(),
      ctx.db
        .query('materials')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .collect(),
    ])

    const destinationMatches = destinations.filter((destination) => {
      if (!search) return true
      return [
        destination.name,
        destination.region,
        destination.county,
        destination.summary,
        destination.description,
      ].some((value) => includesSearch(value, search))
    })

    const materialMatches = materials.filter((material) => {
      if (!search) return true
      return [material.name, material.summary, material.description].some(
        (value) => includesSearch(value, search),
      )
    })

    const destinationLinks = await Promise.all(
      destinationMatches.map(async (destination) => {
        const links = await ctx.db
          .query('destinationMaterials')
          .withIndex('by_destination', (q) =>
            q.eq('destinationId', destination._id),
          )
          .collect()
        const linkedMaterials = await Promise.all(
          links.map((link) => ctx.db.get(link.materialId)),
        )
        return {
          ...destination,
          materials: linkedMaterials.filter(Boolean),
        }
      }),
    )

    const materialLinks = await Promise.all(
      materialMatches.map(async (material) => {
        const links = await ctx.db
          .query('destinationMaterials')
          .withIndex('by_material', (q) => q.eq('materialId', material._id))
          .collect()
        const linkedDestinations = await Promise.all(
          links.map((link) => ctx.db.get(link.destinationId)),
        )
        return {
          ...material,
          destinations: linkedDestinations.filter(
            (destination) => destination?.status === 'published',
          ),
        }
      }),
    )

    return {
      destinations: destinationLinks,
      materials: materialLinks,
    }
  },
})

export const listDestinations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('destinations')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()
  },
})

export const listMaterials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('materials')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()
  },
})

export const getDestinationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const destination = await ctx.db
      .query('destinations')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (!destination || destination.status !== 'published') return null

    const [materialLinks, itineraries, places] = await Promise.all([
      ctx.db
        .query('destinationMaterials')
        .withIndex('by_destination', (q) =>
          q.eq('destinationId', destination._id),
        )
        .collect(),
      ctx.db
        .query('itineraries')
        .withIndex('by_destination', (q) =>
          q.eq('destinationId', destination._id),
        )
        .collect(),
      ctx.db
        .query('destinationPlaces')
        .withIndex('by_destination', (q) =>
          q.eq('destinationId', destination._id),
        )
        .collect(),
    ])

    const materials = await Promise.all(
      materialLinks.map(async (link) => {
        const material = await ctx.db.get(link.materialId)
        return material ? { ...material, likelihood: link.likelihood } : null
      }),
    )

    return {
      destination,
      materials: materials.filter(Boolean),
      itineraries: itineraries.filter((item) => item.status === 'published'),
      places,
    }
  },
})

export const getItineraryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const itinerary = await ctx.db
      .query('itineraries')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (!itinerary || itinerary.status !== 'published') return null

    const destination = await ctx.db.get(itinerary.destinationId)
    if (!destination || destination.status !== 'published') return null

    return { itinerary, destination }
  },
})

export const ownerListAll = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    const [destinations, materials, itineraries, places] = await Promise.all([
      ctx.db.query('destinations').collect(),
      ctx.db.query('materials').collect(),
      ctx.db.query('itineraries').collect(),
      ctx.db.query('destinationPlaces').collect(),
    ])
    return { destinations, materials, itineraries, places }
  },
})

export const saveDestination = mutation({
  args: {
    id: v.optional(v.id('destinations')),
    name: v.string(),
    slug: v.optional(v.string()),
    region: v.string(),
    county: v.optional(v.string()),
    status: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    tripPlanning: v.optional(v.string()),
    safetyInfo: v.optional(v.string()),
    permitInfo: v.optional(v.string()),
    localTips: v.optional(v.string()),
    mapEmbedUrl: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    relatedGuideSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwner(ctx)
    const now = Date.now()
    const payload = {
      ...args,
      slug: slugify(args.slug || args.name),
      updatedAt: now,
      updatedBy: userId,
    }
    if (args.id) {
      const { id: _id, ...patch } = payload
      await ctx.db.patch(args.id, patch)
      return args.id
    }
    return await ctx.db.insert('destinations', {
      ...payload,
      createdAt: now,
    })
  },
})

export const saveMaterial = mutation({
  args: {
    id: v.optional(v.id('materials')),
    name: v.string(),
    slug: v.optional(v.string()),
    status: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    identificationTips: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwner(ctx)
    const now = Date.now()
    const payload = {
      ...args,
      slug: slugify(args.slug || args.name),
      updatedAt: now,
      updatedBy: userId,
    }
    if (args.id) {
      const { id: _id, ...patch } = payload
      await ctx.db.patch(args.id, patch)
      return args.id
    }
    return await ctx.db.insert('materials', { ...payload, createdAt: now })
  },
})

export const linkDestinationMaterial = mutation({
  args: {
    destinationId: v.id('destinations'),
    materialId: v.id('materials'),
    likelihood: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    return await ctx.db.insert('destinationMaterials', args)
  },
})

export const saveItinerary = mutation({
  args: {
    id: v.optional(v.id('itineraries')),
    destinationId: v.id('destinations'),
    title: v.string(),
    slug: v.optional(v.string()),
    status: v.string(),
    duration: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    overview: v.string(),
    stopsJson: v.optional(v.string()),
    packingList: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    geologySummary: v.optional(v.string()),
    geologicFormations: v.optional(v.string()),
    geologicAge: v.optional(v.string()),
    likelyMaterials: v.optional(v.string()),
    materialOccurrence: v.optional(v.string()),
    fieldClues: v.optional(v.string()),
    commonLookalikes: v.optional(v.string()),
    terrainNotes: v.optional(v.string()),
    erosionDepositionNotes: v.optional(v.string()),
    collectionLegalityNotes: v.optional(v.string()),
    sourceNotes: v.optional(v.string()),
    confidenceLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwner(ctx)
    const now = Date.now()
    const payload = {
      ...args,
      slug: slugify(args.slug || args.title),
      updatedAt: now,
      updatedBy: userId,
    }
    if (args.id) {
      const { id: _id, ...patch } = payload
      await ctx.db.patch(args.id, patch)
      return args.id
    }
    return await ctx.db.insert('itineraries', { ...payload, createdAt: now })
  },
})

export const savePlace = mutation({
  args: {
    id: v.optional(v.id('destinationPlaces')),
    destinationId: v.id('destinations'),
    businessId: v.optional(v.id('businesses')),
    name: v.string(),
    placeType: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireOwner(ctx)
    const now = Date.now()
    const payload = { ...args, updatedAt: now, updatedBy: userId }
    if (args.id) {
      const { id: _id, ...patch } = payload
      await ctx.db.patch(args.id, patch)
      return args.id
    }
    return await ctx.db.insert('destinationPlaces', {
      ...payload,
      createdAt: now,
    })
  },
})
