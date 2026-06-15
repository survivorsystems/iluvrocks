import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { state: v.optional(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("locations"),
      _creationTime: v.number(),
      name: v.string(),
      state: v.string(),
      description: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      difficulty: v.number(),
      familyFriendly: v.boolean(),
      roadAccessibility: v.number(),
      accessType: v.optional(v.string()),
      landStatus: v.string(),
      permitRequired: v.boolean(),
      permitInfo: v.optional(v.string()),
      bestSeasons: v.array(v.string()),
      typicalFinds: v.array(v.string()),
      hazardWarnings: v.optional(v.string()),
      photos: v.array(v.string()),
      parkingInfo: v.optional(v.string()),
      directions: v.optional(v.string()),
      region: v.optional(v.string()),
      county: v.optional(v.string()),
      terrain: v.optional(v.string()),
      stewardshipNotes: v.optional(v.string()),
      numVisits: v.optional(v.number()),
      numFinds: v.optional(v.number()),
      numTripLogs: v.optional(v.number()),
      avgDifficulty: v.optional(v.number()),
      avgAccess: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.state) {
      return await ctx.db
        .query("locations")
        .withIndex("by_state", (dbq) => dbq.eq("state", args.state!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("locations").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("locations") },
  returns: v.union(
    v.object({
      _id: v.id("locations"),
      _creationTime: v.number(),
      name: v.string(),
      state: v.string(),
      region: v.optional(v.string()),
      county: v.optional(v.string()),
      description: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      difficulty: v.number(),
      familyFriendly: v.boolean(),
      roadAccessibility: v.number(),
      accessType: v.optional(v.string()),
      terrain: v.optional(v.string()),
      landStatus: v.string(),
      permitRequired: v.boolean(),
      permitInfo: v.optional(v.string()),
      bestSeasons: v.array(v.string()),
      typicalFinds: v.array(v.string()),
      hazardWarnings: v.optional(v.string()),
      stewardshipNotes: v.optional(v.string()),
      photos: v.array(v.string()),
      parkingInfo: v.optional(v.string()),
      directions: v.optional(v.string()),
      numVisits: v.optional(v.number()),
      numFinds: v.optional(v.number()),
      numTripLogs: v.optional(v.number()),
      avgDifficulty: v.optional(v.number()),
      avgAccess: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getInternal = internalQuery({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const toggleFavorite = mutation({
  args: { locationId: v.id("locations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("locationId"), args.locationId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("favorites", {
        userId,
        locationId: args.locationId,
      });
    }
    return null;
  },
});

export const isFavorited = query({
  args: { locationId: v.id("locations") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("locationId"), args.locationId))
      .first();

    return !!existing;
  },
});
