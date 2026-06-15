import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const favoriteLocations = await Promise.all(
      favorites.map((f) => ctx.db.get(f.locationId))
    );

    const findReports = await ctx.db
      .query("findReports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const findReportsWithLocations = await Promise.all(
      findReports.map(async (r) => {
        const location = await ctx.db.get(r.locationId);
        const photoUrls = await Promise.all(
          r.photos.map((id) => ctx.storage.getUrl(id))
        );
        return { ...r, locationName: location?.name, photoUrls };
      })
    );

    const activeCheckins = await ctx.db
      .query("safetyCheckins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const activeCheckinsWithLocations = await Promise.all(
      activeCheckins.map(async (c) => {
        const location = await ctx.db.get(c.locationId);
        return { ...c, locationName: location?.name };
      })
    );

    const myPosts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return {
      user,
      favorites: favoriteLocations.filter((l) => l !== null),
      findReports: findReportsWithLocations,
      activeCheckins: activeCheckinsWithLocations,
      posts: myPosts,
    };
  },
});

export const getPublicProfile = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) return null;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    const followerCount = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();

    const followingCount = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    return {
      user,
      posts,
      followerCount: followerCount.length,
      followingCount: followingCount.length,
    };
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    name: v.optional(v.string()),
    homeRegion: v.optional(v.string()),
    yearsRockhounding: v.optional(v.number()),
    favoriteMinerals: v.optional(v.array(v.string())),
    collectingStyles: v.optional(v.array(v.string())),
    bannerImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    if (args.username) {
       const existing = await ctx.db.query("users").withIndex("username", q => q.eq("username", args.username)).unique();
       if (existing && existing._id !== userId) {
          throw new Error("Username already taken");
       }
    }
    
    await ctx.db.patch(userId, args);
  },
});
