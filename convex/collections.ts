import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("collectionItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createItem = mutation({
  args: {
    name: v.string(),
    origin: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const photoUrl = args.storageId ? await ctx.storage.getUrl(args.storageId) : null;

    return await ctx.db.insert("collectionItems", {
      userId,
      name: args.name,
      origin: args.origin,
      status: args.status,
      notes: args.notes,
      storageId: args.storageId,
      photoUrl: photoUrl ?? undefined,
      createdAt: Date.now(),
    });
  },
});
