import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'local-guide'
  )
}

async function requireUser(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Sign in to apply as a local guide.')
  return userId
}

export const listPublic = query({
  args: {
    query: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const guides = await ctx.db
      .query('localGuides')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()
    const search = args.query?.trim().toLowerCase()

    return guides
      .filter((guide) => (args.region ? guide.region === args.region : true))
      .filter((guide) => {
        if (!search) return true
        return [
          guide.displayName,
          guide.region,
          guide.homeBase,
          guide.guideBio,
          guide.experienceSummary,
          guide.offerings,
          guide.ethicsStatement,
          guide.locationPrivacyStatement,
          guide.collectionShowcaseNotes,
          ...guide.specialties,
          ...(guide.favoriteEducationalFinds ?? []),
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search))
      })
      .sort((a, b) => {
        const featured = Number(b.isFeatured) - Number(a.isFeatured)
        const founding = Number(b.isFoundingGuide) - Number(a.isFoundingGuide)
        return featured || founding || a.displayName.localeCompare(b.displayName)
      })
  },
})

export const getByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const guide = await ctx.db
      .query('localGuides')
      .withIndex('by_handle', (q) => q.eq('handle', args.handle))
      .unique()

    if (!guide || guide.status !== 'approved') return null

    const user = await ctx.db.get(guide.userId)
    return {
      ...guide,
      collector: user
        ? {
            username: user.username ?? null,
            name: user.name ?? null,
            image: user.image ?? null,
          }
        : null,
    }
  },
})

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query('localGuides')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()
  },
})

export const saveMine = mutation({
  args: {
    id: v.optional(v.id('localGuides')),
    displayName: v.string(),
    region: v.string(),
    homeBase: v.optional(v.string()),
    specialties: v.array(v.string()),
    guideBio: v.optional(v.string()),
    experienceSummary: v.string(),
    offerings: v.string(),
    ethicsStatement: v.optional(v.string()),
    locationPrivacyStatement: v.optional(v.string()),
    favoriteEducationalFinds: v.optional(v.array(v.string())),
    collectionShowcaseNotes: v.optional(v.string()),
    testimonialQuote: v.optional(v.string()),
    testimonialAttribution: v.optional(v.string()),
    beginnerFriendly: v.boolean(),
    familyFriendly: v.boolean(),
    accessibilityNotes: v.optional(v.string()),
    publicContactEmail: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    bookingUrl: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    ethicsAgreement: v.boolean(),
    locationProtectionAgreement: v.boolean(),
    independentGuideAgreement: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx)

    if (
      !args.ethicsAgreement ||
      !args.locationProtectionAgreement ||
      !args.independentGuideAgreement
    ) {
      throw new Error('Guide applicants must agree to the guide standards.')
    }

    const now = Date.now()
    const baseHandle = slugify(args.displayName)
    const handle = args.id ? undefined : await uniqueHandle(ctx, baseHandle)
    const payload = {
      displayName: args.displayName,
      region: args.region,
      homeBase: args.homeBase,
      specialties: args.specialties,
      guideBio: args.guideBio,
      experienceSummary: args.experienceSummary,
      offerings: args.offerings,
      ethicsStatement: args.ethicsStatement,
      locationPrivacyStatement: args.locationPrivacyStatement,
      favoriteEducationalFinds: args.favoriteEducationalFinds,
      collectionShowcaseNotes: args.collectionShowcaseNotes,
      testimonialQuote: args.testimonialQuote,
      testimonialAttribution: args.testimonialAttribution,
      beginnerFriendly: args.beginnerFriendly,
      familyFriendly: args.familyFriendly,
      accessibilityNotes: args.accessibilityNotes,
      publicContactEmail: args.publicContactEmail,
      websiteUrl: args.websiteUrl,
      bookingUrl: args.bookingUrl,
      photoUrl: args.photoUrl,
      ethicsAgreement: args.ethicsAgreement,
      locationProtectionAgreement: args.locationProtectionAgreement,
      independentGuideAgreement: args.independentGuideAgreement,
      updatedAt: now,
    }

    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.userId !== userId) {
        throw new Error('You can only edit your own guide application.')
      }

      await ctx.db.patch(args.id, payload)
      return args.id
    }

    return await ctx.db.insert('localGuides', {
      ...payload,
      userId,
      handle: handle ?? baseHandle,
      status: 'pending',
      isFeatured: false,
      isFoundingGuide: false,
      createdAt: now,
    })
  },
})

async function uniqueHandle(ctx: MutationCtx, baseHandle: string) {
  let handle = baseHandle
  let suffix = 2

  while (
    await ctx.db
      .query('localGuides')
      .withIndex('by_handle', (q) => q.eq('handle', handle))
      .unique()
  ) {
    handle = `${baseHandle}-${suffix}`
    suffix += 1
  }

  return handle
}
