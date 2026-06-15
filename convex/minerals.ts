import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("minerals"),
      _creationTime: v.number(),
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
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("minerals").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("minerals") },
  returns: v.union(
    v.object({
      _id: v.id("minerals"),
      _creationTime: v.number(),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
