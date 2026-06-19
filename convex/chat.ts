import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

const forumSections = [
  {
    title: 'Finds & Discoveries',
    description:
      'Share finds, collection updates, hunt stories, and ID questions.',
    forums: [
      [
        'todays-finds',
        "Today's Finds",
        'Fresh finds from the field and collection table.',
      ],
      [
        'rare-finds',
        'Rare Finds',
        'Unusual, hard-to-find, or special pieces worth a closer look.',
      ],
      [
        'recent-hunts',
        'Recent Hunts',
        'Trip notes and field-day recaps that belong in the community.',
      ],
      [
        'collection-highlights',
        'Collection Highlights',
        'Show favorite finds and collection milestones.',
      ],
      [
        'identification-help',
        'Identification Help',
        'Ask for help identifying rocks, minerals, and materials.',
      ],
    ],
  },
  {
    title: 'Locations & Trips',
    description:
      'Plan trips, share public-access notes, and compare field conditions.',
    forums: [
      [
        'trip-reports',
        'Trip Reports',
        'Longer reports from public trips and field days.',
      ],
      [
        'public-collecting-areas',
        'Public Collecting Areas',
        'General public-access collecting area discussion.',
      ],
      [
        'roadside-stops',
        'Roadside Stops',
        'Easy stops, access notes, and quick-pullout finds.',
      ],
      [
        'club-field-trips',
        'Club Field Trips',
        'Club outings, field trip reports, and group plans.',
      ],
      [
        'travel-planning',
        'Travel Planning',
        'Route ideas, packing, weather, and timing.',
      ],
    ],
  },
  {
    title: 'Lapidary & Crafting',
    description:
      'Talk shop about cutting, polishing, wrapping, jewelry, and equipment.',
    forums: [
      ['cutting', 'Cutting', 'Sawing, trimming, slabs, and cutting plans.'],
      [
        'polishing',
        'Polishing',
        'Tumbling, finishing, grit, and shine troubleshooting.',
      ],
      [
        'cabochons',
        'Cabochons',
        'Cabs, shaping, templates, and finished pieces.',
      ],
      [
        'wire-wrapping',
        'Wire Wrapping',
        'Wraps, settings, tools, and design notes.',
      ],
      ['jewelry', 'Jewelry', 'Finished wearable pieces and jewelry questions.'],
      [
        'equipment',
        'Equipment',
        'Tools, machines, maintenance, and setup advice.',
      ],
    ],
  },
] as const

type ForumMeta = {
  slug: string
  title: string
  description: string
  sectionTitle: string
}

const forumMap: Map<string, ForumMeta> = new Map(
  forumSections.flatMap((section) =>
    section.forums.map(([slug, title, description]) => [
      slug,
      { slug, title, description, sectionTitle: section.title },
    ]),
  ),
)

export const listRooms = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('chatRooms'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      icon: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query('chatRooms').collect()
  },
})

export const getRoom = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id('chatRooms'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      icon: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('chatRooms')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
  },
})

export const listMessages = query({
  args: { roomId: v.id('chatRooms') },
  returns: v.array(
    v.object({
      _id: v.id('chatMessages'),
      _creationTime: v.number(),
      roomId: v.id('chatRooms'),
      userId: v.id('users'),
      text: v.string(),
      imageUrl: v.optional(v.string()),
      user: v.object({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('chatMessages')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .order('desc')
      .take(50)

    const result = []
    for (const msg of messages) {
      const user = await ctx.db.get(msg.userId)
      result.push({
        ...msg,
        user: {
          name: user?.name,
          image: user?.image,
        },
      })
    }
    return result.reverse()
  },
})

export const sendMessage = mutation({
  args: {
    roomId: v.id('chatRooms'),
    text: v.string(),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Unauthorized')
    }
    await ctx.db.insert('chatMessages', {
      roomId: args.roomId,
      userId,
      text: args.text,
      imageUrl: args.imageUrl,
    })
    return null
  },
})

export const listForumSections = query({
  args: {},
  handler: async (ctx) => {
    const counts = await Promise.all(
      [...forumMap.values()].map(async (forum) => {
        const posts = await ctx.db
          .query('forumPosts')
          .withIndex('by_forum', (q) => q.eq('forumSlug', forum.slug))
          .collect()
        return [forum.slug, posts.length] as const
      }),
    )
    const countMap = Object.fromEntries(counts)

    return forumSections.map((section) => ({
      title: section.title,
      description: section.description,
      forums: section.forums.map(([slug, title, description]) => ({
        slug,
        title,
        description,
        postCount: countMap[slug] ?? 0,
      })),
    }))
  },
})

export const getForum = query({
  args: { forumSlug: v.string() },
  handler: async (_ctx, args) => {
    return forumMap.get(args.forumSlug) ?? null
  },
})

export const listForumPosts = query({
  args: { forumSlug: v.string() },
  handler: async (ctx, args) => {
    if (!forumMap.has(args.forumSlug)) return []

    const posts = await ctx.db
      .query('forumPosts')
      .withIndex('by_forum', (q) => q.eq('forumSlug', args.forumSlug))
      .order('desc')
      .take(50)

    return await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.userId)
        return {
          ...post,
          author: {
            name: author?.name,
            username: author?.username,
            image: author?.image,
          },
        }
      }),
    )
  },
})

export const listForumComments = query({
  args: { postId: v.id('forumPosts') },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('forumComments')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .order('asc')
      .take(100)

    return await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.userId)
        return {
          ...comment,
          author: {
            name: author?.name,
            username: author?.username,
            image: author?.image,
          },
        }
      }),
    )
  },
})

