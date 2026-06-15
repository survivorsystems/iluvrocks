import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveLocationPhoto = mutation({
  args: {
    locationId: v.id("locations"),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    category: v.string(), // "Finds", "Access", "Parking", "Terrain", "Hazards", "General"
  },
  returns: v.id("locationPhotos"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("File not found");

    return await ctx.db.insert("locationPhotos", {
      locationId: args.locationId,
      userId,
      storageId: args.storageId,
      url,
      caption: args.caption,
      category: args.category,
      status: "approved",
    });
  },
});
