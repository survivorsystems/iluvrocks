import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let ads;
    if (args.category) {
      ads = await ctx.db
        .query("classifieds")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else if (args.state) {
      ads = await ctx.db
        .query("classifieds")
        .withIndex("by_state", (q) => q.eq("state", args.state!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else {
      ads = await ctx.db
        .query("classifieds")
        .filter((q) => q.eq(q.field("status"), "active"))
        .order("desc")
        .collect();
    }

    return await Promise.all(
      ads.map(async (ad) => {
        const user = await ctx.db.get(ad.userId);
        const imageUrls = await Promise.all(
          ad.images.map((id) => ctx.storage.getUrl(id))
        );
        return { ...ad, sellerName: user?.name, imageUrls };
      })
    );
  },
});

export const createAd = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    subCategory: v.string(),
    state: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("classifieds", {
      ...args,
      userId,
      status: "active",
    });
  },
});