export const createForumPost = mutation({
  args: {
    forumSlug: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Sign in before posting in the forums.')
    if (!forumMap.has(args.forumSlug)) throw new Error('Forum not found.')

    const title = args.title.trim()
    const body = args.body.trim()
    if (!title || !body)
      throw new Error('Add a title and post before publishing.')

    const now = Date.now()
    return await ctx.db.insert('forumPosts', {
      forumSlug: args.forumSlug,
      userId,
      title,
      body,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const addForumComment = mutation({
  args: {
    postId: v.id('forumPosts'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Sign in before commenting.')

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Forum post not found.')

    const body = args.body.trim()
    if (!body) throw new Error('Add a comment before posting.')

    await ctx.db.insert('forumComments', {
      postId: args.postId,
      userId,
      body,
      createdAt: Date.now(),
    })
    await ctx.db.patch(args.postId, {
      commentCount: (post.commentCount ?? 0) + 1,
      updatedAt: Date.now(),
    })
  },
})

export const listMembersForMessaging = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const users = await ctx.db.query('users').take(100)
    const blocks = await blockedUserIdsFor(ctx, userId)

    return users
      .filter((user) => user._id !== userId)
      .filter((user) => !blocks.has(user._id))
      .filter((user) => user.name || user.username || user.email)
      .map((user) => ({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        location: user.location,
      }))
  },
})

export const listDirectConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const [asParticipantA, asParticipantB] = await Promise.all([
      ctx.db
        .query('directConversations')
        .withIndex('by_participant_a', (q) => q.eq('participantAId', userId))
        .collect(),
      ctx.db
        .query('directConversations')
        .withIndex('by_participant_b', (q) => q.eq('participantBId', userId))
        .collect(),
    ])

    const conversations = [...asParticipantA, ...asParticipantB].sort(
      (first, second) =>
        (second.lastMessageAt ?? second.updatedAt) -
        (first.lastMessageAt ?? first.updatedAt),
    )

    return await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId =
          conversation.participantAId === userId
            ? conversation.participantBId
            : conversation.participantAId
        const otherUser = await ctx.db.get(otherUserId)
        return {
          ...conversation,
          otherUser: otherUser
            ? {
                _id: otherUser._id,
                name: otherUser.name,
                username: otherUser.username,
                email: otherUser.email,
                image: otherUser.image,
              }
            : null,
        }
      }),
    )
  },
})

export const listDirectMessages = query({
  args: { conversationId: v.id('directConversations') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || !isConversationParticipant(conversation, userId))
      return []

    const messages = await ctx.db
      .query('directMessages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .order('asc')
      .take(100)

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId)
        return {
          ...message,
          isMine: message.senderId === userId,
          sender: sender
            ? {
                name: sender.name,
                username: sender.username,
                image: sender.image,
              }
            : null,
        }
      }),
    )
  },
})

export const startDirectConversation = mutation({
  args: { recipientId: v.id('users') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    if (userId === args.recipientId)
      throw new Error('You cannot message yourself.')
    if (await hasBlockBetween(ctx, userId, args.recipientId)) {
      throw new Error('Messaging is not available for this member.')
    }
    await assertCanMessage(ctx, userId, args.recipientId)

    const [participantAId, participantBId] = sortUserIds(
      userId,
      args.recipientId,
    )
    const existing = await ctx.db
      .query('directConversations')
      .withIndex('by_pair', (q) =>
        q
          .eq('participantAId', participantAId)
          .eq('participantBId', participantBId),
      )
      .unique()

    if (existing) return existing._id

    const now = Date.now()
    return await ctx.db.insert('directConversations', {
      participantAId,
      participantBId,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const sendDirectMessage = mutation({
  args: {
    conversationId: v.id('directConversations'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const text = args.text.trim()
    if (!text) throw new Error('Message cannot be empty.')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || !isConversationParticipant(conversation, userId)) {
      throw new Error('Conversation not found.')
    }

    const recipientId =
      conversation.participantAId === userId
        ? conversation.participantBId
        : conversation.participantAId
    if (await hasBlockBetween(ctx, userId, recipientId)) {
      throw new Error('Messaging is not available for this member.')
    }
    await assertCanMessage(ctx, userId, recipientId)

    const now = Date.now()
    await ctx.db.insert('directMessages', {
      conversationId: args.conversationId,
      senderId: userId,
      recipientId,
      text,
      createdAt: now,
    })
    await ctx.db.patch(args.conversationId, {
      lastMessageText: text,
      lastMessageAt: now,
      updatedAt: now,
    })
  },
})

function sortUserIds(firstUserId: Id<'users'>, secondUserId: Id<'users'>) {
  return [firstUserId, secondUserId].sort() as [Id<'users'>, Id<'users'>]
}

function isConversationParticipant(
  conversation: { participantAId: Id<'users'>; participantBId: Id<'users'> },
  userId: Id<'users'>,
) {
  return (
    conversation.participantAId === userId ||
    conversation.participantBId === userId
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

async function assertCanMessage(
  ctx: QueryCtx | MutationCtx,
  senderId: Id<'users'>,
  recipientId: Id<'users'>,
) {
  const recipient = await ctx.db.get(recipientId)
  if (recipient?.whoCanMessageMe === 'no_one') {
    throw new Error('This member is not accepting messages right now.')
  }
  if (recipient?.whoCanMessageMe === 'following') {
    const followsSender = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) =>
        q.eq('followerId', recipientId).eq('followingId', senderId),
      )
      .unique()
    if (!followsSender) {
      throw new Error(
        'This member only accepts messages from people they follow.',
      )
    }
  }
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
