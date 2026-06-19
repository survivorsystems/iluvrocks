import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

const FREE_COLLECTION_LIMIT = 50

const reactionTypes = [
  'nice_find',
  'bucket_list',
  'great_photo',
  'rare_material',
  'collection_goal',
] as const

const reactionLabels: Record<string, string> = {
  nice_find: 'Nice Find',
  bucket_list: 'Bucket List',
  great_photo: 'Great Photo',
  rare_material: 'Rare Material',
  collection_goal: 'Collection Goal',
}

const collectionVisibilityValues = ['public', 'private'] as const

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return {
        items: [],
        catalogs: [],
        visibility: 'public',
        count: 0,
        limit: FREE_COLLECTION_LIMIT,
        remaining: FREE_COLLECTION_LIMIT,
        isAtLimit: false,
      }
    }

    const items = await ctx.db
      .query('collectionItems')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
    const catalogs = await ctx.db
      .query('collectionCatalogs')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
    const user = await ctx.db.get(userId)

    return {
      items,
      catalogs,
      visibility: user?.collectionVisibility ?? 'public',
      count: items.length,
      limit: FREE_COLLECTION_LIMIT,
      remaining: Math.max(0, FREE_COLLECTION_LIMIT - items.length),
      isAtLimit: items.length >= FREE_COLLECTION_LIMIT,
    }
  },
})

export const listPublicByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const viewerId = await getAuthUserId(ctx)
    const owner = await ctx.db
      .query('users')
      .withIndex('username', (q) => q.eq('username', args.username))
      .unique()

    if (!owner) return null

    const isOwner = viewerId === owner._id
    const isBlocked = viewerId
      ? await hasBlockBetween(ctx, viewerId, owner._id)
      : false
    const visibility = owner.collectionVisibility ?? 'public'

    if (!isOwner && (visibility === 'private' || isBlocked)) {
      return {
        owner: {
          _id: owner._id,
          name: owner.name,
          username: owner.username,
          image: owner.image,
        },
        visibility,
        isPrivate: visibility === 'private',
        isBlocked,
        items: [],
        catalogs: [],
        count: 0,
      }
    }

    const items = await ctx.db
      .query('collectionItems')
      .withIndex('by_user', (q) => q.eq('userId', owner._id))
      .order('desc')
      .collect()
    const catalogs = await ctx.db
      .query('collectionCatalogs')
      .withIndex('by_user', (q) => q.eq('userId', owner._id))
      .order('desc')
      .collect()

    return {
      owner: {
        _id: owner._id,
        name: owner.name,
        username: owner.username,
        image: owner.image,
      },
      visibility,
      isPrivate: false,
      isBlocked: false,
      items,
      catalogs,
      count: items.length,
    }
  },
})

export const getDetail = query({
  args: { id: v.id('collectionItems') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    const item = await ctx.db.get(args.id)
    if (!item) return null

    const collector = await ctx.db.get(item.userId)
    const isOwner = userId === item.userId
    const isPrivate =
      (collector?.collectionVisibility ?? 'public') === 'private'
    const isBlocked = userId
      ? await hasBlockBetween(ctx, userId, item.userId)
      : false
    if (!isOwner && (isPrivate || isBlocked)) return null

    const reactions = await ctx.db
      .query('specimenReactions')
      .withIndex('by_item', (q) => q.eq('collectionItemId', args.id))
      .collect()

    return {
      item,
      collector: collector
        ? {
            _id: collector._id,
            name: collector.name,
            username: collector.username,
            image: collector.image,
          }
        : null,
      reactionCounts: getReactionCounts(reactions),
      viewerReactions: userId
        ? reactions
            .filter((reaction) => reaction.userId === userId)
            .map((reaction) => reaction.reactionType)
        : [],
    }
  },
})

export const setVisibility = mutation({
  args: { visibility: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    if (
      !collectionVisibilityValues.includes(
        args.visibility as (typeof collectionVisibilityValues)[number],
      )
    ) {
      throw new Error('Collection visibility must be public or private.')
    }

    await ctx.db.patch(userId, { collectionVisibility: args.visibility })
    return { visibility: args.visibility }
  },
})

