import { query, mutation, action } from './_generated/server'
import type { QueryCtx, MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { api, internal } from './_generated/api'

export const listFeed = query({
  args: {
    region: v.optional(v.string()),
    followingOnly: v.optional(v.boolean()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    // In a real app, we'd fetch posts from follows/friends first.
    // For now, we'll fetch recent posts and optionally filter by region.
    let postsQuery = ctx.db.query('posts').order('desc')

    if (args.region) {
      postsQuery = ctx.db
        .query('posts')
        .withIndex('by_region', (q) => q.eq('region', args.region))
        .order('desc')
    }

    const postsToScan = await postsQuery.take(
      args.followingOnly && userId ? args.limit * 5 : args.limit,
    )
    const follows = userId
      ? await ctx.db
          .query('follows')
          .withIndex('by_follower', (q) => q.eq('followerId', userId))
          .collect()
      : []
    const blocked = userId
      ? await blockedUserIdsFor(ctx, userId)
      : new Set<string>()
    const followedIds = new Set(follows.map((follow) => follow.followingId))
    if (userId) followedIds.add(userId)

    const posts = postsToScan
      .filter((post) => !blocked.has(post.userId))
      .filter(
        (post) =>
          !args.followingOnly || !userId || followedIds.has(post.userId),
      )
      .slice(0, args.limit)

    return await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.userId)
        const location = post.locationId
          ? await ctx.db.get(post.locationId)
          : null

        let isLiked = false
        if (userId) {
          const like = await ctx.db
            .query('likes')
            .withIndex('by_user_post', (q) =>
              q.eq('userId', userId).eq('postId', post._id),
            )
            .unique()
          isLiked = !!like
        }

        return {
          ...post,
          author: {
            name: author?.name,
            username: author?.username,
            image: author?.image,
          },
          locationName: location?.name,
          isLiked,
        }
      }),
    )
  },
})

export const createPost = mutation({
  args: {
    type: v.string(), // "find", "trip_report", "discussion", "educational"
    title: v.optional(v.string()),
    content: v.string(),
    locationId: v.optional(v.id('locations')),
    region: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    storageIds: v.optional(v.array(v.id('_storage'))),
    mineralName: v.optional(v.string()),
    mineralId: v.optional(v.id('minerals')),
    weight: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const photoUrls = args.storageIds
      ? (
          await Promise.all(args.storageIds.map((id) => ctx.storage.getUrl(id)))
        ).filter((url): url is string => url !== null)
      : args.photos

    const postId = await ctx.db.insert('posts', {
      ...args,
      photos: photoUrls,
      userId,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    })

    return postId
  },
})

export const toggleLike = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const existing = await ctx.db
      .query('likes')
      .withIndex('by_user_post', (q) =>
        q.eq('userId', userId).eq('postId', args.postId),
      )
      .unique()

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')

    if (existing) {
      await ctx.db.delete(existing._id)
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, (post.likeCount || 0) - 1),
      })
    } else {
      await ctx.db.insert('likes', { userId, postId: args.postId })
      await ctx.db.patch(args.postId, {
        likeCount: (post.likeCount || 0) + 1,
      })

      // Notify author
      if (post.userId !== userId) {
        await ctx.db.insert('notifications', {
          userId: post.userId,
          fromUserId: userId,
          type: 'like',
          postId: post._id,
          text: 'liked your post',
          isRead: false,
        })
      }
    }
  },
})

export const addComment = mutation({
  args: {
    postId: v.id('posts'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')

    await ctx.db.insert('comments', {
      userId,
      postId: args.postId,
      text: args.text,
    })

    await ctx.db.patch(args.postId, {
      commentCount: (post.commentCount || 0) + 1,
    })

    // Notify author
    if (post.userId !== userId) {
      await ctx.db.insert('notifications', {
        userId: post.userId,
        fromUserId: userId,
        type: 'comment',
        postId: post._id,
        text: 'commented on your post',
        isRead: false,
      })
    }
  },
})

export const followUser = mutation({
  args: { followingId: v.id('users') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    if (userId === args.followingId) throw new Error('Cannot follow yourself')

    const existing = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) =>
        q.eq('followerId', userId).eq('followingId', args.followingId),
      )
      .unique()
    const blocked = await hasBlockBetween(ctx, userId, args.followingId)
    if (blocked) throw new Error('You cannot follow this member right now.')

    if (existing) {
      await ctx.db.delete(existing._id)
      return { following: false }
    } else {
      await ctx.db.insert('follows', {
        followerId: userId,
        followingId: args.followingId,
      })

      await ctx.db.insert('notifications', {
        userId: args.followingId,
        fromUserId: userId,
        type: 'follow',
        text: 'started following you',
        isRead: false,
      })
      return { following: true }
    }
  },
})

export const blockUser = mutation({
  args: { blockedId: v.id('users') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    if (userId === args.blockedId) throw new Error('Cannot block yourself')

    const existing = await ctx.db
      .query('blocks')
      .withIndex('by_blocker', (q) =>
        q.eq('blockerId', userId).eq('blockedId', args.blockedId),
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { blocked: false }
    }

    await ctx.db.insert('blocks', {
      blockerId: userId,
      blockedId: args.blockedId,
      createdAt: Date.now(),
    })

    await deleteFollowIfPresent(ctx, userId, args.blockedId)
    await deleteFollowIfPresent(ctx, args.blockedId, userId)

    return { blocked: true }
  },
})

export const getTrending = query({
  args: {},
  handler: async (ctx) => {
    const minerals = await ctx.db.query('minerals').take(5)
    const locations = await ctx.db.query('locations').take(5)
    const groups = await ctx.db.query('groups').take(5)

    return { minerals, locations, groups }
  },
})

async function deleteFollowIfPresent(
  ctx: MutationCtx,
  followerId: Id<'users'>,
  followingId: Id<'users'>,
) {
  const follow = await ctx.db
    .query('follows')
    .withIndex('by_follower', (q) =>
      q.eq('followerId', followerId).eq('followingId', followingId),
    )
    .unique()

  if (follow) await ctx.db.delete(follow._id)
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

async function blockedUserIdsFor(ctx: QueryCtx, userId: Id<'users'>) {
  const blockedByMe = await ctx.db
    .query('blocks')
    .withIndex('by_blocker', (q) => q.eq('blockerId', userId))
    .collect()
  const blockedMe = await ctx.db
    .query('blocks')
    .withIndex('by_blocked', (q) => q.eq('blockedId', userId))
    .collect()

  return new Set<string>([
    ...blockedByMe.map((block) => block.blockedId),
    ...blockedMe.map((block) => block.blockerId),
  ])
}
