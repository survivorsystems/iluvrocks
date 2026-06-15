import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";

export const getLocationDetails = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) return null;

    const findReports = await ctx.db
      .query("findReports")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .take(10);

    const tripLogs = await ctx.db
      .query("tripLogs")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .take(10);

    const photos = await ctx.db
      .query("locationPhotos")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    const comments = await ctx.db
      .query("locationComments")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .collect();

    const weather = await ctx.db
      .query("weatherCache")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .first();

    const typicalMinerals = await ctx.db
      .query("locationMinerals")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    const mineralsWithDetails = await Promise.all(
      typicalMinerals.map(async (m) => {
        const detail = await ctx.db.get(m.mineralId);
        return { ...m, detail };
      })
    );

    // Hydrate users and resolve photos for logs and finds
    const hydrateUser = async (doc: any) => {
      const user = (await ctx.db.get(doc.userId)) as Doc<"users"> | null;
      const photoUrls = doc.photos ? await Promise.all(
        doc.photos.map((id: Id<"_storage">) => ctx.storage.getUrl(id))
      ) : [];
      
      return { 
        ...doc, 
        user: { 
          name: user?.name, 
          image: user?.image, 
          username: user?.username 
        },
        photoUrls
      };
    };

    const hydratedPhotos = await Promise.all(photos.map(async (p) => {
      const user = (await ctx.db.get(p.userId)) as Doc<"users"> | null;
      return { ...p, user: { name: user?.name, image: user?.image, username: user?.username } };
    }));

    const hydratedComments = await Promise.all(comments.map(async (c) => {
      const user = (await ctx.db.get(c.userId)) as Doc<"users"> | null;
      return { ...c, user: { name: user?.name, image: user?.image, username: user?.username } };
    }));

    return {
      location,
      findReports: await Promise.all(findReports.map(hydrateUser)),
      tripLogs: await Promise.all(tripLogs.map(hydrateUser)),
      photos: hydratedPhotos,
      comments: hydratedComments,
      weather: weather ? {
        ...weather,
        temp: weather.temp,
        wind: weather.wind,
        precipitation: weather.precipitation,
        summary: weather.summary,
      } : null,
      minerals: mineralsWithDetails,
    };
  },
});

export const submitFindReport = mutation({
  args: {
    locationId: v.id("locations"),
    mineralName: v.string(),
    mineralId: v.optional(v.id("minerals")),
    photos: v.array(v.id("_storage")),
    dateFound: v.number(),
    description: v.string(),
    size: v.optional(v.string()),
    weight: v.optional(v.string()),
    toolsUsed: v.optional(v.array(v.string())),
    isPrivate: v.boolean(),
    approximateCoordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("findReports", {
      ...args,
      userId,
      status: "approved",
    });
  },
});

export const submitTripLog = mutation({
  args: {
    locationId: v.id("locations"),
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
    photos: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("tripLogs", {
      ...args,
      userId,
      status: "approved",
    });
  },
});

export const addComment = mutation({
  args: {
    locationId: v.id("locations"),
    text: v.string(),
    isQuestion: v.optional(v.boolean()),
    parentId: v.optional(v.id("locationComments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("locationComments", {
      ...args,
      userId,
      status: "approved",
    });
  },
});

export const uploadPhoto = mutation({
  args: {
    locationId: v.id("locations"),
    url: v.string(),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.db.insert("locationPhotos", {
      ...args,
      userId,
      status: "approved",
    });
  },
});
