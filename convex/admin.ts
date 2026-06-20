import { action, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
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

  return { userId, user }
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'page'
  )
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)

    const [
      pages,
      resources,
      businesses,
      featured,
      destinations,
      materials,
      itineraries,
      places,
    ] = await Promise.all([
      ctx.db.query('contentPages').collect(),
      ctx.db.query('resourceLibraryItems').collect(),
      ctx.db.query('businesses').collect(),
      ctx.db.query('featuredContent').collect(),
      ctx.db.query('destinations').collect(),
      ctx.db.query('materials').collect(),
      ctx.db.query('itineraries').collect(),
      ctx.db.query('destinationPlaces').collect(),
    ])

    return {
      pages: pages.length,
      draftPages: pages.filter((page) => page.status === 'draft').length,
      resources: resources.length,
      businesses: businesses.length,
      pendingBusinesses: businesses.filter((business) => !business.isApproved)
        .length,
      premiumBusinesses: businesses.filter(
        (business) => business.plan === 'premium',
      ).length,
      featuredItems: featured.filter((item) => item.isActive).length,
      destinations: destinations.length,
      publishedDestinations: destinations.filter(
        (destination) => destination.status === 'published',
      ).length,
      materials: materials.length,
      itineraries: itineraries.length,
      places: places.length,
      stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
        ? 'test'
        : 'not configured',
    }
  },
})

export const getSiteAppearance = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    return await ctx.db
      .query('siteAppearance')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique()
  },
})

export const saveSiteAppearance = mutation({
  args: {
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    homepageBackgroundUrl: v.optional(v.string()),
    defaultPageBackgroundUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    mainBackgroundColor: v.optional(v.string()),
    secondaryBackgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    mutedTextColor: v.optional(v.string()),
    headerTextColor: v.optional(v.string()),
    subheaderTextColor: v.optional(v.string()),
    linkColor: v.optional(v.string()),
    buttonBackgroundColor: v.optional(v.string()),
    buttonTextColor: v.optional(v.string()),
    buttonBorderColor: v.optional(v.string()),
    buttonHoverColor: v.optional(v.string()),
    buttonHoverTextColor: v.optional(v.string()),
    cardBackgroundColor: v.optional(v.string()),
    cardTextColor: v.optional(v.string()),
    cardBorderColor: v.optional(v.string()),
    cardOpacity: v.optional(v.string()),
    navBackgroundColor: v.optional(v.string()),
    navTextColor: v.optional(v.string()),
    sidebarBackgroundColor: v.optional(v.string()),
    sidebarTextColor: v.optional(v.string()),
    sidebarActiveBackgroundColor: v.optional(v.string()),
    sidebarActiveTextColor: v.optional(v.string()),
    sidebarHoverBackgroundColor: v.optional(v.string()),
    sidebarHoverTextColor: v.optional(v.string()),
    footerBackgroundColor: v.optional(v.string()),
    footerTextColor: v.optional(v.string()),
    badgeBackgroundColor: v.optional(v.string()),
    badgeTextColor: v.optional(v.string()),
    headerFont: v.optional(v.string()),
    subheaderFont: v.optional(v.string()),
    bodyFont: v.optional(v.string()),
    buttonFont: v.optional(v.string()),
    headerTextSize: v.optional(v.string()),
    subheaderTextSize: v.optional(v.string()),
    bodyTextSize: v.optional(v.string()),
    buttonTextSize: v.optional(v.string()),
    lineHeight: v.optional(v.string()),
    letterSpacing: v.optional(v.string()),
    defaultButtonText: v.optional(v.string()),
    buttonSize: v.optional(v.string()),
    buttonBorderRadius: v.optional(v.string()),
    buttonBorderWidth: v.optional(v.string()),
    cardBorderRadius: v.optional(v.string()),
    inputBorderRadius: v.optional(v.string()),
    cardShadowEnabled: v.optional(v.boolean()),
    cardPadding: v.optional(v.string()),
    sectionSpacing: v.optional(v.string()),
    pageMaxWidth: v.optional(v.string()),
    defaultOverlayOpacity: v.optional(v.string()),
    homepageHeadline: v.optional(v.string()),
    homepageIntro: v.optional(v.string()),
    homepageCtaLabel: v.optional(v.string()),
    navigationJson: v.optional(v.string()),
    backgroundJson: v.optional(v.string()),
    featuredSectionsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireOwner(ctx)
    const existing = await ctx.db
      .query('siteAppearance')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique()
    const payload = {
      ...args,
      key: 'default',
      updatedAt: Date.now(),
      updatedBy: userId,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return existing._id
    }

    return await ctx.db.insert('siteAppearance', payload)
  },
})

