import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listRooms = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chatRooms"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      slug: v.string(),
      icon: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("chatRooms").collect();
  },
});

export const getRoom = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("chatRooms"),
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
      .query("chatRooms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listMessages = query({
  args: { roomId: v.id("chatRooms") },
  returns: v.array(
    v.object({
      _id: v.id("chatMessages"),
      _creationTime: v.number(),
      roomId: v.id("chatRooms"),
      userId: v.id("users"),
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
      .query("chatMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(50);

    const result = [];
    for (const msg of messages) {
      const user = await ctx.db.get(msg.userId);
      result.push({
        ...msg,
        user: {
          name: user?.name,
          image: user?.image,
        },
      });
    }
    return result.reverse();
  },
});

export const sendMessage = mutation({
  args: { roomId: v.id("chatRooms"), text: v.string(), imageUrl: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("chatMessages", {
      roomId: args.roomId,
      userId,
      text: args.text,
      imageUrl: args.imageUrl,
    });
    return null;
  },
});
