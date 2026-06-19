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
    website: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    yearsRockhounding: v.optional(v.number()),
    favoriteMinerals: v.optional(v.array(v.string())),
    favoriteFinds: v.optional(v.array(v.string())),
    collectingStyles: v.optional(v.array(v.string())),
    collectorType: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()),
    showLocation: v.optional(v.boolean()),
    showCollections: v.optional(v.boolean()),
    showFindLocations: v.optional(v.boolean()),
    showEmail: v.optional(v.boolean()),
    showOnlineStatus: v.optional(v.boolean()),
    searchEngineVisibility: v.optional(v.boolean()),
    notifyNewFollowers: v.optional(v.boolean()),
    notifyComments: v.optional(v.boolean()),
    notifyMessages: v.optional(v.boolean()),
    notifyCollectionLikes: v.optional(v.boolean()),
    notifyChallengeCompletions: v.optional(v.boolean()),
    notifyEventReminders: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    whoCanMessageMe: v.optional(v.string()),
    whoCanFollowMe: v.optional(v.string()),
    mutedUserIds: v.optional(v.array(v.id('users'))),
    contentFilterLevel: v.optional(v.string()),
    themePreference: v.optional(v.string()),
    accessibilityMode: v.optional(v.string()),
    fontSizePreference: v.optional(v.string()),
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

  destinations: defineTable({
    name: v.string(),
    slug: v.string(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_region', ['region']),

  materials: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    identificationTips: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status']),

  destinationMaterials: defineTable({
    destinationId: v.id('destinations'),
    materialId: v.id('materials'),
    likelihood: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index('by_destination', ['destinationId'])
    .index('by_material', ['materialId']),

  itineraries: defineTable({
    destinationId: v.id('destinations'),
    title: v.string(),
    slug: v.string(),
    status: v.string(),
    duration: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    overview: v.string(),
    stopsJson: v.optional(v.string()),
    packingList: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  })
    .index('by_destination', ['destinationId'])
    .index('by_slug', ['slug'])
    .index('by_status', ['status']),

  destinationPlaces: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  })
    .index('by_destination', ['destinationId'])
    .index('by_type', ['placeType']),

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

  forumPosts: defineTable({
    forumSlug: v.string(),
    userId: v.id('users'),
    title: v.string(),
    body: v.string(),
    commentCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_forum', ['forumSlug'])
    .index('by_user', ['userId']),

  forumComments: defineTable({
    postId: v.id('forumPosts'),
    userId: v.id('users'),
    body: v.string(),
    createdAt: v.number(),
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

  directConversations: defineTable({
    participantAId: v.id('users'),
    participantBId: v.id('users'),
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_participant_a', ['participantAId'])
    .index('by_participant_b', ['participantBId'])
    .index('by_pair', ['participantAId', 'participantBId']),

  directMessages: defineTable({
    conversationId: v.id('directConversations'),
    senderId: v.id('users'),
    recipientId: v.id('users'),
    text: v.string(),
    createdAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_recipient', ['recipientId']),

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

  siteAppearance: defineTable({
    key: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    homepageHeadline: v.optional(v.string()),
    homepageIntro: v.optional(v.string()),
    homepageCtaLabel: v.optional(v.string()),
    navigationJson: v.optional(v.string()),
    backgroundJson: v.optional(v.string()),
    featuredSectionsJson: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  }).index('by_key', ['key']),

  contentPages: defineTable({
    slug: v.string(),
    title: v.string(),
    pageType: v.string(),
    status: v.string(),
    body: v.string(),
    excerpt: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    featuredImageUrl: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    authorId: v.id('users'),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_type', ['pageType']),

  resourceLibraryItems: defineTable({
    title: v.string(),
    resourceType: v.string(),
    status: v.string(),
    description: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    category: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id('users'),
  })
    .index('by_status', ['status'])
    .index('by_category', ['category']),

  businesses: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    plan: v.string(),
    subscriptionStatus: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    isApproved: v.boolean(),
    isFeatured: v.boolean(),
    isFoundingBusiness: v.boolean(),
    priorityPlacement: v.optional(v.number()),
    leadEmail: v.optional(v.string()),
    analyticsJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_slug', ['slug'])
    .index('by_approved', ['isApproved'])
    .index('by_plan', ['plan']),

  featuredContent: defineTable({
    title: v.string(),
    placement: v.string(),
    contentType: v.string(),
    targetId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    summary: v.optional(v.string()),
    priority: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id('users'),
  })
    .index('by_placement', ['placement'])
    .index('by_active', ['isActive']),
})
