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
      .replace(/(^-|-$)/g, '') || 'business'
  )
}

async function requireUser(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Sign in to manage a business profile.')
  return userId
}

export const listPublic = query({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const approved = await ctx.db
      .query('businesses')
      .withIndex('by_approved', (q) => q.eq('isApproved', true))
      .collect()
    const search = args.query?.trim().toLowerCase()

    return approved
      .filter((business) =>
        args.category ? business.category === args.category : true,
      )
      .filter((business) => (args.plan ? business.plan === args.plan : true))
      .filter((business) => {
        if (!search) return true
        return [business.name, business.description, business.location]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search))
      })
      .sort((a, b) => {
        const aPriority = a.isFeatured ? 0 : 1
        const bPriority = b.isFeatured ? 0 : 1
        return (
          aPriority - bPriority ||
          (a.priorityPlacement ?? 999) - (b.priorityPlacement ?? 999) ||
          a.name.localeCompare(b.name)
        )
      })
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (!business?.isApproved) return null
    return business
  },
})

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    return await ctx.db
      .query('businesses')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect()
  },
})

export const saveMine = mutation({
  args: {
    id: v.optional(v.id('businesses')),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    plan: v.string(),
    leadEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx)
    const now = Date.now()
    const slug = slugify(args.name)
    const payload = {
      ownerId: userId,
      name: args.name,
      slug,
      description: args.description,
      category: args.category,
      website: args.website,
      email: args.email,
      phone: args.phone,
      location: args.location,
      logoUrl: args.logoUrl,
      coverImageUrl: args.coverImageUrl,
      plan: args.plan,
      leadEmail: args.leadEmail,
      updatedAt: now,
    }

    if (args.id) {
      const existing = await ctx.db.get(args.id)
      if (!existing || existing.ownerId !== userId) {
        throw new Error('You can only edit your own business profile.')
      }
      await ctx.db.patch(args.id, payload)
      return args.id
    }

    return await ctx.db.insert('businesses', {
      ...payload,
      subscriptionStatus: args.plan === 'free' ? 'free' : 'pending',
      isApproved: false,
      isFeatured: false,
      isFoundingBusiness: false,
      createdAt: now,
    })
  },
})
