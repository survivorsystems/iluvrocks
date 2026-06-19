import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    homeRegion: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    yearsRockhounding: v.optional(v.number()),
    favoriteMinerals: v.optional(v.array(v.string())),
    collectingStyles: v.optional(v.array(v.string())),
    isAdmin: v.optional(v.boolean()),
    // Aggregates for quick display
    followerCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    totalFinds: v.optional(v.number()),
    totalLocations: v.optional(v.number()),
    totalPosts: v.optional(v.number()),
    collectionVisibility: v.optional(v.string()),
  })
    .index('email', ['email'])
    .index('username', ['username']),

  locations: defineTable({
    name: v.string(),
    state: v.string(),
    region: v.optional(v.string()), // e.g. "Olympic Peninsula", "Puget Sound", "Cascades"
    county: v.optional(v.string()),
    description: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    difficulty: v.number(),
    familyFriendly: v.boolean(),
    roadAccessibility: v.number(),
    accessType: v.optional(v.string()), // e.g. "Roadside", "Short Walk", "Moderate Hike", "Long Hike"
    terrain: v.optional(v.string()),
    landStatus: v.string(),
    permitRequired: v.boolean(),
    permitInfo: v.optional(v.string()),
    bestSeasons: v.array(v.string()),
    typicalFinds: v.array(v.string()),
    hazardWarnings: v.optional(v.string()),
    stewardshipNotes: v.optional(v.string()),
    geology: v.optional(v.string()),
    coolFacts: v.optional(v.string()),
    photos: v.array(v.string()),
    parkingInfo: v.optional(v.string()),
    directions: v.optional(v.string()),
    // Aggregates
    numVisits: v.optional(v.number()),
    numFinds: v.optional(v.number()),
    numTripLogs: v.optional(v.number()),
    avgDifficulty: v.optional(v.number()),
    avgAccess: v.optional(v.number()),
  })
    .index('by_state', ['state'])
    .index('by_name', ['name']),

  minerals: defineTable({
    name: v.string(),
    description: v.string(),
    photos: v.array(v.string()),
    identificationTips: v.string(),
    hardness: v.string(),
    colorVariations: v.array(v.string()),
    lookAlikes: v.array(v.string()),
    geologicalInfo: v.string(),
    cleaningRecommendations: v.string(),
    displayRecommendations: v.string(),
  }).index('by_name', ['name']),

  locationMinerals: defineTable({
    locationId: v.id('locations'),
    mineralId: v.id('minerals'),
    likelihood: v.string(), // "Common", "Occasional", "Rare"
  }).index('by_location', ['locationId']),

  // Unified Social Feed Post
  posts: defineTable({
    userId: v.id('users'),
    type: v.string(), // "find", "trip_report", "discussion", "educational"
    title: v.optional(v.string()),
    content: v.string(),
    locationId: v.optional(v.id('locations')),
    region: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    storageIds: v.optional(v.array(v.id('_storage'))),
    // Type specific fields
    mineralName: v.optional(v.string()),
    mineralId: v.optional(v.id('minerals')),
    weight: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    dateOccurred: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    accessInfo: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Social Metrics
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    shareCount: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type'])
    .index('by_location', ['locationId'])
    .index('by_region', ['region']),

  collectionItems: defineTable({
    userId: v.id('users'),
    storageId: v.optional(v.id('_storage')),
    photoUrl: v.string(),
    specimenName: v.string(),
    materialType: v.optional(v.string()),
    foundLocation: v.optional(v.string()),
    dateFound: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.string(),
    acquisitionType: v.string(),
    currentOwnerId: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  collectionCatalogs: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  specimenReactions: defineTable({
    collectionItemId: v.id('collectionItems'),
    userId: v.id('users'),
    reactionType: v.string(),
    createdAt: v.number(),
  })
    .index('by_item', ['collectionItemId'])
    .index('by_user_item_type', ['userId', 'collectionItemId', 'reactionType'])
    .index('by_item_type', ['collectionItemId', 'reactionType']),

  likes: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
  })
    .index('by_post', ['postId'])
    .index('by_user_post', ['userId', 'postId']),

  comments: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
    text: v.string(),
    parentId: v.optional(v.id('comments')),
  }).index('by_post', ['postId']),

  follows: defineTable({
    followerId: v.id('users'),
    followingId: v.id('users'),
  })
    .index('by_follower', ['followerId', 'followingId'])
    .index('by_following', ['followingId']),

  blocks: defineTable({
    blockerId: v.id('users'),
    blockedId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_blocker', ['blockerId', 'blockedId'])
    .index('by_blocked', ['blockedId']),

  groups: defineTable({
    name: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    region: v.optional(v.string()),
    mineralId: v.optional(v.id('minerals')),
    memberCount: v.optional(v.number()),
    slug: v.string(),
  }).index('by_slug', ['slug']),

  groupMemberships: defineTable({
    userId: v.id('users'),
    groupId: v.id('groups'),
    role: v.string(), // "member", "admin"
  })
    .index('by_group', ['groupId'])
    .index('by_user', ['userId']),

  notifications: defineTable({
    userId: v.id('users'),
    fromUserId: v.optional(v.id('users')),
    type: v.string(), // "like", "comment", "follow", "message", "group_activity"
    postId: v.optional(v.id('posts')),
    groupId: v.optional(v.id('groups')),
    text: v.string(),
    isRead: v.boolean(),
  }).index('by_user', ['userId']),

  // Legacy/Backwards compatibility or refined tables
  findReports: defineTable({
    locationId: v.id('locations'),
    userId: v.id('users'),
    mineralName: v.string(),
    mineralId: v.optional(v.id('minerals')),
    photos: v.array(v.id('_storage')),
    dateFound: v.number(),
    description: v.string(),
    size: v.optional(v.string()),
    weight: v.optional(v.string()),
    toolsUsed: v.optional(v.array(v.string())),
    isPrivate: v.boolean(),
    approximateCoordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    status: v.string(), // "pending", "approved", "hidden"
  })
    .index('by_location', ['locationId'])
    .index('by_user', ['userId']),

  tripLogs: defineTable({
    locationId: v.id('locations'),
    userId: v.id('users'),
    dateVisited: v.number(),
    timeSpent: v.optional(v.string()),
    roadConditions: v.string(),
    accessConditions: v.string(),
    weatherConditions: v.string(),
    waterLevel: v.optional(v.string()),
    crowdingLevel: v.string(),
    parkingAvailability: v.string(),
    notes: v.string(),
    recommend: v.boolean(),
    photos: v.optional(v.array(v.id('_storage'))),
    status: v.string(), // "pending", "approved", "hidden"
  })
    .index('by_location', ['locationId'])
    .index('by_user', ['userId']),

  chatRooms: defineTable({
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    icon: v.string(),
  }).index('by_slug', ['slug']),

  chatMessages: defineTable({
    roomId: v.id('chatRooms'),
    userId: v.id('users'),
    text: v.string(),
    imageUrl: v.optional(v.string()),
  }).index('by_room', ['roomId']),

  favorites: defineTable({
    userId: v.id('users'),
    locationId: v.id('locations'),
  })
    .index('by_user', ['userId'])
    .index('by_location', ['locationId']),

  safetyCheckins: defineTable({
    userId: v.id('users'),
    locationId: v.id('locations'),
    checkInTime: v.number(),
    expectedReturnTime: v.number(),
    emergencyContact: v.string(),
    status: v.string(), // "active", "returned", "overdue"
    notes: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  identifications: defineTable({
    userId: v.id('users'),
    storageId: v.id('_storage'),
    result: v.string(),
    mineralName: v.optional(v.string()),
    confidence: v.optional(v.number()),
  }).index('by_user', ['userId']),

  classifieds: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    subCategory: v.string(),
    state: v.string(),
    images: v.array(v.string()),
    status: v.string(),
  })
    .index('by_category', ['category'])
    .index('by_state', ['state'])
    .index('by_user', ['userId']),

  jobs: defineTable({
    userId: v.id('users'),
    title: v.string(),
    company: v.string(),
    description: v.string(),
    location: v.string(),
    salaryRange: v.optional(v.string()),
    type: v.string(),
    status: v.string(),
  }).index('by_status', ['status']),

  locationPhotos: defineTable({
    locationId: v.id('locations'),
    userId: v.id('users'),
    storageId: v.id('_storage'),
    url: v.optional(v.string()),
    caption: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  })
    .index('by_location', ['locationId'])
    .index('by_user', ['userId']),

  locationComments: defineTable({
    locationId: v.id('locations'),
    userId: v.id('users'),
    text: v.string(),
    status: v.optional(v.string()),
    parentId: v.optional(v.id('locationComments')),
  })
    .index('by_location', ['locationId'])
    .index('by_user', ['userId']),

  weatherCache: defineTable({
    locationId: v.id('locations'),
    temp: v.optional(v.number()),
    wind: v.optional(v.string()),
    precipitation: v.optional(v.string()),
    summary: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_location', ['locationId']),
})