export const createCatalog = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const name = args.name.trim()
    if (!name) throw new Error('Catalog name is required.')

    const existingCatalogs = await ctx.db
      .query('collectionCatalogs')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    if (
      existingCatalogs.some(
        (catalog) => catalog.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new Error('You already have a catalog with that name.')
    }

    const now = Date.now()
    return await ctx.db.insert('collectionCatalogs', {
      userId,
      name,
      description: args.description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const createItem = mutation({
  args: {
    specimenName: v.string(),
    materialType: v.optional(v.string()),
    foundLocation: v.optional(v.string()),
    dateFound: v.optional(v.number()),
    notes: v.optional(v.string()),
    storageId: v.id('_storage'),
    status: v.optional(v.string()),
    acquisitionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const existingItems = await ctx.db
      .query('collectionItems')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    if (existingItems.length >= FREE_COLLECTION_LIMIT) {
      throw new Error('COLLECTION_LIMIT_REACHED')
    }

    const photoUrl = await ctx.storage.getUrl(args.storageId)
    if (!photoUrl) throw new Error('Photo upload could not be found.')

    const now = Date.now()
    const itemId = await ctx.db.insert('collectionItems', {
      userId,
      currentOwnerId: userId,
      storageId: args.storageId,
      photoUrl,
      specimenName: args.specimenName,
      materialType: args.materialType,
      foundLocation: args.foundLocation,
      dateFound: args.dateFound,
      notes: args.notes,
      status: args.status ?? 'in_collection',
      acquisitionType: args.acquisitionType ?? 'found',
      createdAt: now,
      updatedAt: now,
    })

    const user = await ctx.db.get(userId)
    await ctx.db.insert('posts', {
      userId,
      type: 'collection_event',
      title: `${user?.name ?? 'A rockhound'} added ${args.specimenName} to their collection.`,
      content:
        args.notes ??
        `${args.specimenName} is now part of the collection showcase.`,
      photos: [photoUrl],
      storageIds: [args.storageId],
      tags: ['collection', 'find'],
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    })

    return itemId
  },
})

export const toggleReaction = mutation({
  args: {
    collectionItemId: v.id('collectionItems'),
    reactionType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    if (
      !reactionTypes.includes(
        args.reactionType as (typeof reactionTypes)[number],
      )
    ) {
      throw new Error('Unknown reaction type.')
    }

    const item = await ctx.db.get(args.collectionItemId)
    if (!item) throw new Error('Find not found.')
    if (item.userId !== userId) {
      const collector = await ctx.db.get(item.userId)
      if ((collector?.collectionVisibility ?? 'public') === 'private')
        throw new Error('This collection is private.')
      if (await hasBlockBetween(ctx, userId, item.userId))
        throw new Error('This collection is not available.')
    }

    const existing = await ctx.db
      .query('specimenReactions')
      .withIndex('by_user_item_type', (q) =>
        q
          .eq('userId', userId)
          .eq('collectionItemId', args.collectionItemId)
          .eq('reactionType', args.reactionType),
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { active: false }
    }

    await ctx.db.insert('specimenReactions', {
      userId,
      collectionItemId: args.collectionItemId,
      reactionType: args.reactionType,
      createdAt: Date.now(),
    })

    if (item.userId !== userId) {
      const reactor = await ctx.db.get(userId)
      await ctx.db.insert('posts', {
        userId,
        type: 'collection_event',
        title: `${reactor?.name ?? 'A rockhound'} marked ${item.specimenName} as ${reactionLabels[args.reactionType]}.`,
        content: `${item.specimenName} got a ${reactionLabels[args.reactionType]} reaction.`,
        photos: [item.photoUrl],
        storageIds: item.storageId ? [item.storageId] : undefined,
        tags: ['collection', 'reaction'],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      })
    }

    return { active: true }
  },
})

function getReactionCounts(reactions: Array<{ reactionType: string }>) {
  return reactionTypes.reduce<Record<string, number>>(
    (counts, reactionType) => {
      counts[reactionType] = reactions.filter(
        (reaction) => reaction.reactionType === reactionType,
      ).length
      return counts
    },
    {},
  )
}

async function hasBlockBetween(
  ctx: QueryCtx | MutationCtx,
  firstUserId: Id<'users'>,
  secondUserId: Id<'users'>,
) {
  const firstBlockedSecond = await ctx.db
    .query('blocks')
    .withIndex('by_blocker', (q) =>
      q.eq('blockerId', firstUserId).eq('blockedId', secondUserId),
    )
    .unique()
  if (firstBlockedSecond) return true

  const secondBlockedFirst = await ctx.db
    .query('blocks')
    .withIndex('by_blocker', (q) =>
      q.eq('blockerId', secondUserId).eq('blockedId', firstUserId),
    )
    .unique()

  return !!secondBlockedFirst
}