export const listPages = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    return await ctx.db.query('contentPages').collect()
  },
})

export const savePage = mutation({
  args: {
    id: v.optional(v.id('contentPages')),
    slug: v.string(),
    title: v.string(),
    pageType: v.string(),
    status: v.string(),
    body: v.string(),
    excerpt: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    featuredImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireOwner(ctx)
    const now = Date.now()
    const slug = slugify(args.slug || args.title)
    const payload = {
      slug,
      title: args.title,
      pageType: args.pageType,
      status: args.status,
      body: args.body,
      excerpt: args.excerpt,
      seoTitle: args.seoTitle,
      seoDescription: args.seoDescription,
      featuredImageUrl: args.featuredImageUrl,
      publishedAt: args.status === 'published' ? now : undefined,
      updatedAt: now,
      authorId: userId,
    }

    if (args.id) {
      await ctx.db.patch(args.id, payload)
      return args.id
    }

    return await ctx.db.insert('contentPages', {
      ...payload,
      createdAt: now,
    })
  },
})

export const listResources = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    return await ctx.db.query('resourceLibraryItems').collect()
  },
})

export const saveResource = mutation({
  args: {
    id: v.optional(v.id('resourceLibraryItems')),
    title: v.string(),
    resourceType: v.string(),
    status: v.string(),
    description: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireOwner(ctx)
    const now = Date.now()
    const payload = {
      title: args.title,
      resourceType: args.resourceType,
      status: args.status,
      description: args.description,
      fileUrl: args.fileUrl,
      storageId: args.storageId,
      category: args.category,
      updatedAt: now,
      createdBy: userId,
    }

    if (args.id) {
      await ctx.db.patch(args.id, payload)
      return args.id
    }

    return await ctx.db.insert('resourceLibraryItems', {
      ...payload,
      createdAt: now,
    })
  },
})

export const listFeaturedContent = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    return await ctx.db.query('featuredContent').collect()
  },
})

export const saveFeaturedContent = mutation({
  args: {
    id: v.optional(v.id('featuredContent')),
    title: v.string(),
    placement: v.string(),
    contentType: v.string(),
    targetId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    summary: v.optional(v.string()),
    priority: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireOwner(ctx)
    const now = Date.now()
    const payload = { ...args, updatedAt: now, updatedBy: userId }

    if (args.id) {
      const { id: _id, ...patch } = payload
      await ctx.db.patch(args.id, patch)
      return args.id
    }

    return await ctx.db.insert('featuredContent', {
      ...payload,
      createdAt: now,
    })
  },
})

export const listBusinessesForOwner = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx)
    return await ctx.db.query('businesses').collect()
  },
})

export const updateBusinessAsOwner = mutation({
  args: {
    id: v.id('businesses'),
    plan: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    isApproved: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    isFoundingBusiness: v.optional(v.boolean()),
    priorityPlacement: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const { id, ...patch } = args
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
    return id
  },
})

export const createStripeCheckoutSession = action({
  args: {
    businessId: v.string(),
    plan: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY.')
    if (!key.startsWith('sk_test_')) {
      throw new Error('Stripe must be configured with a test mode key first.')
    }

    const amount = args.plan === 'premium' ? 2499 : 999
    const body = new URLSearchParams({
      mode: 'subscription',
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      'metadata[businessId]': args.businessId,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][price_data][product_data][name]':
        args.plan === 'premium'
          ? 'iluvrocks Premium Business'
          : 'iluvrocks Basic Business',
      'line_items[0][price_data][unit_amount]': String(amount),
    })

    const response = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    )

    if (!response.ok) {
      throw new Error('Stripe checkout session could not be created.')
    }

    return (await response.json()) as { id: string; url: string | null }
  },
})
